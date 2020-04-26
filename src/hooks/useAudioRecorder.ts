import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import {
  IAudioContext,
  IAnalyserNode,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import {
  getAudioContext,
  setupStreamWithAnalyzer,
  killMediaAudioStream,
  concatAudioBlobs,
  blobToFile,
} from "../utils/audio-context";

interface TearDowns {
  mediaStreamSource?: () => void;
  mediaRecorder?: () => void;
  recordingInterval?: () => void;
}

interface ImmerState {
  isListening: boolean;
  isRecording: boolean;
  dataSeconds: number;
  dataSize: number;
  dataType?:
    | "audio/mpeg" /* polyfill (safari) */
    | "audio/webm" /* Chrome */
    | "audio/ogg" /* Firefox */;
  error?: Error;
}

const ImmerStartState: ImmerState = {
  isListening: false,
  isRecording: false,
  dataSeconds: 0,
  dataSize: 0,
};

const useAudioRecorder = () => {
  /* REFERENCES */
  const isMountedRef = useRef<boolean>(false);
  const blobsRef = useRef<Blob[]>([]);
  const audioAnalyzerRef = useRef<IAnalyserNode<IAudioContext>>();
  const mediaRecorderRef = useRef<MediaRecorder>();
  const mediaStreamSourceRef = useRef<
    IMediaStreamAudioSourceNode<IAudioContext>
  >();
  const recordingIntervalRef = useRef<ReturnType<typeof setInterval>>();
  const tearDownRefs = useRef<TearDowns>({});

  /* STATE */
  const [state, dispatch] = useImmer<ImmerState>(ImmerStartState);

  /* SIDE EFFECT CLEAN UP ON UNMOUNT */
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      __tearDown();
    };
  }, []);

  const __tearDown = async () => {
    Object.values(tearDownRefs.current).forEach((method) => {
      if (method) {
        try {
          console.debug(`useAudioRecorder:: cleanup ${method.toString()}`);
          (method as () => void)();
        } catch (error) {
          console.debug(`useAudioRecorder:: cleanup failed`);
          console.debug(error);
        }
      }
    });
    tearDownRefs.current = {};
  };

  /* STATE TRANSTION ACTIONS */
  const startListening = async () => {
    if (state.isListening) {
      return;
    }

    // Reuse audioContext if used before
    const audioContext = await getAudioContext();
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

        tearDownRefs.current["mediaStreamSource"] = () => {
          killMediaAudioStream(mediaStreamSourceRef.current);
          mediaStreamSourceRef.current = undefined;
        };

        dispatch((state) => {
          state.isListening = true;
          state.error = undefined;
        });
      })
      .catch((error) => {
        console.error(error);
        dispatch((state) => {
          state.isListening = false;
          state.error = error;
        });
      });
  };

  const __handleDataAvailable = (event: Event, timeSlice?: number) => {
    if (!isMountedRef.current) {
      return console.debug(
        `useAudioRecorder:: handleDataAvailable ignored: not mounted`
      );
    }

    const { data } = (event as unknown) as BlobEvent;
    console.debug(
      `useAudioRecorder:: handleDataAvailable: ${data.type} - ${data.size}`
    );

    if (data.size > 0) {
      blobsRef.current.push(data);

      // Update hasData state
      dispatch((state) => {
        state.dataSize = state.dataSize + data.size;
        state.dataType = data.type as ImmerState["dataType"];
      });
    }

    // Continue requesting data every timeSlice while recording
    if (timeSlice && mediaRecorderRef.current?.state === "recording") {
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      }, timeSlice);
    }
  };

  const startRecording = (timeSlice?: number) => {
    if (state.isRecording || !mediaStreamSourceRef.current) {
      return;
    }

    // instantiate new MediaRecorder based on current stream
    mediaRecorderRef.current = new MediaRecorder(
      mediaStreamSourceRef.current.mediaStream.clone()
    );

    // Setup event listener before starting to capture also data when stopped before end of timeSlice
    mediaRecorderRef.current.addEventListener("dataavailable", (event: Event) =>
      __handleDataAvailable(event, timeSlice)
    );

    // Actually start recording
    mediaRecorderRef.current.start(/* timeSlice does not work well in all browsers, mocked with timeout */);
    // Register mediaRecorder related teardown
    tearDownRefs.current["mediaRecorder"] = () => {
      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = undefined;
    };

    // Set up interval to track recording time
    recordingIntervalRef.current = setInterval(() => {
      dispatch((state) => {
        state.dataSeconds = state.dataSeconds + 1;
      });
    }, 1000);
    // Register related teardown
    tearDownRefs.current["recordingInterval"] = () => {
      clearInterval(recordingIntervalRef.current!);
      recordingIntervalRef.current = undefined;
    };

    // Start requesting data every timeSlice (otherwise __handleDataAvailable only called on stop)
    if (timeSlice && mediaRecorderRef.current?.state === "recording") {
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      }, timeSlice);
    }

    // Transition into isRecording
    dispatch((state) => {
      state.isRecording = true;
      state.error = undefined;
    });
  };

  const stopRecording = () => {
    if (!state.isRecording) {
      return console.debug(
        `useAudioRecorder:: stopRecording ignoring: already recording`
      );
    }

    if (!mediaRecorderRef.current) {
      return console.debug(
        `useAudioRecorder:: stopRecording ignoring: no mediaRecorder`
      );
    }

    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = undefined;
    if (recordingIntervalRef.current) {
      clearInterval(recordingIntervalRef.current);
      recordingIntervalRef.current = undefined;
    }

    dispatch((state) => {
      state.isRecording = false;
      state.error = undefined;
    });
  };

  const stopListening = () => {
    if (!state.isListening) {
      return console.debug(
        `useAudioRecorder:: stopListening ignoring: not listening`
      );
    }
    killMediaAudioStream(mediaStreamSourceRef.current);

    dispatch((state) => {
      state.isListening = false;
      state.error = undefined;
    });
  };

  /* STATE ACTIONS (no transition) */
  const getFrequencyData = (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => {
    if (!state.isListening) {
      return console.debug(
        `useAudioRecorder:: getFrequencyData ignored: not listening`
      );
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

  const extractBlobs = async () => {
    if (state.isRecording) {
      return undefined;
    }

    if (!blobsRef.current || blobsRef.current.length === 0) {
      return undefined;
    }

    return blobsRef.current;
  };

  const clearData = async () => {
    blobsRef.current = [];
    dispatch((state) => {
      state.dataSize = 0;
      state.dataSeconds = 0;
    });
  };

  return {
    ...state,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    getFrequencyData,
    extractBlobs,
    clearData,
  };
};

export default useAudioRecorder;
