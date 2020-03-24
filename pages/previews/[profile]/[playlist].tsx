import { useState, useEffect } from "react";

import { NextPageContext } from "next";
import { Box, Avatar, Typography } from "@material-ui/core";

import { DbFeedItem, DbPodItem } from "../../../src/storage/interfaces";
import FeedGrid from "../../../src/components/feed-grid";
import SubscribePanel from "../../../src/components/subscribe-panel";
import SnackbarPlayer from "../../../src/components/snackbar-player";
import { getFeedItem } from "../../../src/storage/methods";

// http://localhost:3000/previews/elshartong/elshartong?guest=2020-12-31_on9y8y
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
    <Box pt={0} p={2}>
      <Box textAlign="center">
        <Avatar
          alt={feed.author_name}
          src={feed.cover_file.data.thumbnails.find(t => t.height < 100).url}
        />
        <Typography variant="h4">{feed.title}</Typography>
        <Typography variant="h3">{feed.description}</Typography>
      </Box>
      <Box pb={4}>
        <FeedGrid
          feed={feed}
          playingId={playingId}
          setPlayingId={setPlayingId}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </Box>
      <SubscribePanel slug={slug} />
      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={isPaused}
        setPlayingId={setPlayingId}
        setIsPaused={setIsPaused}
      />
    </Box>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const slug = context.query.playlist || null; // null is serializable
  const guest = context.query.guest;
  if (guest !== "2020-12-31_on9y8y") {
    context.res.writeHead(401);
    return context.res.end();
  }
  const feed = await getFeedItem(slug as string);
  return {
    props: { feed, slug }
  };
}

export default PodPage;
