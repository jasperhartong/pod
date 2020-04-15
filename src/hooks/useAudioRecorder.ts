import { useState, useEffect } from "react";
import utils from "audio-buffer-utils";
import {
  AudioContext,
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

let audioContext: IAudioContext | null = null;
let mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>;
let recorder: MediaRecorder;
let blobs: Blob[] = [];

const useAudioRecorder = (interval: number = 4000) => {
  const [recordStatus, setRecordStatus] = useState<
    "idle" | "recording" | "error"
  >("idle");
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();

  const start = () => {
    if (recordStatus === "recording") {
      return;
    }
    clear();
    navigator.mediaDevices
      .getUserMedia({ audio: true })
      .then((stream) => {
        audioContext = new AudioContext();
        // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
        mediaStreamSource = audioContext.createMediaStreamSource(stream);
        recorder = new MediaRecorder(stream);

        recorder.addEventListener("dataavailable", (event: Event) => {
          const { data } = (event as unknown) as BlobEvent;
          blobs.push(data);
          setAudioBlobs([...blobs]);

          if (recorder.state === "recording") {
            setTimeout(() => {
              if (recorder.state === "recording") {
                recorder.requestData();
              }
            }, interval);
          }
        });

        // Start recording
        recorder.start();
        setRecordStatus("recording");
        setTimeout(() => {
          if (recorder.state === "recording") {
            recorder.requestData();
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
    recorder.stop();
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
    if (audioContext) {
      await audioContext.close();
      audioContext = null;
    }
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
