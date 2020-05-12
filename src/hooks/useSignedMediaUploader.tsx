import { TypeOf } from "io-ts";
import { useState, useEffect, useRef } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { IResponse, OK, ERR } from "@/api/IResponse";
import useLoadingState from "./useLoadingState";

import signUrlCreateMeta from "@/api/rpc/commands/signedurl.create.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";

type ResponseData = TypeOf<typeof signUrlCreateMeta["resValidator"]>;

interface Callbacks {
  onSuccess: (data: ResponseData) => void;
  onError: (message: string) => void;
  onProgress: (percentCompleted: number) => void;
}

interface ReturnProps {
  uploadFile: (file: File) => void;
  reset: () => void;
  isValidating: boolean;
  error?: string;
  data?: ResponseData;
  percentCompleted?: number;
  setOnSuccess: (callback: Callbacks["onSuccess"]) => void;
  setOnError: (callback: Callbacks["onError"]) => void;
  setOnProgress: (callback: Callbacks["onProgress"]) => void;
}

const useSignedMediaUploader = (
  callbacks?: Partial<Callbacks>
): ReturnProps => {
  const [file, setFile] = useState<File | undefined>();
  const [percentCompleted, setPercentCompleted] = useState<number>();
  const {
    isValidating,
    setIsvalidating,
    error,
    setError,
    data,
    setData,
  } = useLoadingState<ResponseData>();

  const onSuccessRef = useRef<Callbacks["onSuccess"] | undefined>(
    callbacks?.onSuccess
  );
  const onErrorRef = useRef<Callbacks["onError"] | undefined>(
    callbacks?.onError
  );
  const onProgressRef = useRef<Callbacks["onProgress"] | undefined>(
    callbacks?.onProgress
  );

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

  const reset = () => {
    setFile(undefined);
    setPercentCompleted(0);
    setError(undefined);
    setData(undefined);
  };

  // Allow to also set callbacks AFTER initiating hook
  const setOnProgress = (callback: (percentCompleted: number) => void) => {
    onProgressRef.current = callback;
  };
  const setOnSuccess = (callback: (data: ResponseData) => void) => {
    onSuccessRef.current = callback;
  };
  const setOnError = (callback: (message: string) => void) => {
    onErrorRef.current = callback;
  };

  return {
    uploadFile: setFile,
    reset,
    isValidating,
    error,
    data,
    percentCompleted,
    setOnProgress,
    setOnSuccess,
    setOnError,
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
