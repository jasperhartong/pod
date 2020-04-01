interface IDbThumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

type ThumbnailWidth = 100 | 200 | 64;

export interface IFileData {
  full_url: string; // what's the diff?
  url: string;
  thumbnails: IDbThumbnail[] | null;
  // thumbnail: Record<ThumbnailWidth, { dimension: string; url: string }>;
}
