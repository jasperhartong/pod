import {
  makeStyles,
  Typography,
  Box,
  ButtonBase,
  Link,
} from "@material-ui/core";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import MicIcon from "@material-ui/icons/Mic";
import { IPlaylist } from "../app-schema/IPlaylist";
import useWindowSize from "../hooks/useWindowSize";
import themeOptionsProvider from "../theme";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { useRoomContext } from "../hooks/useRoomContext";
import { IEpisode } from "../app-schema/IEpisode";

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
  setPlayingId: (id: IEpisode["id"]) => void;
  playingId?: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  maxWidth?: Breakpoint;
}

const PlaylistGrid = (props: Props) => {
  const classes = useStyles();
  const { state } = useRoomContext();
  const [width, _] = useWindowSize();

  const { mode, recordingEpisode } = state;
  const {
    playlist,
    playingId,
    setPlayingId,
    isPaused,
    setIsPaused,
    maxWidth,
  } = props;

  // const maxPixelWidth = maxWidth
  //   ? Math.min(themeOptionsProvider.theme.breakpoints.width(maxWidth), width)
  //   : width;
  // const cellWidth = 160;
  // const cols = Math.floor(maxPixelWidth / cellWidth);

  return (
    <div
      style={{
        //https://mastery.games/post/tile-layouts/
        display: "grid",
        gridColumnGap: 16,
        gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
      }}
    >
      {playlist.episodes.map((episode) => (
        <div>
          <Box>
            <ButtonBase
              focusRipple={true}
              onClick={() =>
                episode.id === playingId
                  ? setIsPaused(!isPaused)
                  : setPlayingId(episode.id)
              }
              style={{
                height: "100%",
                width: "100%",
                paddingBottom: "100%",
                boxShadow: "rgba(0,0,0,0.8) 1px 1px 2px",
                borderBottom:
                  episode.id === playingId
                    ? `6px solid ${themeOptionsProvider.theme.palette.primary.main}`
                    : "6px solid transparent",
                backgroundSize: "cover",
                backgroundPosition: "center",
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
            <Box mt={1} mb={2} height={42} overflow="hidden" textAlign="left">
              <Typography variant="subtitle2">
                <Link
                  tabIndex={-1}
                  color={episode.id === playingId ? "primary" : "inherit"}
                  href="#"
                  onClick={() =>
                    episode.id === playingId
                      ? setIsPaused(!isPaused)
                      : setPlayingId(episode.id)
                  }
                >
                  {episode.title}
                </Link>
              </Typography>
            </Box>
          </Box>
        </div>
      ))}
    </div>
  );

  // return (
  //   <>
  //     <GridList cellHeight={cellWidth} cols={cols}>
  //       {Boolean(recordingEpisode) && (
  //         <GridListTile key="new" cols={1}>
  //           {recordingEpisode && recordingEpisode.partialEpisode.image_url ? (
  //             <img src={recordingEpisode.partialEpisode.image_url} />
  //           ) : (
  //             <Grid
  //               container
  //               style={{
  //                 height: "100%",
  //                 width: "100%",
  //                 background:
  //                   themeOptionsProvider.theme.palette.background.paper,
  //               }}
  //               justify="space-around"
  //               alignContent="center"
  //               alignItems="center"
  //             >
  //               <Grid item>
  //                 <MicIcon
  //                   fontSize="large"
  //                   color="secondary"
  //                   style={{ opacity: 0.4 }}
  //                 />
  //               </Grid>
  //             </Grid>
  //           )}

  //           <GridListTileBar
  //             title={recordingEpisode?.partialEpisode.title || `Nieuwe opname`}
  //             classes={{
  //               root: classes.titleBar,
  //               title: classes.title,
  //             }}
  //           />
  //         </GridListTile>
  //       )}

  //       {playlist.episodes.map((episode) => (
  //         <GridListTile
  //           style={{
  //             border:
  //               episode.id === playingId
  //                 ? `1px solid ${themeOptionsProvider.theme.palette.primary.main}`
  //                 : "1px solid transparent",
  //           }}
  //           key={episode.id}
  //           cols={1}
  //         >
  //           <img
  //             loading="lazy"
  //             src={
  //               episode.image_file &&
  //               episode.image_file.data &&
  //               episode.image_file.data.thumbnails !== null
  //                 ? episode.image_file.data.thumbnails.find(
  //                     (t) => t.height > 100
  //                   )!.url
  //                 : ""
  //             }
  //             alt={episode.title || undefined}
  //           />
  //           <GridListTileBar
  //             title={episode.title}
  //             classes={{
  //               root: classes.titleBar,
  //               title: classes.title,
  //             }}
  //             actionIcon={
  //               <Fab
  //                 size="small"
  //                 style={{ marginRight: 4, marginBottom: 4 }}
  //                 color={episode.id === playingId ? "primary" : "secondary"}
  //                 onClick={() =>
  //                   episode.id === playingId
  //                     ? setIsPaused(!isPaused)
  //                     : setPlayingId(episode.id)
  //                 }
  //                 aria-label={`play ${episode.title}`}
  //               >
  //                 {episode.id === playingId && !isPaused ? (
  //                   <PauseIcon />
  //                 ) : (
  //                   <PlayIcon />
  //                 )}
  //               </Fab>
  //             }
  //           />
  //         </GridListTile>
  //       ))}
  //     </GridList>
  //     {mode === "listen" && playlist.episodes.length === 0 && (
  //       <Box textAlign="center">
  //         <Typography variant="overline">
  //           Deze afspeellijst bevat nog geen opnames
  //         </Typography>
  //       </Box>
  //     )}
  //   </>
  // );
};

export default PlaylistGrid;
