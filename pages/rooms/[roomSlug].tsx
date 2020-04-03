import { useState, useEffect, useRef } from "react";

import {
  Container,
  CircularProgress,
  Box,
  Divider,
  Typography,
  Collapse,
  Popper,
  Fade,
  IconButton,
  Paper,
  Grid
} from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
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
import EpisodeCreateForm from "../../src/components/episode-create-form";
import { useRouter } from "next/router";

const getEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map(playlist => playlist.episodes))
    .find(episode => episode.id === episodeId);
};

const RoomPageContainer = () => {
  const defaultState: RoomState = {
    mode: "listen",
    newRecording: undefined,
    room: undefined,
    slug: undefined
  };

  return (
    <RoomProvider defaultState={defaultState}>
      <RoomPage />
    </RoomProvider>
  );
};

const RoomPage = () => {
  const { query } = useRouter();
  const [playingId, setPlayingId] = useState<number>();
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const { roomState, roomDispatch, recordingActions } = useRoomContext();
  const popperAnchorRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    setIsPaused(false);
  }, [playingId]);

  useEffect(() => {
    roomDispatch(room => {
      room.slug = query.roomSlug as string;
    });
  }, [query.roomSlug]);

  // derived state
  const { room, mode, slug } = roomState;
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  if (!slug || !room) {
    return (
      <Container
        maxWidth={maxWidth}
        style={{ transition: "all 500ms", width: "auto" }}
      >
        <CircularProgress />
      </Container>
    );
  }

  const playingItem: IEpisode | undefined = getEpisodeById(room, playingId);

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
            ref={
              playlist.id === roomState.newRecording?.playlist.id
                ? popperAnchorRef
                : null
            }
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

      <Popper
        open={Boolean(roomState.newRecording) && Boolean(popperAnchorRef)}
        anchorEl={popperAnchorRef.current}
        transition
        style={{ zIndex: 2 }}
        placement="bottom"
        modifiers={{
          flip: {
            enabled: false
          },
          preventOverflow: {
            enabled: true,
            boundariesElement: "viewport"
          }
        }}
      >
        {({ TransitionProps }) => (
          <Fade {...TransitionProps} timeout={350}>
            <Paper>
              <Container maxWidth="xs" style={{ width: "auto" }}>
                <Box pt={1}>
                  <Grid container alignItems="center" justify="space-between">
                    <Grid item>
                      <Typography variant="h5">Voeg toe</Typography>
                    </Grid>
                    <Grid item>
                      <IconButton
                        onClick={() => recordingActions.cancel()}
                        edge="end"
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Box>

                <EpisodeCreateForm
                  playlist={roomState.newRecording?.playlist}
                  onFormChange={recordingActions.updateRecording}
                  onFormSuccess={recordingActions.finish}
                />
              </Container>
            </Paper>
          </Fade>
        )}
      </Popper>
    </Container>
  );
};

export default RoomPageContainer;
