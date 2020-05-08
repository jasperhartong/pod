import { NextPageContext } from "next";
import dynamic from "next/dynamic";

import {
  Grid,
  CircularProgress,
  Box,
  Typography,
  List,
} from "@material-ui/core";
import { IRoom } from "../../../src/app-schema/IRoom";
import { IEpisode } from "../../../src/app-schema/IEpisode";
import PlaylistHeader from "../../../src/components/playlist-header";
import PlaylistGrid from "../../../src/components/playlist-grid";
import {
  RoomProvider,
  useRoomContext,
  RoomState,
} from "../../../src/hooks/useRoomContext";
import { IResponse } from "../../../src/api/IResponse";
import roomFetch from "../../../src/api/rpc/commands/room.fetch";
import AppContainer from "../../../src/components/app-container";
import ErrorPage from "../../../src/components/error-page";
import PageFooter from "../../../src/components/page-footer";

// Dynamic imports (load on user interaction)
const SnackbarPlayer = dynamic(() =>
  import("../../../src/components/snackbar-player")
);

const RoomPageContainer = ({ room }: { room: IResponse<IRoom> }) => {
  const defaultState: RoomState = {
    slug: room.ok ? room.data.slug : undefined,
    room,
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
  const { room, slug } = state;

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
    return <ErrorPage error={!room.ok ? room.error : undefined} />;
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
        </Grid>
      </Box>

      {room.data.playlists
        // Busines Logic: Only show playlists that contain published episodes
        .filter(
          (p) => p.episodes.filter((e) => e.status === "published").length > 0
        )
        .map((playlist) => (
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

      <PageFooter secondaryText={room.data.slug} />

      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={Boolean(state.playingEpisode?.isPaused)}
        onPlayPause={actions.playingEpisode.pause}
        onClose={actions.playingEpisode.stop}
      />
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
