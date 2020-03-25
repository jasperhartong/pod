export type DbDateString = string;

export interface DbThumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

export interface DbFileData {
  full_url: string;
  url: string;
  thumbnails: DbThumbnail[] | null;
}

export interface DbEpisode {
  id: number;
  status: "published" | "draft" | "deleted";
  date: DbDateString;
  title: string | null;
  description: string | null;
  content: string | null;
  download_count: number;
  image_file: { data: DbFileData };
  audio_file: { data: DbFileData };
}

export interface DbPlaylist {
  id: number;
  date: DbDateString;
  title: string | null;
  description: string | null;
  content: string | null;
  author_name: string | null;
  author_email: string | null;
  cover_file: { data: DbFileData };
  items: DbEpisode[];
}
