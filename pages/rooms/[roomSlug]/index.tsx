import { NextPageContext } from "next";
import dynamic from "next/dynamic";

import {
  Grid,
  CircularProgress,
  Box,
  Divider,
  Typography,
  Collapse,
  List,
} from "@material-ui/core";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { IRoom } from "../../../src/app-schema/IRoom";
import { IEpisode } from "../../../src/app-schema/IEpisode";
import PlaylistHeader from "../../../src/components/playlist-header";
import PlaylistGrid from "../../../src/components/playlist-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState,
} from "../../../src/hooks/useRoomContext";
import BottomDrawer from "../../../src/components/bottom-drawer";
import { IResponse } from "../../../src/api/IResponse";
import roomFetch from "../../../src/api/rpc/commands/room.fetch";
import RoomMenu from "../../../src/components/room-menu";
import { makeStyles } from "@material-ui/styles";
import AppContainer from "../../../src/components/app-container";

// Dynamic imports (load on user interaction)
const SnackbarPlayer = dynamic(() =>
  import("../../../src/components/snackbar-player")
);
const EpisodeCreateForm = dynamic(
  () => import("../../../src/components/episode-create-form"),
  { loading: () => <div style={{ height: 230 }} /> }
);

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    backgroundImage: "url(/background.png)",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "right",
    backgroundPositionY: -400,
  },
}));

const RoomPageContainer = ({ room }: { room: IResponse<IRoom> }) => {
  const defaultState: RoomState = {
    mode: "listen",
    slug: room.ok ? room.data.slug : undefined,
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
  const classes = useStyles();
  const { state, actions } = useRoomContext();

  // derived state
  const { room, mode, slug } = state;

  if (!room) {
    return (
      <AppContainer>
        <Box textAlign="center" pt={8}>
          <CircularProgress />
        </Box>
      </AppContainer>
    );
  }

  if (!room.ok || !slug) {
    return (
      <AppContainer>
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
            {!room.ok ? room.error : "unknown error"}
          </Typography>
        </Box>
      </AppContainer>
    );
  }

  const playingItem: IEpisode | undefined = findEpisodeById(
    room.data,
    state.playingEpisode?.episodeId
  );

  return (
    <AppContainer>
      <Box p={2}>
        <Grid
          container
          spacing={1}
          alignContent="center"
          alignItems="center"
          justify="space-between"
          wrap="nowrap"
        >
          <Grid item>
            <Typography variant="h4">{room.data.title}</Typography>
          </Grid>
          <Grid item>
            <RoomMenu />
          </Grid>
        </Grid>
      </Box>

      {room.data.playlists.map((playlist) => (
        <Box pb={4} key={playlist.id}>
          <List>
            <PlaylistHeader playlist={playlist} />
          </List>
          <Box p={2}>
            <PlaylistGrid
              playlist={playlist}
              playingId={state.playingEpisode?.episodeId}
              setPlayingId={actions.playingEpisode.initiate}
              isPaused={Boolean(state.playingEpisode?.isPaused)}
              setIsPaused={actions.playingEpisode.pause}
            />
          </Box>
        </Box>
      ))}

      <Box p={4} textAlign="center">
        <SurroundSound fontSize="large" color="disabled" />
        <Typography
          component="div"
          variant="overline"
          style={{ lineHeight: "110%" }}
        >
          Tapes.me ©2020
        </Typography>
        <Typography component="div" variant="overline" color="textSecondary">
          {room.data.slug || ""}
        </Typography>
      </Box>

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
    </AppContainer>
  );
};

export default RoomPageContainer;

const findEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.id === episodeId);
};

export async function getServerSideProps(context: NextPageContext) {
  const room = await roomFetch.handle({
    slug: context.query.roomSlug as string,
  });
  return {
    props: { room },
  };
}
