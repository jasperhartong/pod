import { useState, useEffect } from "react";

import { Container, Box, Tabs, Tab } from "@material-ui/core";
import { getFeedItem } from "../../src/storage/methods";
import { DbFeedItem, DbPodItem } from "../../src/storage/interfaces";
import SnackbarPlayer from "../../src/components/snackbar-player";
import SubscribePanel from "../../src/components/subscribe-panel";
import FeedHeader from "../../src/components/feed-header";
import FeedGrid from "../../src/components/feed-grid";

const PodPage = ({ feed, slug }: { feed: DbFeedItem; slug: string }) => {
  const [playingId, setPlayingId] = useState<number>();
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const playingItem: DbPodItem | undefined = playingId
    ? feed.items.find(i => i.id === playingId)
    : undefined;

  useEffect(() => {
    setIsPaused(false);
  }, [playingId]);

  return (
    <Container maxWidth="lg">
      <h1 style={{ marginBottom: 0 }}>Mijn Tapes</h1>
      <Box pb={2}>
        <Tabs value={0} indicatorColor="secondary" textColor="secondary">
          <Tab label="Verzonden" />
          <Tab label="Ontvangen" />
        </Tabs>
      </Box>
      <Box pb={4}>
        <FeedHeader feed={feed} />
        <FeedGrid
          feed={feed}
          playingId={playingId}
          setPlayingId={setPlayingId}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          maxWidth="lg"
        />
      </Box>
      <SubscribePanel slug={slug} />
      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={isPaused}
        setPlayingId={setPlayingId}
        setIsPaused={setIsPaused}
      />
    </Container>
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
