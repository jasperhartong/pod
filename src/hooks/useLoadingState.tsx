import { useState, useEffect } from "react";

const useLoadingState = <T extends object>() => {
  const [isValidating, setIsvalidating] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setIsvalidating(false);
    }
  }, [data]);
  useEffect(() => {
    if (error) {
      setIsvalidating(false);
    }
  }, [error]);
  useEffect(() => {
    if (isValidating) {
      setData(undefined);
      setError(undefined);
    }
  }, [isValidating]);

  return {
    isValidating,
    setIsvalidating,
    error,
    setError,
    data,
    setData,
  };
};

export default useLoadingState;
