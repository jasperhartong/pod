import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useSignedMediaUploader from "../hooks/useSignedMediaUploader";
import { Typography, CircularProgress } from "@material-ui/core";

interface Props {
  // http://www.iana.org/assignments/media-types/media-types.xhtml
  acceptedMimeTypes: string[];
  instructions: string;
  onSuccess(downloadUrl: string): void;
}

const MediaDropZone = ({
  acceptedMimeTypes,
  instructions,
  onSuccess
}: Props) => {
  const { uploadFile, loading, error, success } = useSignedMediaUploader();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only supports multiple=false
    uploadFile(acceptedFiles[0]);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedMimeTypes,
    multiple: false
  });

  useEffect(() => {
    if (!!success) {
      onSuccess(success.downloadUrl);
    }
  }, [success]);

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />
      {loading && <CircularProgress variant="indeterminate" />}
      {!!success && "Succes"}
      {error && `Error: ${error}`}
      <Typography variant="overline">{instructions}</Typography>
    </div>
  );
};
export default MediaDropZone;
