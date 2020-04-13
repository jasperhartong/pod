import { useState } from "react";
import utils from "audio-buffer-utils";

let recorder: MediaRecorder;
let blobs: Blob[] = [];

const useAudioRecorder = (interval: number = 1000) => {
  const [audioBlobs, setAudioBlobs] = useState<Blob[]>();

  const start = () => {
    navigator.mediaDevices.getUserMedia({ audio: true }).then((stream) => {
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
      setTimeout(() => {
        if (recorder.state === "recording") {
          recorder.requestData();
        }
      }, interval);
    });
  };

  const stop = () => {
    recorder.stop();
    setAudioBlobs([utils.concat(...blobs)]);
  };

  const clear = () => {
    blobs = [];
    setAudioBlobs([...blobs]);
  };

  return { start, stop, clear, audioBlobs };
};

export default useAudioRecorder;
