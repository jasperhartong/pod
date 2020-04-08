import { useState, useEffect } from "react";

import {
  Container,
  CircularProgress,
  Box,
  Divider,
  Typography,
  Collapse,
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
  RoomState,
} from "../../src/hooks/useRoomContext";
import EpisodeCreateForm from "../../src/components/episode-create-form";
import { useRouter } from "next/router";
import BottomDrawer from "../../src/components/bottom-drawer";

const findEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.id === episodeId);
};

const RoomPageContainer = () => {
  const defaultState: RoomState = {
    mode: "listen",
    slug: undefined,
    room: undefined,
    recordingEpisode: undefined,
    playingEpisode: undefined,
  };

  return (
    <RoomProvider defaultState={defaultState}>
      <RoomPage />
    </RoomProvider>
  );
};

const RoomPage = () => {
  const { query } = useRouter();
  const { state, actions } = useRoomContext();

  useEffect(() => {
    actions.room.initiate(query.roomSlug as string);
  }, [query.roomSlug]);

  // derived state
  const { room, mode, slug } = state;
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  if (!slug || !room) {
    return (
      <Container maxWidth={maxWidth}>
        <Box textAlign="center" pt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  const playingItem: IEpisode | undefined = findEpisodeById(
    room,
    state.playingEpisode?.episodeId
  );

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

      {room.playlists.map((playlist) => (
        <Box pb={4} key={playlist.id}>
          <PlaylistHeader playlist={playlist} />
          <PlaylistGrid
            playlist={playlist}
            playingId={state.playingEpisode?.episodeId}
            setPlayingId={actions.playingEpisode.initiate}
            isPaused={Boolean(state.playingEpisode?.isPaused)}
            setIsPaused={actions.playingEpisode.pause}
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

      <RoomModeSwitcher />

      <TapesFooter />

      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={Boolean(state.playingEpisode?.isPaused)}
        onPlayPause={actions.playingEpisode.pause}
        onClose={actions.playingEpisode.stop}
      />

      <BottomDrawer
        open={Boolean(state.recordingEpisode)}
        onClose={actions.recordingEpisode.cancel}
      >
        <EpisodeCreateForm
          playlist={state.recordingEpisode?.playlist}
          onFormChange={actions.recordingEpisode.updateRecording}
          onFormSuccess={actions.recordingEpisode.finish}
        />
      </BottomDrawer>
    </Container>
  );
};

export default RoomPageContainer;

const TapesFooter = () => (
  <Box p={4} textAlign="center">
    <SurroundSound fontSize="large" color="disabled" />
    <Typography component="div" variant="overline">
      Tapes.me ©2020
    </Typography>
  </Box>
);

const RoomModeSwitcher = () => {
  const { state, actions } = useRoomContext();

  return (
    <Box p={4} textAlign="center">
      <Typography component="div" variant="overline">
        {state.room?.slug || ""}
      </Typography>
      <ToggleButtonGroup
        value={state.mode}
        size="small"
        exclusive
        onChange={(_, value) => {
          if (value) {
            actions.mode.change(value);
          }
        }}
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
  );
};
