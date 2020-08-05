import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { Box, ButtonBase, Fab, makeStyles, Paper, Typography } from "@material-ui/core";
import PauseIcon from "@material-ui/icons/Pause";
import PlayIcon from "@material-ui/icons/PlayArrow";
import LazyLoad from "react-lazyload";

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
  setPlayingUid: (id: IEpisode["uid"]) => void;
  playingUid?: IEpisode["uid"];
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}

const PlaylistGrid = (props: Props) => {
  const classes = useStyles();

  const { playlist, playingUid, setPlayingUid, isPaused, setIsPaused } = props;

  const episodes = playlist.episodes.slice().reverse();

  return (
    <div className={classes.gridRoot}>
      {/* Current episodes */}
      {/* Busines Logic: Only show playlists that contain published episodes */}
      {episodes
        .filter((e) => e.status === "published")
        .map((episode) => (
          <div
            key={episode.uid}
            className={classes.tileRoot}
            aria-label={`play ${episode.title}`}
            onClick={() =>
              episode.uid === playingUid
                ? setIsPaused(!isPaused)
                : setPlayingUid(episode.uid)
            }
          >
            <Paper elevation={3}>
              <LazyLoad
                once={true}
                offset={200}
                resize={true}
                placeholder={<div className={classes.imageButton} />}
              >
                <ButtonBase
                  aria-label={`play ${episode.title}`}
                  focusRipple={true}
                  className={classes.imageButton}
                  style={{
                    backgroundImage: `url(${episode.image_file.data.full_url}`,
                  }}
                />
              </LazyLoad>
            </Paper>
            <EpisodeTitle title={episode.title} />
            {episode.uid === playingUid && (
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
