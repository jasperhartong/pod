export const baseUrl = "https://pod.jasperhartongprivate.now.sh";

export const rssUrl = (slug: string) => `${baseUrl}/api/rss/${slug}`;
export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
