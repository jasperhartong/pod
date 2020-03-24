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
  Fab
} from "@material-ui/core";
import ReactPlayer from "react-player";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import CloseIcon from "@material-ui/icons/Close";
import { DbPodItem } from "../../src/storage/interfaces";
import { makeStyles } from "@material-ui/styles";

const useStyles = makeStyles(theme => ({
  snackbarMessage: {
    width: "100%",
    padding: 0
  }
}));

const SnackbarPlayer = ({
  playingItem,
  isPaused,
  setPlayingId,
  setIsPaused
}: {
  playingItem?: DbPodItem;
  isPaused: boolean;
  setPlayingId: (id: number | undefined) => void;
  setIsPaused: (paused: boolean) => void;
}) => {
  const [progress, setProgress] = useState<number>(0);
  const classes = useStyles();

  useEffect(() => {
    setProgress(0);
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
              <ReactPlayer
                url={playingItem.audio_file.data.full_url}
                playing={!isPaused}
                width="0px"
                height="0px"
                config={{
                  file: { forceAudio: true }
                }}
                onProgress={({ played }) => {
                  setProgress(played * 100);
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
                        alt={playingItem.title}
                      />
                    </Grid>
                    <Grid item>
                      <Fab
                        onClick={() => setIsPaused(!isPaused)}
                        color="primary"
                        aria-label="play/pause"
                      >
                        {!isPaused ? <PauseIcon /> : <PlayIcon />}
                      </Fab>
                    </Grid>
                    <Grid item>
                      <IconButton
                        color="primary"
                        edge="end"
                        aria-label="close"
                        onClick={() => setPlayingId(undefined)}
                      >
                        <CloseIcon />
                      </IconButton>
                    </Grid>
                  </Grid>
                </Grid>
                <Grid item>
                  <Box mt={1}>
                    <LinearProgress
                      variant="determinate"
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
