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
}

interface IStateListening extends IAudioRecorderState {
  state: "listening";
  isError: false;
}

interface IStateRecording extends IAudioRecorderState {
  state: "recording";
  isError: false;
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

// Try to reuse the audiocontext as much as possible...
// Safari will error out when you've start more then 4 in 1 session
let globalAudioContext: AudioContext | undefined = undefined;

const getAudioContext = () => {
  const audioContext = globalAudioContext || new AudioContext();
  if (audioContext.state === "suspended") {
    console.debug(`useAudioRecorder:: resumed`);
    audioContext.resume();
  }
  return audioContext;
};

interface AudioRecorderOptions {
  fileName: string;
  onFinishRecording?: (file: File) => void;
}

const useAudioRecorder = (options: AudioRecorderOptions) => {
  /* REFERENCES */
  const mediaStreamSourceRef = useRef<
    IMediaStreamAudioSourceNode<IAudioContext>
  >();
  const audioAnalyzerRef = useRef<IAnalyserNode<IAudioContext>>();
  const mediaRecorderRef = useRef<MediaRecorder>();

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
    const audioContext = getAudioContext();
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

        mediaStreamSourceRef.current = mediaStreamSource;
        audioAnalyzerRef.current = audioAnalyzer;
        setRecorderState({
          state: "listening",
          isError: false,
        });

        teardownMethodsRef.current.push(() => {
          killMediaAudioStream(mediaStreamSourceRef.current);
          mediaStreamSourceRef.current = undefined;
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

  const startRecording = (timeSlice: number = 3000) => {
    if (!mediaStreamSourceRef.current) {
      return;
    }
    mediaRecorderRef.current = new MediaRecorder(
      mediaStreamSourceRef.current.mediaStream.clone()
    );

    const handleDataAvailable = (event: Event) => {
      const { data } = (event as unknown) as BlobEvent;
      console.debug(
        `useAudioRecorder:: handleDataAvailable: ${data.type} - ${data.size}`
      );
      if (!isMountedRef.current) {
        return console.debug(
          `useAudioRecorder:: handleDataAvailable ignored: not mounted`
        );
      }

      if (data.size > 0) {
        // complex way of setting state.. these exotic objects seem to require this..
        blobsRef.current.push(data);
        setAudioBlobs([...blobsRef.current]);
      }

      if (!mediaRecorderRef.current) {
        return console.debug(
          `useAudioRecorder:: handleDataAvailable not continuing: no mediaRecorder`
        );
      }

      // if (data.size === 44) {
      //   alert(
      //     "Er is iets fouts gegaan bij de opname. Gebruik je toevallig Airpods op Safari? Deze combinatie werkt niet"
      //   );
      //   return setRecorderState({ state: "idle", isError: false });
      // }

      // Continue requesting data every timeSlice while recording
      if (mediaRecorderRef.current.state === "recording") {
        setTimeout(() => {
          if (
            mediaRecorderRef.current &&
            mediaRecorderRef.current.state === "recording"
          ) {
            mediaRecorderRef.current.requestData();
          }
        }, timeSlice);
      }
    };

    // Setup event listener before starting to capture also data when stopped before end of timeSlice
    mediaRecorderRef.current.addEventListener(
      "dataavailable",
      handleDataAvailable
    );

    // Start recording
    mediaRecorderRef.current.start(/* timeSlice does not work well in all browsers, mocked with timeout */);

    teardownMethodsRef.current.push(() => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = undefined;
    });

    setRecorderState({
      state: "recording",
      isError: false,
    });

    // Start requesting data every timeSlice
    setTimeout(() => {
      if (
        mediaRecorderRef.current &&
        mediaRecorderRef.current.state === "recording"
      ) {
        mediaRecorderRef.current.requestData();
      }
    }, timeSlice);
  };

  const pauseRecording = () => {
    if (!mediaRecorderRef.current) {
      return console.debug(
        `useAudioRecorder:: pauseRecording ignoring: no mediaRecorder`
      );
    }

    mediaRecorderRef.current.stop();

    setRecorderState({
      state: "listening",
      isError: false,
    });
  };

  const finishRecording = async () => {
    if (data.audioBlobs) {
      const blob = await concatAudioBlobs(data.audioBlobs, getAudioContext());
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
    killMediaAudioStream(mediaStreamSourceRef.current);
    setRecorderState({
      state: "idle",
      isError: false,
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
      return console.debug(`useAudioRecorder:: getFrequencyData rejected`);
    }

    if (!isMountedRef.current) {
      return console.debug(
        `useAudioRecorder:: getFrequencyData ignored: not mounted`
      );
    }

    if (!audioAnalyzerRef.current) {
      return console.debug(
        `useAudioRecorder:: getFrequencyData ignored: no analyzer`
      );
    }

    const bufferLength = audioAnalyzerRef.current.frequencyBinCount;
    const amplitudeArray = new Uint8Array(bufferLength);
    audioAnalyzerRef.current.getByteFrequencyData(amplitudeArray);

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
        const concatted = await concatAudioBlobs(audioBlobs, getAudioContext());
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
