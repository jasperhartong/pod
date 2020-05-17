import { IEpisode } from "@/app-schema/IEpisode";
import { IRoom } from "@/app-schema/IRoom";
import { Box, Grid, List, Typography } from "@material-ui/core";
import dynamic from "next/dynamic";
import { useImmer } from "use-immer";
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

      <PageFooter secondaryText={room.uid} />

      <SnackbarPlayer
        playingItem={playingItem}
        isPaused={Boolean(playerState.playingEpisode?.isPaused)}
        onPlayPause={pause}
        onClose={stop}
      />
    </AppContainer>
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
