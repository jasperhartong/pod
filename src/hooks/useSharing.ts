import { useEffect, useState } from "react";

const useSharing = () => {
  const [hasNativeShare, setHasNativeShare] = useState<boolean>();
  useEffect(() => {
    setHasNativeShare(checkNativeShare());
  }, []);
  return { hasNativeShare, nativeShare };
};

export default useSharing;

// Private

const checkNativeShare = () =>
  typeof window !== "undefined" &&
  (window.navigator as any).share !== undefined;

const nativeShare = (
  title: string,
  text: string,
  url: string
): Promise<boolean> => {
  let _navigator = window.navigator as any;
  if (_navigator.share) {
    return new Promise((resolve, reject) => {
      _navigator
        .share({ title, text, url })
        .then(() => resolve(true))
        .catch((err: Error) => {
          console.error(err);
          resolve(false);
        });
    });
  } else {
    console.error("Not supported");
    return Promise.resolve(false);
  }
};
