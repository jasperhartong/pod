import { useState, useEffect } from "react";
import { NextPageContext } from "next";

import { Container, Box, Divider, Typography } from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { getRoomBySlug } from "../../src/storage/methods";
import { DbEpisode, DbRoom } from "../../src/storage/interfaces";
import SnackbarPlayer from "../../src/components/snackbar-player";
import SubscribePanel from "../../src/components/subscribe-panel";
import FeedHeader from "../../src/components/feed-header";
import FeedGrid from "../../src/components/feed-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState
} from "../../src/hooks/useRoomContext";

const getEpisodeById = (room: DbRoom, episodeId?: number) => {
  return ([] as DbEpisode[])
    .concat(...[...room.playlists].map(playlist => playlist.episodes))
    .find(episode => episode.id === episodeId);
};

const RoomPageContainer = ({ room, slug }: { room: DbRoom; slug: string }) => {
  const defaultState: RoomState = {
    mode: "listen",
    room,
    slug
  };

  return (
    <RoomProvider defaultState={defaultState}>
      <RoomPage />
    </RoomProvider>
  );
};

const RoomPage = () => {
  const [playingId, setPlayingId] = useState<number>();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { roomState, roomDispatch } = useRoomContext();
  const { room, mode, slug } = roomState;

  // derived state
  const playingItem: DbEpisode | undefined = getEpisodeById(room, playingId);
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  useEffect(() => {
    setIsPaused(false);
  }, [playingId]);

  return (
    <Container maxWidth={maxWidth}>
      <h1 style={{ marginBottom: 0 }}>Mijn Tapes</h1>

      {room.playlists.map(playlist => (
        <Box pb={4} key={playlist.id}>
          <FeedHeader feed={playlist} />
          <FeedGrid
            feed={playlist}
            playingId={playingId}
            setPlayingId={setPlayingId}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            maxWidth={maxWidth}
          />
        </Box>
      ))}

      <SubscribePanel slug={slug} />
      <Box p={3} pt={6}>
        <Divider />
      </Box>
      <Box p={3} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary">
          Je kijkt nu naar een preview van "{room.slug}", later zul je deze ook
          kunnen toevoegen aan je eigen luister bibliotheek in Tapes.me
        </Typography>
      </Box>
      <Box p={4} textAlign="center">
        <ToggleButtonGroup
          value={mode}
          size="small"
          exclusive
          onChange={(_, value) =>
            roomDispatch(room => {
              if (value) {
                room.mode = value;
              }
            })
          }
          aria-label="text alignment"
        >
          <ToggleButton value="listen" aria-label="listen">
            Luisteren
          </ToggleButton>
          <ToggleButton value="record" aria-label="record">
            Opnemen
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      <Box p={4} textAlign="center">
        <SurroundSound fontSize="large" color="disabled" />
        <Typography component="div" variant="overline">
          Tapes.me ©2020
        </Typography>
      </Box>

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

export default RoomPageContainer;
