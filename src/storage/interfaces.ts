export type DbDateString = string;

export interface Thumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

export interface FileData {
  full_url: string;
  url: string;
  thumbnails: Thumbnail[] | null;
}

export interface DbPodItem {
  id: number;
  status: "published" | "draft" | "deleted";
  date: DbDateString;
  title: string | null;
  description: string | null;
  content: string | null;
  image_file: { data: FileData };
  audio_file: { data: FileData };
}

export interface DbFeedItem {
  id: number;
  date: DbDateString;
  title: string | null;
  description: string | null;
  content: string | null;
  author_name: string | null;
  author_email: string | null;
  cover_file: { data: FileData };
  items: DbPodItem[];
}
