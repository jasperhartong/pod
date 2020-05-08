import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import * as Doka from "../lib/doka/doka.esm.min";
import useSignedMediaUploader from "./useSignedMediaUploader";

interface MediaDropZoneProps {
  // http://www.iana.org/assignments/media-types/media-types.xhtml
  acceptedMimeTypes: string[];
  onSuccess(downloadUrl: string): void;
  onPreUpload?: (file: File) => Promise<File | null>;
}

// Generic Media upload hook
export const useSignedMediaUploadDropZone = ({
  acceptedMimeTypes,
  onSuccess,
  onPreUpload,
}: MediaDropZoneProps) => {
  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    // This hook only supports handling a single file (multiple=false)
    let acceptedFile: File | null = acceptedFiles[0];
    if (onPreUpload) {
      acceptedFile = await onPreUpload(acceptedFile);
    }
    if (acceptedFile) {
      uploader.uploadFile(acceptedFile);
    }
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

// Dropzone implementation with Doka pre-upload image-editor
interface DokaImageDropZoneProps {
  onSuccess(downloadUrl: string): void;
}

const acceptedImageMimeTypes = ["image/jpg", "image/jpeg", "image/png"];
const doka = Doka.create({ cropAspectRatio: 1 });

export const useSignedDokaImageUploadDropZone = ({
  onSuccess,
}: DokaImageDropZoneProps) => {
  return useSignedMediaUploadDropZone({
    acceptedMimeTypes: acceptedImageMimeTypes,
    onSuccess,
    onPreUpload: async (file) => {
      const dokaOutput = await doka.edit(file);

      if (dokaOutput) {
        return dokaOutput.file;
      }
      return null;
    },
  });
};
