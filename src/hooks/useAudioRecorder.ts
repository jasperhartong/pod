import { useState, useEffect } from "react";
import utils from "audio-buffer-utils";
import { AudioContext, IAudioContext } from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

let recorder: MediaRecorder | null;
let blobs: Blob[] = [];

const concatAudioBlobs = async (
  audioBlobs: Blob[],
  audioContext: IAudioContext
): Promise<Blob> => {
  const audioBuffers = await Promise.all(
    audioBlobs.map(async (a) => {
      const arrayBuffer = await new Response(a).arrayBuffer();
      return audioContext.decodeAudioData(arrayBuffer);
    })
  );
  const concattedAudioBuffers = utils.concat(...audioBuffers);
  const wavArrayBuffer = toWav(concattedAudioBuffers);
  const concattedAudioBlob = new Blob([wavArrayBuffer], {
    type: "audio/wav",
  });
  return concattedAudioBlob;
};

const useAudioRecorder = (interval: number = 4000) => {
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();
  const [audioContext, setAudioContext] = useState<IAudioContext>();

  useEffect(() => {
    setAudioContext(new AudioContext());
  }, []);

  const start = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
      // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
      recorder = new MediaRecorder(stream);

      recorder.addEventListener("dataavailable", (event: Event) => {
        const { data } = (event as unknown) as BlobEvent;
        blobs.push(data);
        setAudioBlobs([...blobs]);

        if (recorder && recorder.state === "recording") {
          setTimeout(() => {
            if (recorder && recorder.state === "recording") {
              recorder.requestData();
            }
          }, interval);
        }
      });

      // Start recording
      recorder.start();
      setTimeout(() => {
        if (recorder && recorder.state === "recording") {
          recorder.requestData();
        }
      }, interval);
    });
  };

  const stop = async () => {
    if (recorder) {
      recorder.stop();
      recorder = null;
      // Converting
      if (audioBlobs && audioContext) {
        const concatted = await concatAudioBlobs(audioBlobs, audioContext);
        setAudioBlobs([concatted]);
      }
    }
  };

  const clear = () => {
    blobs = [];
    setAudioBlobs([...blobs]);
  };

  return { start, stop, clear, audioBlobs };
};

export default useAudioRecorder;
