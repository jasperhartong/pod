import { useEffect } from "react";
import SmoothScroll from "smooth-scroll/dist/smooth-scroll";

let smoothScroll: SmoothScroll;

const useSmoothScroller = () => {
  useEffect(() => {
    smoothScroll = new SmoothScroll(undefined, {
      speed: 2000,
      durationMin: 500,
      durationMax: 2000,
      offset: 0,
      updateURL: false,
    });
  }, []);

  const scrollToElement = (selectors: string, scrollTimeout = 300) => {
    const element = document.querySelector(selectors);
    if (element && smoothScroll) {
      setTimeout(() => smoothScroll.animateScroll(element), scrollTimeout);
    }
  };

  const scrollToTop = (scrollTimeout = 300) => {
    if (smoothScroll) {
      setTimeout(() => smoothScroll.animateScroll(0), scrollTimeout);
    }
  };

  return { scrollToElement, scrollToTop };
};

export default useSmoothScroller;
