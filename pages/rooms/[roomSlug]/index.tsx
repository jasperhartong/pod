import roomFetchMeta from "@/api/rpc/commands/room.fetch.meta";
import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import AppContainer from "@/components/app-container";
import { ErrorPage } from "@/components/error-page";
import PageFooter from "@/components/page-footer";
import PlaylistGrid from "@/components/playlist-grid";
import PlaylistHeader from "@/components/playlist-header";
import SnackbarPlayer from "@/components/snackbar-player";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { Box, Grid, List, Typography } from "@material-ui/core";
import { NextPageContext } from "next";
import { useImmer } from "use-immer";
import { IResponse } from "../../../src/api/IResponse";
import { RPCClientFactory } from "../../../src/api/rpc/rpc-client";

interface PageProps {
  roomResponse: IResponse<IRoom>;
}

const ListenRoomPage = ({ roomResponse }: PageProps) => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string, roomResponse);
  const { playerState, start, stop, pause } = usePlayerState();

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }

  const room = data.data;
  const playingItem: IEpisode | undefined = findEpisodeById(
    room,
    playerState.playingEpisode?.episodeId
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
            <Typography variant="h4">{room.title}</Typography>
          </Grid>
        </Grid>
      </Box>

      {room.playlists
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
                playingId={playerState.playingEpisode?.episodeId}
                setPlayingId={start}
                isPaused={Boolean(playerState.playingEpisode?.isPaused)}
                setIsPaused={pause}
              />
            </Box>
          </Box>
        ))}

      <PageFooter secondaryText={room.slug} />

      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={Boolean(playerState.playingEpisode?.isPaused)}
        onPlayPause={pause}
        onClose={stop}
      />
    </AppContainer>
  );
};

export default ListenRoomPage;

export async function getStaticProps(
  context: NextPageContext
): Promise<{ props: PageProps; unstable_revalidate: number }> {
  return {
    props: {
      roomResponse: await RPCClientFactory(roomFetchMeta).call({
        slug: context.query.roomSlug as string,
      }),
    },
    // we will attempt to re-generate the page:
    // - when a request comes in
    // - at most once every second
    unstable_revalidate: 1,
  };
}

const findEpisodeById = (room: IRoom, episodeId?: number) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.id === episodeId);
};

export interface PlayerState {
  playingEpisode?: {
    episodeId: IEpisode["id"];
    isPaused: boolean;
  };
}

export const usePlayerState = () => {
  const [state, dispatch] = useImmer<PlayerState>({});

  const start = (episodeId: IEpisode["id"]) => {
    dispatch((state) => {
      state.playingEpisode = {
        episodeId,
        // always force not be paused when calling start again
        isPaused: false,
      };
    });
  };
  const pause = (isPaused: boolean) => {
    dispatch((state) => {
      if (state.playingEpisode) {
        state.playingEpisode.isPaused = isPaused;
      }
    });
  };
  const stop = () => {
    dispatch((state) => {
      state.playingEpisode = undefined;
    });
  };

  return { playerState: state, start, pause, stop };
};
