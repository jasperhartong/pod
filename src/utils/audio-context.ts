import utils from "audio-buffer-utils";
import {
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

export const setupStreamWithAnalyzer = (
  context: IAudioContext,
  mediaStream: MediaStream
) => {
  // TODO: Add filter? https://stackoverflow.com/questions/16949768/how-can-i-reduce-the-noise-of-a-microphone-input-with-the-web-audio-api
  const mediaStreamSource = context.createMediaStreamSource(mediaStream);
  const audioAnalyzer = context.createAnalyser();
  // audioAnalyzer.fftSize = 64
  mediaStreamSource.connect(audioAnalyzer);
  // Ensure that the anaylzer keeps alive by connecting it to the context destination (speakers)
  audioAnalyzer.connect(context.destination);
  // Add a Muted GainNode to make sure that the stream is not heared by users from the speaker
  const gainNode = context.createGain();
  gainNode.gain.value = -1;
  mediaStreamSource.connect(gainNode);
  gainNode.connect(context.destination);
  return { mediaStreamSource, audioAnalyzer };
};

export const killMediaAudioStream = (
  mediaStreamSource: IMediaStreamAudioSourceNode<IAudioContext>
) => {
  // removes red icon
  return mediaStreamSource.mediaStream
    .getTracks()
    .forEach((track) => track.stop());
};

export const bufferFromBlob = async (
  audioBlob: Blob,
  context: IAudioContext
): Promise<AudioBuffer> => {
  const arrayBuffer = await new Response(audioBlob).arrayBuffer();
  return context.decodeAudioData(arrayBuffer);
};

export const blobFromBuffer = (audioBuffer: AudioBuffer): Blob => {
  const wavArrayBuffer = toWav(audioBuffer);
  return new Blob([wavArrayBuffer], {
    type: "audio/wav",
  });
};

export const concatAudioBlobs = async (
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
