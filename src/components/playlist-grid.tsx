import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { ButtonBase, makeStyles, Paper } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  gridRoot: {
    //https://mastery.games/post/tile-layouts/
    display: "grid",
    gridColumnGap: 16,
    gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))",
  },
  tileRoot: {
    position: "relative",
    cursor: "pointer",
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

  const { playlist, playingId, setPlayingId, isPaused, setIsPaused } = props;

  return (
    <div className={classes.gridRoot}>
      {/* Current episodes */}
      {/* Busines Logic: Only show playlists that contain published episodes */}
      {playlist.episodes
        .filter((e) => e.status === "published")
        .map((episode) => (
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
                  backgroundImage: `url(${episode.image_file.data.full_url}`,
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
