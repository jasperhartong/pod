import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import { Box, Divider, Grid, List, Typography } from "@material-ui/core";
import IconSurroundSound from "@material-ui/icons/SurroundSound";
import dynamic from "next/dynamic";
import Head from "next/head";
import { useImmer } from "use-immer";
import { PodcastPanel } from "./admin/components/podcast-panel";
import AppContainer from "./app-container";
import PageFooter from "./page-footer";
import PlaylistGrid from "./playlist-grid";
import PlaylistHeader from "./playlist-header";

// Dynamic imports (load on user interaction)
const SnackbarPlayer = dynamic(() => import("./snackbar-player"));

export const ListenRoom = ({ room }: { room: IRoom }) => {
  const { playerState, start, stop, pause } = usePlayerState();

  const playingItem: IEpisode | undefined = findEpisodeById(
    room,
    playerState.playingEpisode?.episodeUid
  );

  return (
    <>
      <Head>
        <title>{room.title} – Tapes.me</title>
        <meta property="og:title" content={`${room.title} – Tapes.me`} />
        <meta property="og:description" content={`Listen to episodes and subscribe to the podcast`} />
        <meta property="og:type" content="podcast" />
        <meta property="og:image" content={room.cover_file.data.full_url} />
      </Head>
      <AppContainer>
        <Box p={2}>
          <Grid
            container
            spacing={1}
            alignContent="center"
            alignItems="center"
            justify="center"
            wrap="nowrap"
          >
            <IconSurroundSound fontSize="small" style={{ marginRight: 8, marginTop: -2 }} />
            <Typography variant="overline" >{room.title}</Typography>
          </Grid>
        </Box>
        <Divider />

        {room.playlists
          // Busines Logic: Only show playlists that contain published episodes
          .filter(
            (p) => p.episodes.filter((e) => e.status === "published").length > 0
          )
          .map((playlist) => (
            <Box pb={4} key={playlist.uid}>
              <List>
                <PlaylistHeader playlist={playlist} />
              </List>
              <Box p={2}>
                <PlaylistGrid
                  playlist={playlist}
                  playingUid={playerState.playingEpisode?.episodeUid}
                  setPlayingUid={start}
                  isPaused={Boolean(playerState.playingEpisode?.isPaused)}
                  setIsPaused={pause}
                />
              </Box>
            </Box>
          ))}

        <PodcastPanel room={room} />

        <PageFooter secondaryText={room.uid} />

        <SnackbarPlayer
          playingItem={playingItem}
          isPaused={Boolean(playerState.playingEpisode?.isPaused)}
          onPlayPause={pause}
          onClose={stop}
        />
      </AppContainer>
    </>
  );
};

const findEpisodeById = (room: IRoom, episodeUid?: IEpisode["uid"]) => {
  return ([] as IEpisode[])
    .concat(...[...room.playlists].map((playlist) => playlist.episodes))
    .find((episode) => episode.uid === episodeUid);
};

interface PlayerState {
  playingEpisode?: {
    episodeUid: IEpisode["uid"];
    isPaused: boolean;
  };
}

const usePlayerState = () => {
  const [state, dispatch] = useImmer<PlayerState>({});

  const start = (episodeUid: IEpisode["uid"]) => {
    dispatch((state) => {
      state.playingEpisode = {
        episodeUid,
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
