import { useState, useEffect } from "react";

import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  ListItemAvatar,
  Avatar,
  Snackbar,
  SnackbarContent,
  LinearProgress,
  ListItemSecondaryAction
} from "@material-ui/core";
import ReactPlayer from "react-player";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import CloseIcon from "@material-ui/icons/Close";
import { DbPodItem } from "../../src/storage/interfaces";

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
              <List style={{ padding: 0 }}>
                <ListItem button onClick={() => setIsPaused(!isPaused)}>
                  <ListItemAvatar>
                    <Avatar>
                      {!isPaused ? (
                        <PauseIcon color="secondary" />
                      ) : (
                        <PlayIcon color="secondary" />
                      )}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={playingItem.title}
                    secondary={
                      <Box
                        padding={1}
                        mt={1}
                        mb={1}
                        style={{
                          background: "rgba(0,0,0,0.2)",
                          borderRadius: 100
                        }}
                      >
                        <LinearProgress
                          variant="determinate"
                          value={progress}
                          color="secondary"
                        />
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    <IconButton
                      edge="end"
                      aria-label="close"
                      onClick={() => setPlayingId(undefined)}
                    >
                      <CloseIcon color="primary" />
                    </IconButton>
                  </ListItemSecondaryAction>
                </ListItem>
              </List>
            </Box>
          )
        }
      />
    </Snackbar>
  );
};

export default SnackbarPlayer;
