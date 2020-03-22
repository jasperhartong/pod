import { getFeedItem } from "../../src/storage/methods";
import { DbFeedItem } from "../../src/storage/interfaces";
import { rssUrl } from "../../src/storage/urls";

const PodPage = ({ feed, slug }: { feed: DbFeedItem; slug: string }) => {
  return (
    <div>
      <h1>{feed.title}</h1>
      <p>{feed.description}</p>
      <h2>Episodes:</h2>
      <ul>
        {feed.items.map(item => (
          <li>{item.title}</li>
        ))}
      </ul>
      <hr />
      <sub>
        <a href={rssUrl(slug) + "?preview=true"}>RSS Feed</a>
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
