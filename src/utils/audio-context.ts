import {
  AudioContext,
  IAudioContext,
  IMediaStreamAudioSourceNode,
} from "standardized-audio-context";

// Try to reuse the audiocontext as much as possible...
// Safari will error out when you've start more then 4 in 1 session
let globalAudioContext: AudioContext | undefined = undefined;

export const getAudioContext = async () => {
  if (!globalAudioContext) {
    globalAudioContext = new AudioContext();
  }

  if (globalAudioContext.state === "suspended") {
    // TODO: might also be needed to resum on focus. But let's see
    console.debug(`useAudioRecorder:: resumed`);
    await globalAudioContext.resume();
  }
  return globalAudioContext;
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

export const killMediaStreamAudioSourceNode = (
  mediaStreamSource?: IMediaStreamAudioSourceNode<IAudioContext>
) => {
  if (mediaStreamSource) {
    return killMediaStream(mediaStreamSource.mediaStream);
  }
};

export const killMediaStream = (
  mediaStream: IMediaStreamAudioSourceNode<IAudioContext>["mediaStream"]
) => {
  // removes red icon
  return mediaStream.getTracks().forEach((track) => track.stop());
};

export const blobToFile = (theBlob: Blob, fileName: string): File => {
  var b: any = theBlob;
  //A Blob() is almost a File() - it's just missing the two properties below which we will add
  b.lastModifiedDate = new Date();
  b.name = fileName;

  //Cast to a File() type
  return theBlob as File;
};

// https://stackoverflow.com/questions/15900485/correct-way-to-convert-size-in-bytes-to-kb-mb-gb-in-javascript
export const formatBytes = (bytes: number, decimals = 2) => {
  if (bytes === 0) return "0 Bytes";

  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + " " + sizes[i];
};
