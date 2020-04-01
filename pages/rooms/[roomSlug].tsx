import { useState, useEffect } from "react";
import { NextPageContext } from "next";

import {
  Container,
  Box,
  Divider,
  Typography,
  Collapse
} from "@material-ui/core";
import { ToggleButtonGroup, ToggleButton } from "@material-ui/lab";
import SurroundSound from "@material-ui/icons/SurroundSound";
import RecordIcon from "@material-ui/icons/Mic";
import ListenIcon from "@material-ui/icons/Headset";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { IRoom } from "../../src/app-schema/IRoom";
import { IEpisode } from "../../src/app-schema/IEpisode";
import SnackbarPlayer from "../../src/components/snackbar-player";
import SubscribePanel from "../../src/components/subscribe-panel";
import PlaylistHeader from "../../src/components/playlist-header";
import PlaylistGrid from "../../src/components/playlist-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState
} from "../../src/hooks/useRoomContext";
import EpisodeCreateDrawer from "../../src/components/episode-create-form";
import { collectionsBackend } from "../../src/api/collection-storage";

const getEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map(playlist => playlist.episodes))
    .find(episode => episode.id === episodeId);
};

const RoomPageContainer = ({ room, slug }: { room: IRoom; slug: string }) => {
  const defaultState: RoomState = {
    mode: "listen",
    newRecording: undefined,
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
  const playingItem: IEpisode | undefined = getEpisodeById(room, playingId);
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  useEffect(() => {
    setIsPaused(false);
  }, [playingId]);

  return (
    <Container
      maxWidth={maxWidth}
      style={{ transition: "all 500ms", width: "auto" }}
    >
      <Collapse in={mode === "record"}>
        <Box pt={4} pb={2}>
          <Typography variant="h4">Tapes voor {room.slug}</Typography>
        </Box>
      </Collapse>

      {room.playlists.map(playlist => (
        <Box pb={4} key={playlist.id}>
          <PlaylistHeader playlist={playlist} />
          <PlaylistGrid
            playlist={playlist}
            playingId={playingId}
            setPlayingId={setPlayingId}
            isPaused={isPaused}
            setIsPaused={setIsPaused}
            maxWidth={maxWidth}
          />
        </Box>
      ))}

      <Collapse in={mode === "listen"}>
        <div>
          <SubscribePanel slug={slug} />
        </div>
      </Collapse>

      <Box p={3} pt={6}>
        <Divider />
      </Box>

      <Box p={4} textAlign="center">
        <Typography component="div" variant="overline">
          {room.slug}
        </Typography>
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
            <ListenIcon fontSize="inherit" style={{ marginRight: 4 }} />
            Luisteren
          </ToggleButton>
          <ToggleButton value="record" aria-label="record">
            <RecordIcon fontSize="inherit" style={{ marginRight: 4 }} />
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
      <EpisodeCreateDrawer />
    </Container>
  );
};

export async function getServerSideProps(context: NextPageContext) {
  const roomSlug = context.query.roomSlug as string;
  const response = await collectionsBackend.getRoomBySlug(roomSlug);
  if (response.ok) {
    return {
      props: { room: response.data, slug: roomSlug || null } // null is serializable
    };
  } else {
    return {
      props: {}
    };
  }
}

export default RoomPageContainer;
