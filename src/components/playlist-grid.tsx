import {
  makeStyles,
  Typography,
  Box,
  ButtonBase,
  Paper,
  Fab,
} from "@material-ui/core";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import { IPlaylist } from "../app-schema/IPlaylist";
import { useRoomContext } from "../hooks/useRoomContext";
import { IEpisode } from "../app-schema/IEpisode";

const useStyles = makeStyles((theme) => ({
  gridRoot: {
    //https://mastery.games/post/tile-layouts/
    display: "grid",
    gridColumnGap: 16,
    gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
  },
  tileRoot: {
    position: "relative",
    cursor: "pointer",
    ["&:hover"]: {
      textDecoration: "underline",
    },
  },
  imageButton: {
    height: "100%",
    width: "100%",
    // Make it square:
    paddingBottom: "100%",
    backgroundSize: "cover",
    backgroundPosition: "center",
  },
}));

interface Props {
  playlist: IPlaylist;
  setPlayingId: (id: IEpisode["id"]) => void;
  playingId?: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

const PlaylistGrid = (props: Props) => {
  const classes = useStyles();
  const { state } = useRoomContext();

  const { playlist, playingId, setPlayingId, isPaused, setIsPaused } = props;

  return (
    <div className={classes.gridRoot}>
      {/* Recording episode preview */}
      {state.recordingEpisode && (
        <div key="new" className={classes.tileRoot}>
          <Paper elevation={8}>
            <div
              className={classes.imageButton}
              style={{
                backgroundImage: `url(${state.recordingEpisode.partialEpisode.image_url})`,
              }}
            ></div>
          </Paper>
          <EpisodeTitle
            title={
              state.recordingEpisode.partialEpisode.title || `Nieuwe opname`
            }
          />
        </div>
      )}

      {/* Current episodes */}
      {playlist.episodes.map((episode) => (
        <div
          key={episode.id}
          className={classes.tileRoot}
          aria-label={`play ${episode.title}`}
          onClick={() =>
            episode.id === playingId
              ? setIsPaused(!isPaused)
              : setPlayingId(episode.id)
          }
        >
          <Paper elevation={8}>
            <ButtonBase
              aria-label={`play ${episode.title}`}
              focusRipple={true}
              className={classes.imageButton}
              style={{
                backgroundImage: `url(${
                  episode.image_file &&
                  episode.image_file.data &&
                  episode.image_file.data.thumbnails !== null
                    ? episode.image_file.data.thumbnails.find(
                        (t) => t.height > 100
                      )!.url
                    : ""
                })`,
              }}
            />
          </Paper>
          <EpisodeTitle title={episode.title} />
          {episode.id === playingId && (
            <Fab
              size="large"
              style={{
                position: "absolute",
                left: "50%",
                top: 62,
                marginLeft: -25,
              }}
              color="secondary"
            >
              {!isPaused ? <PauseIcon /> : <PlayIcon />}
            </Fab>
          )}
        </div>
      ))}
    </div>
  );
};

export default PlaylistGrid;

const EpisodeTitle = ({ title }: { title: string }) => (
  <Box mt={1} mb={2} height={42} overflow="hidden" textAlign="left">
    <Typography variant="subtitle2" color="textSecondary">
      {title}
    </Typography>
  </Box>
);
