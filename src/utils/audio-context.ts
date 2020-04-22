import utils from "audio-buffer-utils";
import {
  AudioContext,
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";
import toWav from "audiobuffer-to-wav";

// Try to reuse the audiocontext as much as possible...
// Safari will error out when you've start more then 4 in 1 session
let globalAudioContext: AudioContext | undefined = undefined;

export const getAudioContext = () => {
  const audioContext = globalAudioContext || new AudioContext();
  if (audioContext.state === "suspended") {
    console.debug(`useAudioRecorder:: resumed`);
    audioContext.resume();
  }
  return audioContext;
};

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
  mediaStreamSource?: IMediaStreamAudioSourceNode<IAudioContext>
) => {
  if (mediaStreamSource) {
    // removes red icon
    return mediaStreamSource.mediaStream
      .getTracks()
      .forEach((track) => track.stop());
  }
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

export const blobToFile = (theBlob: Blob, fileName: string): File => {
  var b: any = theBlob;
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date();
  b.name = fileName;

  //Cast to a File() type
  return theBlob as File;
};
