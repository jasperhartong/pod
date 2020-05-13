import { useEffect, useState } from "react";

export const useBasePath = () => {
  const [basePath, setBasePath] = useState<string>();

  useEffect(() => {
    setBasePath(`${window.location.protocol}//${window.location.host}`);
  }, []);

  return { basePath };
};
