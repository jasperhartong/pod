import {
  IconButton,
  GridList,
  GridListTile,
  GridListTileBar,
  makeStyles,
  Chip
} from "@material-ui/core";
import HeadPhoneIcon from "@material-ui/icons/Headset";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import { DbPlaylist } from "../../src/storage/interfaces";
import useWindowSize from "../../src/hooks/useWindowSize";
import themeOptionsProvider from "../theme";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";

const useStyles = makeStyles(theme => ({
  root: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "space-around",
    overflow: "hidden",
    backgroundColor: theme.palette.background.paper
  },
  gridList: {
    flexWrap: "nowrap",
    // Promote the list into his own layer on Chrome. This cost memory but helps keeping high FPS.
    transform: "translateZ(0)"
  },
  title: {
    fontSize: 11,
    overflow: "visible",
    lineHeight: "inherit",
    whiteSpace: "normal",
    textOverflow: "auto"
  },
  titleBar: {
    background:
      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)"
  }
}));

const FeedGrid = ({
  feed,
  playingId,
  setPlayingId,
  isPaused,
  setIsPaused,
  maxWidth
}: {
  feed: DbPlaylist;
  setPlayingId: (id: number | undefined) => void;
  playingId?: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
  maxWidth?: Breakpoint;
}) => {
  const classes = useStyles();
  const [width, _] = useWindowSize();

  const maxPixelWidth = maxWidth
    ? Math.min(themeOptionsProvider.theme.breakpoints.width(maxWidth), width)
    : width;
  const cellHeight = 160;
  const cols = Math.floor(maxPixelWidth / cellHeight);

  return (
    <>
      <GridList cellHeight={cellHeight} cols={cols}>
        {feed.items.map(item => (
          <GridListTile
            style={{
              border:
                item.id === playingId
                  ? `1px solid ${themeOptionsProvider.theme.palette.primary.main}`
                  : "1px solid transparent"
            }}
            key={item.id}
            cols={1}
          >
            <Chip
              size="small"
              icon={<HeadPhoneIcon />}
              label={item.download_count}
              color="secondary"
              style={{ position: "absolute", zIndex: 2, top: 8, left: 8 }}
            />
            <img
              src={
                item.image_file &&
                item.image_file.data &&
                item.image_file.data.thumbnails !== null
                  ? item.image_file.data.thumbnails.find(t => t.height > 100)!
                      .url
                  : ""
              }
              alt={item.title || undefined}
            />
            <GridListTileBar
              title={item.title}
              classes={{
                root: classes.titleBar,
                title: classes.title
              }}
              actionIcon={
                <IconButton
                  // href={item.audio_file.data.full_url}
                  onClick={() =>
                    item.id === playingId
                      ? setIsPaused(!isPaused)
                      : setPlayingId(item.id)
                  }
                  aria-label={`play ${item.title}`}
                >
                  {item.id === playingId && !isPaused ? (
                    <PauseIcon style={{ color: "white" }} />
                  ) : (
                    <PlayIcon style={{ color: "white" }} />
                  )}
                </IconButton>
              }
            />
          </GridListTile>
        ))}
      </GridList>
    </>
  );
};

export default FeedGrid;
