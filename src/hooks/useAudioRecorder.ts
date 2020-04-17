import { useState, useEffect } from "react";
import utils from "audio-buffer-utils";
import {
  AudioContext,
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

let blobs: Blob[] = [];

/*
  INITIAL -> [init] -> INITIATED | INIT_ERROR
  INITIATED -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTEN_ERROR -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTENING -> [start_recording] -> RECORDING
  RECORDING -> [stop_recording] -> LISTENING
  LISTENING -> [stop_listening] -> INITIATED
 */

type AudioRecorderState =
  | "initial"
  | "initiated"
  | "listening"
  | "recording"
  | "init_error"
  | "listen_error";
interface IAudioRecorderState {
  state: AudioRecorderState;
  isError: boolean;
}

interface IStateInitial extends IAudioRecorderState {
  state: "initial";
  isError: false;
}

interface IStateInitiated extends IAudioRecorderState {
  state: "initiated";
  isError: false;
  audioContext: AudioContext;
}

interface IStateListening extends IAudioRecorderState {
  state: "listening";
  isError: false;
  audioContext: AudioContext;
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
}

interface IStateRecording extends IAudioRecorderState {
  state: "recording";
  isError: false;
  audioContext: AudioContext;
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
  mediaRecorder: MediaRecorder;
}

interface IStateListenError extends IAudioRecorderState {
  state: "listen_error";
  isError: true;
  audioContext: AudioContext;
}

interface IStateInitError extends IAudioRecorderState {
  state: "init_error";
  isError: true;
}

type AnyRecorderState =
  | IStateInitial
  | IStateInitiated
  | IStateListening
  | IStateRecording
  | IStateListenError
  | IStateInitError;

const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<AnyRecorderState>({
    state: "initial",
    isError: false,
  });
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();

  useEffect(() => {
    console.info("useAudioRecorder:: init");
    init();
    //FIME: Clean up not really working as it contains stale state
    return () => cleanup();
  }, []);

  const cleanup = () => {
    console.info("useAudioRecorder:: cleanup");
    console.info(recorderState);
    try {
      // @ts-ignore
      recorderState.mediaRecorder.stop();
      console.info("useAudioRecorder:: cleanup recording");
    } catch (error) {}
    try {
      // @ts-ignore
      killMediaAudioStream(recorderState.mediaStreamSource);
      console.info("useAudioRecorder:: cleanup stream");
    } catch (error) {}
  };

  const init = () => {
    if (recorderState.state !== "initial") {
      return;
    }
    try {
      const audioContext = new AudioContext();
      setRecorderState({
        state: "initiated",
        isError: false,
        audioContext,
      });
    } catch (error) {
      console.error(error);
      setRecorderState({
        state: "init_error",
        isError: true,
      });
    }
  };

  const startListening = () => {
    if (
      !(
        recorderState.state === "initiated" ||
        recorderState.state === "listen_error"
      )
    ) {
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
        const mediaStreamSource = recorderState.audioContext.createMediaStreamSource(
          stream
        );
        setRecorderState({
          state: "listening",
          isError: false,
          audioContext: recorderState.audioContext,
          mediaStreamSource,
        });
      })
      .catch((error) => {
        console.error(error);
        setRecorderState({
          state: "listen_error",
          isError: true,
          audioContext: recorderState.audioContext,
        });
      });
  };

  const startRecording = (segmentDuration: number = 3000) => {
    if (recorderState.state !== "listening") {
      return;
    }
    const localMediaRecorder = new MediaRecorder(
      recorderState.mediaStreamSource.mediaStream
    );

    // Setup event listener before starting to capture also data when stopped before end of segmentDuration
    localMediaRecorder.addEventListener("dataavailable", (event: Event) => {
      const { data } = (event as unknown) as BlobEvent;
      // complex way of setting state.. these exotic objects seem to require this..
      blobs.push(data);
      setAudioBlobs([...blobs]);

      // Continue requesting data every segmentDuration while recording
      if (localMediaRecorder.state === "recording") {
        setTimeout(() => {
          if (localMediaRecorder.state === "recording") {
            localMediaRecorder.requestData();
          }
        }, segmentDuration);
      }
    });

    // Start recording
    localMediaRecorder.start();

    setRecorderState({
      state: "recording",
      isError: false,
      audioContext: recorderState.audioContext,
      mediaStreamSource: recorderState.mediaStreamSource,
      mediaRecorder: localMediaRecorder,
    });

    // Start requesting data every segmentDuration
    setTimeout(() => {
      if (localMediaRecorder.state === "recording") {
        localMediaRecorder.requestData();
      }
    }, segmentDuration);
  };

  const stopRecording = () => {
    if (recorderState.state !== "recording") {
      return;
    }
    recorderState.mediaRecorder.stop();
    setRecorderState({
      state: "listening",
      isError: false,
      audioContext: recorderState.audioContext,
      mediaStreamSource: recorderState.mediaStreamSource,
    });
  };

  const stopListening = () => {
    if (recorderState.state !== "listening") {
      return;
    }
    killMediaAudioStream(recorderState.mediaStreamSource);
    setRecorderState({
      state: "initiated",
      isError: false,
      audioContext: recorderState.audioContext,
    });
  };

  const state = {
    recorderState,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
  };

  const data = {
    audioBlobs,
    combine: async () => {
      if (
        recorderState.state === "initial" ||
        recorderState.state === "init_error" ||
        recorderState.state === "recording"
      ) {
        return;
      }
      if (audioBlobs) {
        const concatted = await concatAudioBlobs(
          audioBlobs,
          recorderState.audioContext
        );
        setAudioBlobs([concatted]);
      }
    },
    clear: async () => {
      if (recorderState.state === "recording") {
        return;
      }
      setAudioBlobs(undefined);
    },
  };

  return {
    state,
    data,
  };
};

export default useAudioRecorder;

// audio-utils
const killMediaAudioStream = (
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>
) => {
  // removes red icon
  return mediaStreamSource.mediaStream
    .getTracks()
    .forEach((track) => track.stop());
};

const bufferFromBlob = async (
  audioBlob: Blob,
  context: IAudioContext
): Promise<AudioBuffer> => {
  const arrayBuffer = await new Response(audioBlob).arrayBuffer();
  return context.decodeAudioData(arrayBuffer);
};

const blobFromBuffer = (audioBuffer: AudioBuffer): Blob => {
  const wavArrayBuffer = toWav(audioBuffer);
  return new Blob([wavArrayBuffer], {
    type: "audio/wav",
  });
};

const concatAudioBlobs = async (
  audioBlobs: Blob[],
  context: IAudioContext
): Promise<Blob> => {
  const audioBuffers = await Promise.all(
    audioBlobs.map(async (a) => {
      return await bufferFromBlob(a, context);
    })
  );
  const concattedAudioBuffers = utils.concat(...audioBuffers);
  const concattedAudioBlob = blobFromBuffer(concattedAudioBuffers);

  return concattedAudioBlob;
};
