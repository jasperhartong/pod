export const baseUrl = "https://pod.jasperhartongprivate.now.sh";

export const rssUrl = (slug: string, scheme: string = "https") =>
  `${baseUrl}/api/rss/${slug}`.replace("https", scheme);

export const podPageUrl = (slug: string) => `${baseUrl}/pods/${slug}`;

export const podItemPageUrl = (slug: string, itemId: string) =>
  `${baseUrl}/pods/${slug}/${itemId.toString()}`;
