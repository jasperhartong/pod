import React from "react";
import { CircularProgress, Button, Box, Typography } from "@material-ui/core";
import UploadIcon from "@material-ui/icons/CloudUpload";
import SuccessIcon from "@material-ui/icons/CloudDone";
import { useSignedMediaUploadDropZone } from "../hooks/useSignedUploadDropZone";

interface Props {
  // http://www.iana.org/assignments/media-types/media-types.xhtml
  acceptedMimeTypes: string[];
  onSuccess(downloadUrl: string): void;
  instructions: string;
}

const MediaDropZone = ({
  acceptedMimeTypes,
  instructions,
  onSuccess,
}: Props) => {
  const {
    getRootProps,
    getInputProps,
    uploading,
    uploadError,
    downloadUrl,
  } = useSignedMediaUploadDropZone({ acceptedMimeTypes, onSuccess });

  let icon = (
    <CircularProgress
      variant="indeterminate"
      size="small"
      style={{ width: 24 }}
    />
  );
  if (!uploading) {
    icon = <UploadIcon color="disabled" />;
  }
  if (downloadUrl) {
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
      {uploadError && (
        <Box pt={1} pb={1}>
          <Typography variant="subtitle2" color="error">
            {uploadError}
          </Typography>
        </Box>
      )}
    </div>
  );
};
export default MediaDropZone;
