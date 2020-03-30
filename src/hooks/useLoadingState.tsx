import { useState, useEffect } from "react";

const useLoadingState = <T extends object>() => {
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState<T | undefined>(undefined);

  useEffect(() => {
    if (success) {
      setLoading(false);
    }
  }, [success]);
  useEffect(() => {
    if (error) {
      setLoading(false);
    }
  }, [error]);
  useEffect(() => {
    if (loading) {
      setSuccess(undefined);
      setError(undefined);
    }
  }, [loading]);

  return { loading, setLoading, error, setError, success, setSuccess };
};

export default useLoadingState;
