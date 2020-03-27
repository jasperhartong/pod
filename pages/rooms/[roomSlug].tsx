import { useState, useEffect } from "react";

import { Container, Box, Tabs, Tab } from "@material-ui/core";
import { getRoomBySlug } from "../../src/storage/methods";
import { DbEpisode, DbRoom, DbPlaylist } from "../../src/storage/interfaces";
import SnackbarPlayer from "../../src/components/snackbar-player";
import SubscribePanel from "../../src/components/subscribe-panel";
import FeedHeader from "../../src/components/feed-header";
import FeedGrid from "../../src/components/feed-grid";
import { NextPageContext } from "next";

const getEpisodeById = (room: DbRoom, episodeId?: number) => {
  return ([] as DbEpisode[])
    .concat(...[...room.playlists].map(playlist => playlist.episodes))
    .find(episode => episode.id === episodeId);
};

const RoomPage = ({ room, slug }: { room: DbRoom; slug: string }) => {
  const [playingId, setPlayingId] = useState<number>();
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const playingItem: DbEpisode | undefined = getEpisodeById(room, playingId);

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

      {room.playlists.map(playlist => (
        <Box pb={4} key={playlist.id}>
          <FeedHeader feed={playlist} />
          <FeedGrid
            feed={playlist}
            playingId={playingId}
            setPlayingId={setPlayingId}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            maxWidth="lg"
          />
        </Box>
      ))}

      <SubscribePanel slug={slug} />
      <SnackbarPlayer
        playlistId={slug}
        playingItem={playingItem}
        isPaused={isPaused}
        setPlayingId={setPlayingId}
        setIsPaused={setIsPaused}
      />
    </Container>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const roomSlug = context.query.roomSlug as string;
  const { room, warning } = await getRoomBySlug(roomSlug);
  return {
    props: { room, slug: roomSlug || null } // null is serializable
  };
}

export default RoomPage;
