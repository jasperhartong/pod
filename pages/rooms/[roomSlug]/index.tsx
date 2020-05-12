import { IResponse } from "@/api/IResponse";
import roomFetch from "@/api/rpc/commands/room.fetch";
import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import AppContainer from "@/components/app-container";
import { ErrorPage } from "@/components/error-page";
import PageFooter from "@/components/page-footer";
import PlaylistGrid from "@/components/playlist-grid";
import PlaylistHeader from "@/components/playlist-header";
import SnackbarPlayer from "@/components/snackbar-player";
import {
  RoomProvider,
  RoomState,
  useRoomContext,
} from "@/hooks/useRoomContext";
import {
  Box,
  CircularProgress,
  Grid,
  List,
  Typography,
} from "@material-ui/core";
import { NextPageContext } from "next";

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
