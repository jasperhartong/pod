interface IDbThumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

export interface IImageData {
  full_url: string;
  thumbnails: IDbThumbnail[] | null;
}
