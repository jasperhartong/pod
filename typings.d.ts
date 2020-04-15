declare module "jstoxml";
declare module "uuid4";
declare module "audio-buffer-utils";

declare module "smooth-scroll/dist/smooth-scroll" {
  import SM from "smooth-scroll";
  export default class SmoothScroll extends SM {}
}

declare module "react-player/lib/players/FilePlayer" {
  import ReactPlayer from "react-player";
  export default class FilePlayer extends ReactPlayer {}
}

declare module "audiobuffer-to-wav" {
  export default toWav = (audiobuffer: AudioBuffer) =>
    any; /* Should be ArrayBuffer ... */
}
