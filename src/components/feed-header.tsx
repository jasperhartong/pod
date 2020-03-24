import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from "@material-ui/core";
import { DbFeedItem } from "../storage/interfaces";

const FeedHeader = ({ feed }: { feed: DbFeedItem }) => (
  <ListItem style={{ paddingLeft: 0 }}>
    <ListItemAvatar>
      <Avatar
        alt={feed.author_name}
        src={feed.cover_file.data.thumbnails.find(t => t.height < 100).url}
      />
    </ListItemAvatar>
    <ListItemText primary={feed.title} secondary={feed.description} />
  </ListItem>
);

export default FeedHeader;
