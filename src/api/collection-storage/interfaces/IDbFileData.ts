interface IDbThumbnail {
  url: string;
  relative_url: string;
  dimension: string;
  width: number;
  height: number;
}

export interface IDbFileData {
  full_url: string;
  url: string;
  thumbnails: IDbThumbnail[] | null;
}

export interface IDBFileUpload {
  id: number;
  storage: string;
  private_hash: string;
  filename_disk: string;
  filename_download: string;
  title: string;
  type: string;
  uploaded_by: number;
  uploaded_on: string;
  charset: string;
  filesize: number;
  width: number;
  height: number;
  duration: number;
  embed: null;
  folder: null;
  description: string;
  location: string;
  tags: string[];
  checksum: string;
  metadata: Record<string, string> | null;
  data: IDbFileData;
}
