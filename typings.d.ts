declare module "jstoxml";
declare module "uuid4";

// TODO, make it extend from typing: import SmoothScroll as origSmoothScroll from "smooth-scroll";
declare module "smooth-scroll/dist/smooth-scroll";

declare module "react-player/lib/players/FilePlayer" {
  import ReactPlayer from "react-player";
  export default class FilePlayer extends ReactPlayer {}
}
