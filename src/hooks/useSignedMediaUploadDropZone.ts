import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import useSignedMediaUploader from "./useSignedMediaUploader";

interface MediaDropZoneProps {
  acceptedMimeTypes: string[];
  onSuccess(downloadUrl: string): void;
}

const useSignedMediaUploadDropZone = ({
  acceptedMimeTypes,
  onSuccess,
}: MediaDropZoneProps) => {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    // Only supports multiple=false
    uploader.uploadFile(acceptedFiles[0]);
  }, []);

  const onUploadSuccess = useCallback((data) => {
    onSuccess(data.downloadUrl);
  }, []);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept: acceptedMimeTypes,
    multiple: false,
  });

  const uploader = useSignedMediaUploader({
    onSuccess: onUploadSuccess,
  });

  return {
    getRootProps,
    getInputProps,
    uploading: uploader.isValidating,
    uploadPercentCompleted: uploader.percentCompleted,
    uploadError: uploader.error,
    downloadUrl: uploader.data?.downloadUrl,
    reset: uploader.reset,
  };
};

export default useSignedMediaUploadDropZone;
