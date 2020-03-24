import { useState, useEffect } from "react";

import { NextPageContext } from "next";
import {
  Box,
  Avatar,
  Typography,
  Container,
  Chip,
  Divider,
  Link
} from "@material-ui/core";

import { DbFeedItem, DbPodItem } from "../../../src/storage/interfaces";
import FeedGrid from "../../../src/components/feed-grid";
import SubscribePanel from "../../../src/components/subscribe-panel";
import SnackbarPlayer from "../../../src/components/snackbar-player";
import { getFeedItem } from "../../../src/storage/methods";
import SurroundSound from "@material-ui/icons/SurroundSound";

// http://localhost:3000/previews/elshartong/voorloisenrobin?guest=2020-12-31_on9y8y
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
    <Container maxWidth="sm">
      <Box textAlign="center" pt={1} pb={4}>
        <Avatar
          style={{
            width: 160,
            height: 160,
            display: "inline-block",
            margin: 16
          }}
          alt={feed.author_name}
          src="/elshartong.png"
        />
        <Typography component="div" variant="overline" color="textSecondary">
          van {feed.description}, voor:
        </Typography>
        <Typography variant="h4">{feed.title}</Typography>
      </Box>
      <Box pb={4}>
        <FeedGrid
          feed={feed}
          playingId={playingId}
          setPlayingId={setPlayingId}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
          maxWidth="sm"
        />
      </Box>
      <SubscribePanel slug={slug} />
      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={isPaused}
        setPlayingId={setPlayingId}
        setIsPaused={setIsPaused}
      />
      <Box p={3} pt={6}>
        <Divider />
      </Box>
      <Box p={3} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary">
          Je kijkt nu naar een preview van "{feed.title}", later zul je deze ook
          kunnen toevoegen aan je eigen luister bibliotheek in Tapes.me
        </Typography>
      </Box>
      {/* <Box p={3} textAlign="center">
          <Typography variant="subtitle2" color="textSecondary">
            Ben je {feed.author_name}? <Link href="#">Log in</Link>
          </Typography>
        </Box> */}
      <Box p={4} textAlign="center">
        <SurroundSound fontSize="large" color="disabled" />
        <Typography component="div" variant="overline">
          Tapes.me ©2020
        </Typography>
      </Box>
    </Container>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  // For now use profile, should of should be based on profile + playlist
  const slug = context.query.profile || null; // null is serializable
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
