import { getFeedItem } from "../../src/storage/methods";
import { DbFeedItem } from "../../src/storage/interfaces";
import { rssUrl } from "../../src/storage/urls";

const PodPage = ({ feed, slug }: { feed: DbFeedItem; slug: string }) => {
  return (
    <div>
      <h1>{feed.title}</h1>
      <p>{feed.description}</p>
      <h3>Episodes:</h3>
      <ul>
        {feed.items.map(item => (
          <li style={{ listStyle: "none" }}>
            <img src={item.image_file.data.thumbnails[0].url} />
            <h2 style={{ display: "inline-block" }}>{item.title}</h2>
            <a href={item.audio_file.data.full_url}>▶️</a>
          </li>
        ))}
      </ul>
      <h3>Subscribe:</h3>
      <sub>
        <a href={rssUrl(slug, "podcast")}>Apple Podcast (iPad / iPhone)</a>
        <hr />
        <a href={rssUrl(slug, "pcast")}>Apple Podcast (Mac)</a>
        <hr />
        <a href={rssUrl(slug, "podto")}>Other podcast clients</a>
        <hr />
        <a href={rssUrl(slug, "feed")}>RSS Feed</a>
        <hr />
        <a href={rssUrl(slug)}>XML</a>
        <hr />
      </sub>
    </div>
  );
};

export async function getServerSideProps(context) {
  const slug = context.query.slug || null; // null is serializable
  const feed = await getFeedItem(slug);
  return {
    props: { feed, slug }
  };
}

export default PodPage;
