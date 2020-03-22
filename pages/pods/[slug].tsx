import { getFeedItem } from "../../src/storage/methods";
import { DbFeedItem } from "../../src/storage/interfaces";
import { rssUrl } from "../../src/storage/urls";
import {
  List,
  ListItem,
  ListItemText,
  Divider,
  IconButton,
  Box,
  GridList,
  GridListTile,
  GridListTileBar,
  makeStyles,
  ListSubheader,
  ListItemAvatar,
  Avatar,
  ExpansionPanel,
  ExpansionPanelSummary,
  Typography,
  ExpansionPanelDetails
} from "@material-ui/core";
import PlayIcon from "@material-ui/icons/PlayArrow";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import useWindowSize from "../../src/hooks/useWindowSize";

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

const PodPage = ({ feed, slug }: { feed: DbFeedItem; slug: string }) => {
  const classes = useStyles();
  const [width, _] = useWindowSize();
  const subscribeLinks: { url: string; label: string }[] = [
    { label: "Apple Podcast (iPad / iPhone)", url: rssUrl(slug, "podcast") },
    { label: "Apple Podcast (Mac)", url: rssUrl(slug, "pcast") },
    { label: "RSS Feed", url: rssUrl(slug, "feed") },
    { label: "XML", url: rssUrl(slug) }
  ];

  const cellHeight = 160;
  const cols = Math.floor(width / cellHeight);

  return (
    <Box pt={2} p={2}>
      <h1>Luister bibliotheek</h1>
      <Box pb={4}>
        <ListItem style={{ paddingLeft: 0 }}>
          <ListItemAvatar>
            <Avatar
              alt={feed.author_name}
              src={
                feed.cover_file.data.thumbnails.find(t => t.height < 100).url
              }
            />
          </ListItemAvatar>
          <ListItemText
            primary={feed.author_name}
            secondary={feed.description}
          />
        </ListItem>
        <GridList cellHeight={cellHeight} cols={cols}>
          {feed.items.map(item => (
            <GridListTile
              key={item.id}
              cols={1}
              style={{ position: "relative" }}
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
                    href={item.audio_file.data.full_url}
                    aria-label={`play ${item.title}`}
                  >
                    <PlayIcon />
                  </IconButton>
                }
              />
            </GridListTile>
          ))}
        </GridList>
      </Box>

      <ExpansionPanel style={{ maxWidth: 480 }}>
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
                <ListItemText primary={link.label} />
              </ListItem>
            ))}
          </List>
        </ExpansionPanelDetails>
      </ExpansionPanel>
    </Box>
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
