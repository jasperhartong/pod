declare module "jstoxml";
declare module "uuid4";

declare module "smooth-scroll/dist/smooth-scroll" {
  import SM from "smooth-scroll";
  export default class SmoothScroll extends SM {}
}

declare module "react-player/lib/players/FilePlayer" {
  import ReactPlayer from "react-player";
  export default class FilePlayer extends ReactPlayer {}
}
