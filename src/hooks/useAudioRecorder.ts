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
}

interface ImmerState {
  isListening: boolean;
  isRecording: boolean;
  hasData: boolean;
  error?: Error;
}

const ImmerStartState: ImmerState = {
  isListening: false,
  isRecording: false,
  hasData: false,
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
  const startListening = () => {
    if (state.isListening) {
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

  const startRecording = (timeSlice: number = 3000) => {
    if (state.isRecording) {
      return;
    }

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
        blobsRef.current.push(data);

        // Update hasData state
        if (!state.hasData) {
          dispatch((state) => {
            state.hasData = true;
          });
        }
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

    tearDownRefs.current["mediaRecorder"] = () => {
      if (mediaRecorderRef.current) {
        mediaRecorderRef.current.stop();
      }
      mediaRecorderRef.current = undefined;
    };

    dispatch((state) => {
      state.isRecording = true;
      state.error = undefined;
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
    if (!state.isRecording) {
      return;
    }

    if (!mediaRecorderRef.current) {
      return console.debug(
        `useAudioRecorder:: pauseRecording ignoring: no mediaRecorder`
      );
    }

    mediaRecorderRef.current.stop();

    dispatch((state) => {
      state.isRecording = false;
      state.error = undefined;
    });
  };

  const stopListening = () => {
    if (!state.isListening) {
      return;
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

  const extractFile = async ({
    fileName,
    clear,
  }: {
    fileName: string;
    clear: boolean;
  }) => {
    let file: File | undefined = undefined;
    if (state.isRecording) {
      return undefined;
    }

    if (blobsRef.current && blobsRef.current.length > 0) {
      const superBlob = await concatAudioBlobs(
        blobsRef.current,
        getAudioContext()
      );
      if (superBlob) {
        file = blobToFile(superBlob, fileName);
      }
    }

    // Clear upon finish
    if (clear) {
      blobsRef.current = [];
      dispatch((state) => {
        state.hasData = false;
      });
    }
    return file;
  };

  return {
    ...state,
    startListening,
    stopListening,
    startRecording,
    pauseRecording,
    extractFile,
    getFrequencyData,
  };
};

export default useAudioRecorder;
