import { useState, useEffect } from "react";
import utils from "audio-buffer-utils";
import {
  AudioContext,
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

let mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
let mediaRecorder: MediaRecorder;
let blobs: Blob[] = [];

/*
  INITIAL -> [init] -> INITIATED | INIT_ERROR
  INITIATED -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTEN_ERROR -> [start_listening] -> LISTENING | LISTEN_ERROR
  LISTENING -> [start_recording] -> RECORDING
  RECORDING -> [stop_recording] -> LISTENING
  LISTENING -> [stop_listening] -> INITIATED

  INITIAL:
    - X audioContext
    - X mediaStreamSource
    - X mediaRecorder
  INITIATED:
    - √ audioContext
    - X mediaStreamSource
    - X mediaRecorder
  LISTENING:
    - √ audioContext
    - √ mediaStreamSource
    - X mediaRecorder
  RECORDING:
    - √ audioContext
    - √ mediaStreamSource
    - √ mediaRecorder
  INIT_ERROR:
    - X audioContext
    - X mediaStreamSource
    - X mediaRecorder
  LISTEN_ERROR:
    - √ audioContext
    - X mediaStreamSource
    - X mediaRecorder
 */

const useAudioRecorder = (interval: number = 4000) => {
  const [recordStatus, setRecordStatus] = useState<
    "idle" | "recording" | "error"
  >("idle");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();
  const [audioContext, setAudioContext] = useState<IAudioContext>();

  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const start = () => {
    if (!audioContext || recordStatus === "recording") {
      return;
    }
    clear();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        mediaRecorder = new MediaRecorder(stream);

        mediaRecorder.addEventListener("dataavailable", (event: Event) => {
          const { data } = (event as unknown) as BlobEvent;
          blobs.push(data);
          setAudioBlobs([...blobs]);

          if (mediaRecorder.state === "recording") {
            setTimeout(() => {
              if (mediaRecorder.state === "recording") {
                mediaRecorder.requestData();
              }
            }, interval);
          }
        });

        // Start recording
        mediaRecorder.start();
        setRecordStatus("recording");
        setTimeout(() => {
          if (mediaRecorder.state === "recording") {
            mediaRecorder.requestData();
          }
        }, interval);
      })
      .catch((error) => {
        console.error(error);
        setRecordStatus("error");
      });
  };

  const stop = async () => {
    if (recordStatus !== "recording") {
      return;
    }
    mediaRecorder.stop();
    mediaStreamSource.mediaStream.getTracks().forEach((track) => track.stop()); // removes red icon
    setRecordStatus("idle");
  };

  const combine = async () => {
    if (recordStatus === "recording") {
      return;
    }
    // Converting
    if (audioBlobs && audioContext) {
      const concatted = await concatAudioBlobs(audioBlobs, audioContext);
      setAudioBlobs([concatted]);
    }
  };

  const clear = async () => {
    if (recordStatus === "recording") {
      return;
    }
    blobs = [];
    setAudioBlobs([...blobs]);
  };

  return { start, stop, combine, clear, audioBlobs, recordStatus };
};

export default useAudioRecorder;

// audio-utils
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
