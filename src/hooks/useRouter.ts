import { useRouter as useOriginalRouter } from "next/dist/client/router";
import { UrlObject } from "url";

const performScrollToTop = () => {
  window?.scrollTo(0, 0);
};

export const useRouter = (scrollToTop: boolean = true) => {
  /* A slightly adjusted router that defaults to scrolling to top on route change */
  const router = useOriginalRouter();

  const scrollToTopPush: typeof router.push = async (
    url: UrlObject | string,
    as?: string | UrlObject | undefined,
    options?: {} | undefined
  ) => {
    const didRoute = await router.push(url, as, options);
    if (didRoute) {
      performScrollToTop();
    }
    return didRoute;
  };

  return { ...router, push: scrollToTop ? scrollToTopPush : router.push };
};
