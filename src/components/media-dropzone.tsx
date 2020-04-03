import React, { useCallback, useEffect } from "react";
import { useDropzone } from "react-dropzone";
import useSignedMediaUploader from "../hooks/useSignedMediaUploader";
import { CircularProgress, Button, Box, Typography } from "@material-ui/core";
import UploadIcon from "@material-ui/icons/CloudUpload";
import SuccessIcon from "@material-ui/icons/CloudDone";

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
  const { uploadFile, loading, error, data } = useSignedMediaUploader();

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
    if (!!data) {
      onSuccess(data.downloadUrl);
    }
  }, [data]);

  let icon = (
    <CircularProgress
      variant="indeterminate"
      size="small"
      style={{ width: 24 }}
    />
  );
  if (!loading) {
    icon = <UploadIcon color="disabled" />;
  }
  if (data) {
    icon = <SuccessIcon />;
  }

  return (
    <div {...getRootProps()}>
      <input {...getInputProps()} />

      <Button variant="outlined" component="span">
        {icon}
        <Box display="inline-block" pl={1}>
          {instructions}
        </Box>
      </Button>
      {error && (
        <Box pt={1} pb={1}>
          <Typography variant="subtitle2" color="error">
            {error}
          </Typography>
        </Box>
      )}
    </div>
  );
};
export default MediaDropZone;
