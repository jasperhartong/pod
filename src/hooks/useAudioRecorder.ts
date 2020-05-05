import { useEffect, useRef } from "react";
import { useImmer } from "use-immer";
import { killMediaStream } from "../utils/audio-context";
import {
  IAudioContext,
  IAnalyserNode,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import {
  getAudioContext,
  setupStreamWithAnalyzer,
  killMediaStreamAudioSourceNode,
} from "../utils/audio-context";

interface TearDowns {
  listening?: () => Promise<void>;
  recording?: () => Promise<void>;
}

interface ImmerState {
  isRequestingAccess: boolean;
  isListening: boolean;
  isRecording: boolean;
  dataSeconds: number;
  dataBlobs: Blob[];
  dataSize: number;
  error?: Error;
}

const ImmerStartState: ImmerState = {
  isRequestingAccess: false,
  isListening: false,
  isRecording: false,
  dataBlobs: [],
  dataSeconds: 0,
  dataSize: 0,
};

const useAudioRecorder = () => {
  /* REFERENCES */
  const isMountedRef = useRef<boolean>(false);
  const blobsRef = useRef<Blob[]>([]);
  const audioAnalyzerRef = useRef<IAnalyserNode<IAudioContext>>();
  // MediaRecord type comes from @types/dom-mediacapture-record
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
      tearDown("recording");
      tearDown("listening");
    };
  }, []);

  const tearDown = async (key: keyof TearDowns) => {
    try {
      const teardownMethod = tearDownRefs.current[key];
      if (teardownMethod !== undefined) {
        console.debug(
          `useAudioRecorder:: tearDown ${teardownMethod.toString()}`
        );
        await teardownMethod();
      }
    } catch (error) {
      console.debug(`useAudioRecorder:: teardown failed`);
      console.debug(error);
    }

    tearDownRefs.current[key] = undefined;
  };

  /* STATE TRANSTION ACTIONS */
  const startListening = async () => {
    if (state.isListening) {
      return;
    }
    dispatch((state) => {
      state.isRequestingAccess = true;
    });

    // Reuse audioContext if used before
    const audioContext = await getAudioContext();

    return new Promise((resolve, reject) => {
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

          tearDownRefs.current["listening"] = async () => {
            killMediaStreamAudioSourceNode(mediaStreamSourceRef.current);
            mediaStreamSourceRef.current = undefined;
          };

          dispatch((state) => {
            state.isRequestingAccess = false;
            state.isListening = true;
            state.error = undefined;
          });
          resolve();
        })
        .catch((error) => {
          console.error(error);
          dispatch((state) => {
            state.isRequestingAccess = false;
            state.isListening = false;
            state.error = error;
          });
          resolve();
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
        state.dataBlobs = blobsRef.current;
        state.dataSize = state.dataSize + data.size;
      });
    }

    // Continue requesting data every timeSlice while recording
    if (timeSlice && mediaRecorderRef.current?.state === "recording") {
      setTimeout(() => {
        if (mediaRecorderRef.current?.state === "recording") {
          mediaRecorderRef.current.requestData();
        }
      }, timeSlice);
    } else {
      // __handleDataAvailable wass called while recording stopped.
      // This means we're handling the "final" data of the recording
      // So, we should teardown the recording
      tearDown("recording");
    }
  };

  const startRecording = async (timeSlice?: number) => {
    if (state.isRecording) {
      return console.debug(
        `useAudioRecorder:: startRecording ignored: already recording`
      );
    }
    if (!state.isListening) {
      console.debug(`useAudioRecorder:: startRecording: start listening first`);
      await startListening();
    }
    if (!mediaStreamSourceRef.current) {
      return console.debug(
        `useAudioRecorder:: startRecording ignored: no mediaStream`
      );
    }

    // instantiate new MediaRecorder based on current stream
    mediaRecorderRef.current = new MediaRecorder(
      mediaStreamSourceRef.current.mediaStream.clone()
    );

    // Setup event listener before starting to capture also data when stopped before end of timeSlice
    const handleData = (event: Event) =>
      __handleDataAvailable(event, timeSlice);
    mediaRecorderRef.current.addEventListener("dataavailable", handleData);

    // Actually start recording
    mediaRecorderRef.current.start(/* timeSlice does not work well in all browsers, mocked with timeout */);

    // Set up interval to track recording time
    recordingIntervalRef.current = setInterval(() => {
      dispatch((state) => {
        state.dataSeconds = state.dataSeconds + 1;
      });
    }, 1000);

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
      state.isListening = true;
      state.isRecording = true;
      state.error = undefined;
    });

    // Register recording related teardown
    tearDownRefs.current["recording"] = async () => {
      mediaRecorderRef.current?.removeEventListener(
        "dataavailable",
        handleData
      );

      if (mediaRecorderRef.current?.stream) {
        killMediaStream(mediaRecorderRef.current.stream);
      }

      mediaRecorderRef.current?.stop();
      mediaRecorderRef.current = undefined;

      clearInterval(recordingIntervalRef.current!);
      recordingIntervalRef.current = undefined;
    };
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

    dispatch((state) => {
      state.isRecording = false;
      state.error = undefined;
    });
    // Stop, teardown will happen in final __handleDataAvailable callback
    mediaRecorderRef.current.stop();
  };

  const stopListening = () => {
    if (!state.isListening) {
      return console.debug(
        `useAudioRecorder:: stopListening ignoring: not listening`
      );
    }

    dispatch((state) => {
      state.isListening = false;
      state.error = undefined;
    });

    tearDown("listening");
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
      state.dataBlobs = [];
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
