import {
  GridList,
  GridListTile,
  GridListTileBar,
  makeStyles,
  Chip,
  Fab,
  Fade,
  Grid,
} from "@material-ui/core";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import MicIcon from "@material-ui/icons/Mic";
import AddIcon from "@material-ui/icons/Add";
import { IPlaylist } from "../app-schema/IPlaylist";
import useWindowSize from "../hooks/useWindowSize";
import themeOptionsProvider from "../theme";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { useRoomContext } from "../hooks/useRoomContext";

const useStyles = makeStyles((theme) => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper,
  },
  gridList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)",
  },
  title: {
    fontSize: 11,
    overflow: "visible",
    lineHeight: "inherit",
    whiteSpace: "normal",
    textOverflow: "auto",
  },
  titleBar: {
    background:
      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
}));

interface Props {
  playlist: IPlaylist;
  setPlayingId: (id: number | undefined) => void;
  playingId?: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  maxWidth?: Breakpoint;
}

const PlaylistGrid = (props: Props) => {
  const classes = useStyles();
  const { roomState, recordingActions } = useRoomContext();
  const [width, _] = useWindowSize();

  const { mode, newRecording } = roomState;
  const {
    playlist,
    playingId,
    setPlayingId,
    isPaused,
    setIsPaused,
    maxWidth,
  } = props;

  const maxPixelWidth = maxWidth
    ? Math.min(themeOptionsProvider.theme.breakpoints.width(maxWidth), width)
    : width;
  const cellWidth = 160;
  const cols = Math.floor(maxPixelWidth / cellWidth);

  return (
    <>
      <GridList cellHeight={(cellWidth * 4) / 3} cols={cols}>
        {mode === "record" && (
          <GridListTile key="new" cols={1}>
            {newRecording && newRecording.episodeCreation.image_url ? (
              <img src={newRecording.episodeCreation.image_url} />
            ) : (
              <Grid
                container
                style={{
                  height: "100%",
                  width: "100%",
                  background:
                    themeOptionsProvider.theme.palette.background.paper,
                }}
                justify="space-around"
                alignContent="center"
                alignItems="center"
              >
                <Grid item>
                  <MicIcon
                    fontSize="large"
                    color="secondary"
                    style={{ opacity: 0.4 }}
                  />
                </Grid>
              </Grid>
            )}

            <GridListTileBar
              title={newRecording?.episodeCreation.title || `Nieuwe opname`}
              classes={{
                root: classes.titleBar,
                title: classes.title,
              }}
              actionIcon={
                <Fab
                  size="small"
                  style={{ marginRight: 4, marginBottom: 4 }}
                  color={"primary"}
                  onClick={() => recordingActions.initiate(playlist)}
                  aria-label={`Nieuwe opname`}
                >
                  <AddIcon />
                </Fab>
              }
            />
          </GridListTile>
        )}

        {playlist.episodes.map((episode) => (
          <GridListTile
            style={{
              border:
                episode.id === playingId
                  ? `1px solid ${themeOptionsProvider.theme.palette.primary.main}`
                  : "1px solid transparent",
            }}
            key={episode.id}
            cols={1}
          >
            <img
              src={
                episode.image_file &&
                episode.image_file.data &&
                episode.image_file.data.thumbnails !== null
                  ? episode.image_file.data.thumbnails.find(
                      (t) => t.height > 100
                    )!.url
                  : ""
              }
              alt={episode.title || undefined}
            />
            <GridListTileBar
              title={episode.title}
              classes={{
                root: classes.titleBar,
                title: classes.title,
              }}
              actionIcon={
                <Fab
                  size="small"
                  style={{ marginRight: 4, marginBottom: 4 }}
                  color={episode.id === playingId ? "primary" : "secondary"}
                  onClick={() =>
                    episode.id === playingId
                      ? setIsPaused(!isPaused)
                      : setPlayingId(episode.id)
                  }
                  aria-label={`play ${episode.title}`}
                >
                  {episode.id === playingId && !isPaused ? (
                    <PauseIcon />
                  ) : (
                    <PlayIcon />
                  )}
                </Fab>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </>
  );
};

export default PlaylistGrid;
