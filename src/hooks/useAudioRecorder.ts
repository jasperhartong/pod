import { useState, useEffect } from "react";
import utils from "audio-buffer-utils";
import {
  AudioContext,
  IAudioContext,
  IAnalyserNode,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

let blobsRef: Blob[] = [];

/*
  IDLE -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTEN_ERROR -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTENING -> [start_recording] -> RECORDING
  RECORDING -> [stop_recording] -> LISTENING
  LISTENING -> [stop_listening] -> IDLE
 */

type AudioRecorderState = "idle" | "listening" | "recording" | "listen_error";
interface IAudioRecorderState {
  state: AudioRecorderState;
  isError: boolean;
}

interface IStateIdle extends IAudioRecorderState {
  state: "idle";
  isError: false;
  audioContext?: AudioContext;
}

interface IStateListening extends IAudioRecorderState {
  state: "listening";
  isError: false;
  audioContext: AudioContext;
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
  audioAnalyzer: IAnalyserNode<IAudioContext>;
}

interface IStateRecording extends IAudioRecorderState {
  state: "recording";
  isError: false;
  audioContext: AudioContext;
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
  audioAnalyzer: IAnalyserNode<IAudioContext>;
  mediaRecorder: MediaRecorder;
}

interface IStateListenError extends IAudioRecorderState {
  state: "listen_error";
  isError: true;
}

type AnyRecorderState =
  | IStateIdle
  | IStateListening
  | IStateRecording
  | IStateListenError;

const useAudioRecorder = () => {
  const [recorderState, setRecorderState] = useState<AnyRecorderState>({
    state: "idle",
    isError: false,
  });
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();

  useEffect(() => {
    // FIME: Clean up not really working as it contains stale state
    // So for now it needs to be called upon unmount from outside..
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

  const startListening = () => {
    if (
      !(
        recorderState.state === "idle" || recorderState.state === "listen_error"
      )
    ) {
      return;
    }

    const audioContext =
      recorderState.state === "idle" && recorderState.audioContext
        ? recorderState.audioContext
        : new AudioContext();

    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
        const mediaStreamSource = audioContext.createMediaStreamSource(stream);
        const audioAnalyzer = audioContext.createAnalyser();
        // audioAnalyzer.fftSize = 64
        mediaStreamSource.connect(audioAnalyzer);

        setRecorderState({
          state: "listening",
          isError: false,
          audioContext,
          audioAnalyzer,
          mediaStreamSource,
        });
      })
      .catch((error) => {
        console.error(error);
        setRecorderState({
          state: "listen_error",
          isError: true,
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
      blobsRef.push(data);
      setAudioBlobs([...blobsRef]);

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
      mediaStreamSource: recorderState.mediaStreamSource,
      audioContext: recorderState.audioContext,
      audioAnalyzer: recorderState.audioAnalyzer,
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
      audioAnalyzer: recorderState.audioAnalyzer,
      mediaStreamSource: recorderState.mediaStreamSource,
    });
  };

  const stopListening = () => {
    if (recorderState.state !== "listening") {
      return;
    }
    killMediaAudioStream(recorderState.mediaStreamSource);
    setRecorderState({
      state: "idle",
      isError: false,
      audioContext: recorderState.audioContext,
    });
  };

  const getFrequencyData = (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => {
    if (
      !(
        recorderState.state === "listening" ||
        recorderState.state === "recording"
      )
    ) {
      return;
    }
    const bufferLength = recorderState.audioAnalyzer.frequencyBinCount;
    const amplitudeArray = new Uint8Array(bufferLength);
    recorderState.audioAnalyzer.getByteFrequencyData(amplitudeArray);
    callback(amplitudeArray);
  };

  const state = {
    recorderState,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    getFrequencyData,
    cleanup,
  };

  const data = {
    audioBlobs,
    combine: async () => {
      if (
        recorderState.state === "recording" ||
        recorderState.state === "listen_error"
      ) {
        return;
      }
      if (audioBlobs) {
        const concatted = await concatAudioBlobs(
          audioBlobs,
          recorderState.audioContext || new AudioContext()
        );
        blobsRef = [concatted];
        setAudioBlobs([concatted]);
      }
    },
    clear: async () => {
      if (recorderState.state === "recording") {
        return;
      }
      blobsRef = [];
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