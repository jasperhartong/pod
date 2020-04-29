import { TypeOf } from "io-ts";
import { useState, useEffect, useRef } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { IResponse, OK, ERR } from "../api/IResponse";
import useLoadingState from "./useLoadingState";

import signUrlCreateMeta from "../api/rpc/commands/signedurl.create.meta";
import { RPCClientFactory } from "../api/rpc/rpc-client";

type ResponseData = TypeOf<typeof signUrlCreateMeta["resValidator"]>;

interface ReturnProps {
  uploadFile: (file: File) => void;
  isValidating: boolean;
  error?: string;
  data?: ResponseData;
  percentCompleted?: number;
  onSuccess: (callback: (data: ResponseData) => void) => void;
  onError: (callback: (message: string) => void) => void;
  onProgress: (callback: (percentCompleted: number) => void) => void;
}

const useSignedMediaUploader = (): ReturnProps => {
  const [file, uploadFile] = useState<File>();
  const [percentCompleted, setPercentCompleted] = useState<number>();
  const {
    isValidating,
    setIsvalidating,
    error,
    setError,
    data,
    setData,
  } = useLoadingState<ResponseData>();
  const onProgressRef = useRef<(percentCompleted: number) => void>();
  const onSuccessRef = useRef<(data: ResponseData) => void>();
  const onErrorRef = useRef<(message: string) => void>();

  const performUpload = async () => {
    if (!file) {
      return true;
    }
    setIsvalidating(true);

    // Get SignedUpload Url
    const signedUrlCreation = await RPCClientFactory(signUrlCreateMeta).call({
      fileName: file.name,
      fileType: file.type,
    });

    if (!signedUrlCreation.ok) {
      setError(
        `File ${file.name} could not be uploaded: signed url creation failed`
      );
      return;
    }

    const handleProgress = (percentCompleted: number) => {
      if (onProgressRef.current) {
        onProgressRef.current(percentCompleted);
      }
      setPercentCompleted(percentCompleted);
    };

    // Upload file
    const response = await uploadMedia(
      signedUrlCreation.data.uploadUrl,
      file,
      file.type,
      handleProgress
    );
    if (response.ok) {
      setData(signedUrlCreation.data);
      if (onSuccessRef.current) {
        onSuccessRef.current(signedUrlCreation.data);
      }
    } else {
      const message = `File ${file.name} could not be uploaded`;
      setError(message);
      if (onErrorRef.current) {
        onErrorRef.current(message);
      }
    }
  };

  useEffect(() => {
    performUpload();
  }, [file]);

  const onProgress = (callback: (percentCompleted: number) => void) => {
    onProgressRef.current = callback;
  };
  const onSuccess = (callback: (data: ResponseData) => void) => {
    onSuccessRef.current = callback;
  };
  const onError = (callback: (message: string) => void) => {
    onErrorRef.current = callback;
  };

  return {
    uploadFile,
    isValidating,
    error,
    data,
    percentCompleted,
    onProgress,
    onSuccess,
    onError,
  };
};

export default useSignedMediaUploader;

// PRIVATE
export const uploadMedia = async (
  uploadUrl: string,
  file: File,
  fileType: string,
  onPercentCompleted: (percentCompleted: number) => void
): Promise<IResponse<{}>> => {
  try {
    var options: AxiosRequestConfig = {
      headers: {
        "Content-Type": fileType,
      },
      timeout: 60000,
      onUploadProgress: function (progressEvent) {
        const percentCompleted = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onPercentCompleted(percentCompleted);
      },
    };
    await axios.put(uploadUrl, file, options);
    return OK<{}>({});
  } catch (error) {
    console.error(error);
    return ERR<{}>("upload failed");
  }
};

//   const reader = new FileReader();

//   reader.onabort = () => console.log("file reading was aborted");
//   reader.onerror = () => console.log("file reading has failed");
//   reader.onload = () => {

//     // Do whatever you want with the file contents
//     const binaryStr = reader.result;
//     console.log(binaryStr);
//   };
//   reader.readAsArrayBuffer(file);
