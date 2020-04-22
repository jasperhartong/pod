import { useState, useEffect, useRef } from "react";
import {
  AudioContext,
  IAudioContext,
  IAnalyserNode,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import {
  setupStreamWithAnalyzer,
  killMediaAudioStream,
  concatAudioBlobs,
  blobToFile,
} from "../utils/audio-context";

/*

  States & Transitions:

  idle -> [start_listening] -> listening | listen_error
  listen_error -> [start_listening] -> listening | listen_error
  listening -> [start_recording] -> recording
  recording -> [stop_recording] -> listening
  listening -> [stop_listening] -> idle
 */

export type AudioRecorderState =
  | "idle"
  | "listening"
  | "recording"
  | "listen_error";
interface IAudioRecorderState {
  state: AudioRecorderState;
  isError: boolean;
}

interface IStateIdle extends IAudioRecorderState {
  state: "idle";
  isError: false;
  // audioContext will be set when user went to "listening" before
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

interface AudioRecorderOptions {
  fileName: string;
  onFinishRecording?: (file: File) => void;
}

const useAudioRecorder = (options: AudioRecorderOptions) => {
  /* REFERENCES */
  const blobsRef = useRef<Blob[]>([]);
  const isMountedRef = useRef<boolean>(false);
  const teardownMethodsRef = useRef<(() => void)[]>([]); // TODO: make this a map instead of array to not get duplicate teardowns

  /* STATE */
  const [recorderState, setRecorderState] = useState<AnyRecorderState>({
    state: "idle",
    isError: false,
  });
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();

  /* SIDE EFFECT CLEAN UP ON UNMOUNT */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      _unmountCleanup();
    };
  }, []);

  const _unmountCleanup = async () => {
    for (const teardown of teardownMethodsRef.current) {
      console.debug(`useAudioRecorder:: cleanup ${teardown.toString()}`);
      try {
        await teardown();
      } catch (error) {
        console.debug(`useAudioRecorder:: cleanup failed`);
        console.debug(error);
      }
    }
    teardownMethodsRef.current = [];
  };

  /* STATE TRANSTION ACTIONS */
  const startListening = () => {
    if (
      !(
        recorderState.state === "idle" || recorderState.state === "listen_error"
      )
    ) {
      return;
    }

    // Reuse audioContext if used before
    const audioContext =
      recorderState.state === "idle" && recorderState.audioContext
        ? recorderState.audioContext
        : new AudioContext();

    navigator.mediaDevices
      .getUserMedia({ audio: true, video: false })
      .then((stream) => {
        console.debug(`useAudioRecorder:: onStream`);

        if (!isMountedRef.current) {
          console.debug(`useAudioRecorder:: onStream ignored`);
          return;
        }

        const { mediaStreamSource, audioAnalyzer } = setupStreamWithAnalyzer(
          audioContext,
          stream
        );

        setRecorderState({
          state: "listening",
          isError: false,
          audioContext,
          audioAnalyzer,
          mediaStreamSource,
        });

        teardownMethodsRef.current.push(() => audioContext.close());
        teardownMethodsRef.current.push(() =>
          killMediaAudioStream(mediaStreamSource)
        );

        /* // Setup resume-on-focus
        const _resumeOnFocus = () => {
          console.debug(`useAudioRecorder:: _resumeOnFocus`);
          navigator.mediaDevices.getUserMedia({ audio: true });
          // For Safari: When coming out of the background the audioContext needs to be resumed with a delay (sometimes)
          setTimeout(() => {
            if (audioContext.state === "suspended") {
              audioContext.resume();
              console.debug(`useAudioRecorder:: resumed`);
            }
          }, 1000);
        };
        window.addEventListener("focus", _resumeOnFocus);

        // Add teardown methods
        teardownMethodsRef.current.push(() =>
          window.removeEventListener("focus", _resumeOnFocus)
        ); */
      })
      .catch((error) => {
        console.error(error);
        setRecorderState({
          state: "listen_error",
          isError: true,
        });
      });
  };

  const startRecording = (timeSlice: number = 3000) => {
    if (recorderState.state !== "listening") {
      return;
    }
    const localMediaRecorder = new MediaRecorder(
      recorderState.mediaStreamSource.mediaStream.clone()
    );

    const handleDataAvailable = (event: Event) => {
      const { data } = (event as unknown) as BlobEvent;
      console.debug(
        `useAudioRecorder:: handleDataAvailable: ${data.type} - ${data.size}`
      );
      if (!isMountedRef.current) {
        console.debug(`useAudioRecorder:: handleDataAvailable ignored`);
        return;
      }

      if (data.size > 0) {
        // complex way of setting state.. these exotic objects seem to require this..
        blobsRef.current.push(data);
        setAudioBlobs([...blobsRef.current]);
      }

      // if (data.size === 44) {
      //   alert(
      //     "Er is iets fouts gegaan bij de opname. Gebruik je toevallig Airpods op Safari? Deze combinatie werkt niet"
      //   );
      //   return setRecorderState({ state: "idle", isError: false });
      // }

      // Continue requesting data every timeSlice while recording
      if (localMediaRecorder.state === "recording") {
        setTimeout(() => {
          if (localMediaRecorder.state === "recording") {
            localMediaRecorder.requestData();
          }
        }, timeSlice);
      }
    };

    // Setup event listener before starting to capture also data when stopped before end of timeSlice
    localMediaRecorder.addEventListener("dataavailable", handleDataAvailable);

    // Start recording
    localMediaRecorder.start(/* timeSlice does not work well in all browsers, mocked with timeout */);

    teardownMethodsRef.current.push(() => localMediaRecorder.stop());

    setRecorderState({
      state: "recording",
      isError: false,
      mediaStreamSource: recorderState.mediaStreamSource,
      audioContext: recorderState.audioContext,
      audioAnalyzer: recorderState.audioAnalyzer,
      mediaRecorder: localMediaRecorder,
    });

    // Start requesting data every timeSlice
    setTimeout(() => {
      if (localMediaRecorder.state === "recording") {
        localMediaRecorder.requestData();
      }
    }, timeSlice);
  };

  const pauseRecording = () => {
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

  const finishRecording = async () => {
    if (data.audioBlobs) {
      const blob = await concatAudioBlobs(
        data.audioBlobs,
        // @ts-ignore
        context.recorderState.audioContext || new AudioContext()
      );
      if (blob) {
        const file = blobToFile(blob, "");
        // TODO: Add to state
        if (options.onFinishRecording) {
          options.onFinishRecording(file);
        }
      }
    }
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

  /* STATE ACTIONS (no transition) */
  const getFrequencyData = (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => {
    if (
      !(
        recorderState.state === "listening" ||
        recorderState.state === "recording"
      )
    ) {
      console.debug(`useAudioRecorder:: getFrequencyData rejected`);
      return;
    }

    if (!isMountedRef.current) {
      console.debug(`useAudioRecorder:: getFrequencyData ignored`);
      return;
    }

    const bufferLength = recorderState.audioAnalyzer.frequencyBinCount;
    const amplitudeArray = new Uint8Array(bufferLength);
    recorderState.audioAnalyzer.getByteFrequencyData(amplitudeArray);

    // const sum = amplitudeArray.reduce((a, b) => a + b);
    // if (sum === 0) {
    //   alert(
    //     "Er is iets fouts gegaan bij de opname. Gebruik je toevallig Airpods op Safari? Deze combinatie werkt niet"
    //   );
    //   return setRecorderState({ state: "idle", isError: false });
    // }

    callback(amplitudeArray);
  };

  // const getDevices = () => {
  //   if (
  //     !(
  //       recorderState.state === "listening" ||
  //       recorderState.state === "recording"
  //     )
  //   ) {
  //     return;
  //   }
  //   mediaDevices.enumerateDevices();
  // };

  const context = {
    recorderState,
    startListening,
    stopListening,
    startRecording,
    pauseRecording,
    finishRecording,
    getFrequencyData,
  };

  /* DATA ACTIONS */
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
        /*
         * Concatting the easy way does not work well in Safari.. so.. we do it the hard way (see `concatAudioBlobs`)
         * const concatted = new Blob(audioBlobs, { type: audioBlobs[0].type }); // easy way
         */
        const concatted = await concatAudioBlobs(
          audioBlobs,
          recorderState.audioContext || new AudioContext()
        );
        blobsRef.current = [concatted];
        setAudioBlobs([concatted]);
      }
    },
    clear: async () => {
      if (recorderState.state === "recording") {
        return;
      }
      blobsRef.current = [];
      setAudioBlobs(undefined);
    },
  };

  return {
    context,
    data,
  };
};

export default useAudioRecorder;
