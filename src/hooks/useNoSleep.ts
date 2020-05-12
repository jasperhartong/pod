import NoSleep from "nosleep.js";
import { useEffect, useRef } from "react";

export const useNoSleep = () => {
  const noSleepInstance = useRef<NoSleep | null>(null);

  useEffect(() => {
    noSleepInstance.current = new NoSleep();
    return () => {
      noSleepInstance.current?.disable();
    };
  }, []);

  const enableOnUserInput = () => noSleepInstance.current?.enable();
  const disable = () => noSleepInstance.current?.disable();

  return { enableOnUserInput, disable };
};
