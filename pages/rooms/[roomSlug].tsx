import { NextPageContext } from "next";
import dynamic from "next/dynamic";

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
import SubscribePanel from "../../src/components/subscribe-panel";
import PlaylistHeader from "../../src/components/playlist-header";
import PlaylistGrid from "../../src/components/playlist-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState,
} from "../../src/hooks/useRoomContext";
import BottomDrawer from "../../src/components/bottom-drawer";
import useSmoothScroller from "../../src/hooks/useSmoothScroller";
import roomFetch from "../../src/api/rpc/commands/room.fetch";
import { isRight } from "fp-ts/lib/Either";

// Dynamic imports (load on user interaction)
const SnackbarPlayer = dynamic(() =>
  import("../../src/components/snackbar-player")
);
const EpisodeCreateForm = dynamic(
  () => import("../../src/components/episode-create-form"),
  { loading: () => <div style={{ height: 230 }} /> }
);

const RoomPageContainer = ({ room }: { room?: IRoom }) => {
  const defaultState: RoomState = {
    mode: "listen",
    slug: room ? room.slug : undefined,
    room,
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
  const { state, actions } = useRoomContext();

  // derived state
  const { room, mode, slug } = state;
  const maxWidth: Breakpoint = mode === "listen" ? "sm" : "lg";

  if (!room) {
    return (
      <Container maxWidth={maxWidth}>
        <Box textAlign="center" pt={8}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!slug) {
    return (
      <Container maxWidth={maxWidth}>
        <Box textAlign="center" pt={8}>
          <Typography variant="overline" color="textSecondary">
            Error
          </Typography>
          <Divider />
          <Typography
            variant="overline"
            color="textSecondary"
            style={{ opacity: 0.2 }}
          >
            {"unknown error"}
          </Typography>
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
        <Box p={2}>
          <EpisodeCreateForm
            playlist={state.recordingEpisode?.playlist}
            onFormChange={actions.recordingEpisode.updateRecording}
            onFormSuccess={actions.recordingEpisode.finish}
          />
        </Box>
      </BottomDrawer>
    </Container>
  );
};

export default RoomPageContainer;

const findEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.id === episodeId);
};

const TapesFooter = () => (
  <Box p={4} textAlign="center">
    <SurroundSound fontSize="large" color="disabled" />
    <Typography component="div" variant="overline">
      Tapes.me ©2020
    </Typography>
  </Box>
);

const RoomModeSwitcher = () => {
  const { scrollToTop } = useSmoothScroller();
  const { state, actions } = useRoomContext();

  if (!state.room) {
    return null;
  }

  return (
    <Box p={4} textAlign="center">
      <Typography component="div" variant="overline">
        {state.room.slug || ""}
      </Typography>
      <ToggleButtonGroup
        value={state.mode}
        size="small"
        exclusive
        onChange={(_, value) => {
          if (value) {
            actions.mode.change(value);
            scrollToTop(500);
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

export async function getServerSideProps(context: NextPageContext) {
  const eitherRoom = await roomFetch.handle({
    slug: context.query.roomSlug as string,
  });
  if (isRight(eitherRoom)) {
    const room = eitherRoom.right;
    return {
      props: { room },
    };
  } else {
    // TODO: handle error
    console.error(eitherRoom.left);
  }
  return null;
}
