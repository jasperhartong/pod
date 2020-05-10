import React, { ReactNode } from "react";
import { useSignedMediaUploadDropZone } from "../hooks/useSignedUploadDropZone";

interface Props {
  // http://www.iana.org/assignments/media-types/media-types.xhtml
  acceptedMimeTypes: string[];
  onSuccess(downloadUrl: string): void;
  uploading: (uploadPercentCompleted: number | undefined) => ReactNode;
  error: ReactNode;
  success: ReactNode;
  initial: ReactNode;
}

const MediaDropZone = (props: Props) => {
  const {
    getRootProps,
    getInputProps,
    uploading,
    uploadError,
    downloadUrl,
    uploadPercentCompleted,
  } = useSignedMediaUploadDropZone({
    acceptedMimeTypes: props.acceptedMimeTypes,
    onSuccess: props.onSuccess,
  });

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {uploading && props.uploading(uploadPercentCompleted)}
      {!uploading && uploadError && props.error}
      {!uploading && !uploadError && downloadUrl && props.success}
      {!uploading && !uploadError && !downloadUrl && props.initial}
    </div>
  );
};
export default MediaDropZone;
