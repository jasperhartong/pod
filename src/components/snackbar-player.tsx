import { useState, useEffect } from "react";

import {
  IconButton,
  Box,
  Avatar,
  Snackbar,
  SnackbarContent,
  LinearProgress,
  Grid,
  Typography,
  Fab,
} from "@material-ui/core";
import FilePlayer from "react-player/lib/players/FilePlayer";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import CloseIcon from "@material-ui/icons/Close";
import { IEpisode } from "@/app-schema/IEpisode";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles((theme) => ({
  snackbarMessage: {
    width: "100%",
    padding: 0,
  },
}));

const SnackbarPlayer = ({
  playingItem,
  isPaused,
  onPlayPause,
  onClose,
}: {
  playingItem?: IEpisode;
  isPaused: boolean;
  onPlayPause: (paused: boolean) => void;
  onClose: () => void;
}) => {
  const [progress, setProgress] = useState<number>(0);
  const [didLoad, setDidLoad] = useState<boolean>(false);
  const classes = useStyles();

  useEffect(() => {
    setProgress(0);
    setDidLoad(false);
  }, [playingItem]);

  return (
    <Snackbar
      // Ensure that the Safari bottom-buttonbar is not triggered when interacting with snackbarcontent
      style={{ marginBottom: 44 }}
      open={!!playingItem}
      anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
    >
      <SnackbarContent
        classes={{ message: classes.snackbarMessage }}
        message={
          !!playingItem && (
            <Box>
              <FilePlayer
                url={playingItem.audio_file || undefined}
                playing={!isPaused}
                width="0px"
                height="0px"
                config={{
                  file: { forceAudio: true },
                }}
                onProgress={({ played, loaded }) => {
                  setProgress(played * 100);
                  setDidLoad(loaded === 1);
                }}
              />
              <Grid container direction="column">
                <Grid item>
                  <Box textAlign="center" mb={1}>
                    <Typography variant="overline">
                      {playingItem.title}
                    </Typography>
                  </Box>
                </Grid>
                <Grid item>
                  <Grid
                    container
                    direction="row"
                    justify="space-between"
                    alignItems="center"
                  >
                    <Grid item>
                      <Avatar
                        variant="square"
                        src={playingItem.image_file.data.full_url}
                        alt={playingItem.title || undefined}
                      />
                    </Grid>
                    <Grid item>
                      <Fab
                        onClick={() => onPlayPause(!isPaused)}
                        color="secondary"
                        aria-label="play/pause"
                      >
                        {!isPaused ? <PauseIcon /> : <PlayIcon />}
                      </Fab>
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="inherit"
                        aria-label="close"
                        onClick={onClose}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Box mt={1}>
                    <LinearProgress
                      variant={
                        didLoad || progress !== 0
                          ? "determinate"
                          : "indeterminate"
                      }
                      value={progress}
                      color="primary"
                    />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          )
        }
      />
    </Snackbar>
  );
};

export default SnackbarPlayer;
