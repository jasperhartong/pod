import { useState, useEffect } from "react";

const useLoadingState = <T extends object>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [data, setData] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (data) {
      setLoading(false);
    }
  }, [data]);
  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);
  useEffect(() => {
    if (loading) {
      setData(undefined);
      setError(undefined);
    }
  }, [loading]);

  return { loading, setLoading, error, setError, data, setData };
};

export default useLoadingState;
