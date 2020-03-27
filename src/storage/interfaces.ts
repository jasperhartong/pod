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

export interface DbRoom {
  id: number;
  slug: string;
  // alias
  playlists: DbPlaylist[];
}

export interface DbPlaylist {
  id: number;
  created_on: DbDateString;
  from: string;
  to: string;
  cover_file: { data: DbFileData };
  // relationship
  // room: { slug: string };
  // alias
  episodes: DbEpisode[];
}

export interface DbEpisode {
  id: number;
  status: "published" | "draft" | "deleted";
  created_on: DbDateString;
  title: string;
  description: string;
  download_count: number;
  image_file: { data: DbFileData };
  audio_file: { data: DbFileData };
  // relationship
  // playlist: number;
}
