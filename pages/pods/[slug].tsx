import { useState, useEffect } from "react";

import {
  List,
  ListItem,
  ListItemText,
  IconButton,
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  makeStyles,
  ListItemAvatar,
  Avatar,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails,
  Snackbar,
  SnackbarContent,
  LinearProgress,
  ListItemSecondaryAction,
  Tabs,
  Tab
} from "@material-ui/core";
import ReactPlayer from "react-player";
import PlayIcon from "@material-ui/icons/PlayArrow";
import PauseIcon from "@material-ui/icons/Pause";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import NewWindowIcon from "@material-ui/icons/OpenInNew";
import CloseIcon from "@material-ui/icons/Close";
import { getFeedItem } from "../../src/storage/methods";
import { DbFeedItem, DbPodItem } from "../../src/storage/interfaces";
import { rssUrl } from "../../src/storage/urls";
import useWindowSize from "../../src/hooks/useWindowSize";

const PodPage = ({ feed, slug }: { feed: DbFeedItem; slug: string }) => {
  const [playingId, setPlayingId] = useState<number>();
  const [isPaused, setIsPaused] = useState<boolean>(false);

  const playingItem: DbPodItem | undefined = playingId
    ? feed.items.find(i => i.id === playingId)
    : undefined;

  useEffect(() => {
    setIsPaused(false);
  }, [playingId]);

  return (
    <Box pt={2} p={2}>
      <h1 style={{ marginBottom: 0 }}>Mijn Tapes</h1>
      <Box pb={2}>
        <Tabs value={0} indicatorColor="secondary" textColor="secondary">
          <Tab label="Verzonden" />
          <Tab label="Ontvangen" />
        </Tabs>
      </Box>
      <Box pb={4}>
        <FeedGridRow
          feed={feed}
          playingId={playingId}
          setPlayingId={setPlayingId}
          isPaused={isPaused}
          setIsPaused={setIsPaused}
        />
      </Box>
      <SubscribePanel slug={slug} />
      <SnackBarPlayer
        playingItem={playingItem}
        isPaused={isPaused}
        setPlayingId={setPlayingId}
        setIsPaused={setIsPaused}
      />
    </Box>
  );
};

const SnackBarPlayer = ({
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

export async function getServerSideProps(context) {
  const slug = context.query.slug || null; // null is serializable
  const feed = await getFeedItem(slug);
  return {
    props: { feed, slug }
  };
}

export default PodPage;

const SubscribePanel = ({ slug }: { slug: string }) => {
  const subscribeLinks: { url: string; label: string }[] = [
    { label: "Apple Podcast (iPad / iPhone)", url: rssUrl(slug, "podcast") },
    { label: "Apple Podcast (Mac)", url: rssUrl(slug, "pcast") },
    { label: "RSS Feed", url: rssUrl(slug, "feed") },
    { label: "XML", url: rssUrl(slug) }
  ];

  return (
    <ExpansionPanel
      style={{ maxWidth: 480 }}
      onChange={(_, isExpanded) => {
        if (isExpanded) {
          window.setTimeout(() => {
            window.scrollBy({ top: 1000 });
          }, 300);
        }
      }}
    >
      <ExpansionPanelSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="subscribe-content"
        id="subscribe-header"
      >
        <Typography>
          Abboneer in je Podcast App en blijf altijd up-to-date.
        </Typography>
      </ExpansionPanelSummary>
      <ExpansionPanelDetails id="subscribe-content">
        <List dense>
          {subscribeLinks.map(link => (
            <ListItem
              component="a"
              key={`${link.url}${link.label}`}
              button
              href={link.url}
            >
              <NewWindowIcon
                fontSize="small"
                color="secondary"
                style={{ marginRight: 8 }}
              />{" "}
              <ListItemText primary={link.label} />
            </ListItem>
          ))}
        </List>
      </ExpansionPanelDetails>
    </ExpansionPanel>
  );
};

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

const FeedGridRow = ({
  feed,
  playingId,
  setPlayingId,
  isPaused,
  setIsPaused
}: {
  feed: DbFeedItem;
  setPlayingId: (id: number | undefined) => void;
  playingId?: number;
  isPaused: boolean;
  setIsPaused: (paused: boolean) => void;
}) => {
  const classes = useStyles();
  const [width, _] = useWindowSize();

  const cellHeight = 160;
  const cols = Math.floor(width / cellHeight);

  return (
    <>
      <ListItem style={{ paddingLeft: 0 }}>
        <ListItemAvatar>
          <Avatar
            alt={feed.author_name}
            src={feed.cover_file.data.thumbnails.find(t => t.height < 100).url}
          />
        </ListItemAvatar>
        <ListItemText primary={feed.title} secondary={feed.description} />
      </ListItem>
      <GridList cellHeight={cellHeight} cols={cols}>
        {feed.items.map(item => (
          <GridListTile
            style={{
              border:
                item.id === playingId
                  ? "1px solid white"
                  : "1px solid transparent"
            }}
            key={item.id}
            cols={1}
          >
            <img
              src={
                item.image_file.data.thumbnails.find(t => t.height > 100).url
              }
              alt={item.title}
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
