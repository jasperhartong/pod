import { TypeOf } from "io-ts";
import { useState, useEffect } from "react";
import axios, { AxiosRequestConfig } from "axios";
import { IResponse, OK, ERR } from "../api/IResponse";
import useLoadingState from "./useLoadingState";

import signUrlCreateMeta from "../api/rpc/commands/signedurl.create.meta";
import { RPCClientFactory } from "../api/rpc/client";
import { isRight } from "fp-ts/lib/Either";
type ResponseData = TypeOf<typeof signUrlCreateMeta["resValidator"]>;

const useSignedMediaUploader = (): {
  uploadFile: (file: File) => void;
  loading: boolean;
  error?: string;
  data?: ResponseData;
} => {
  const [file, uploadFile] = useState<File>();
  const {
    loading,
    setLoading,
    error,
    setError,
    data,
    setData,
  } = useLoadingState<ResponseData>();

  const performUpload = async () => {
    if (!file) {
      return true;
    }
    setLoading(true);

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

    // Upload file
    const response = await uploadMedia(
      signedUrlCreation.data.uploadUrl,
      file,
      file.type
    );
    if (response.ok) {
      setData(signedUrlCreation.data);
    } else {
      setError(`File ${file.name} could not be uploaded`);
    }
  };

  useEffect(() => {
    performUpload();
  }, [file]);

  return { uploadFile, loading, error, data };
};

export default useSignedMediaUploader;

// PRIVATE
export const uploadMedia = async (
  uploadUrl: string,
  file: File,
  fileType: string
): Promise<IResponse<{}>> => {
  try {
    var options: AxiosRequestConfig = {
      headers: {
        "Content-Type": fileType,
      },
      timeout: 60000,
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
