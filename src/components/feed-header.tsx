import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText
} from "@material-ui/core";
import { DbPlaylist } from "../storage/interfaces";

const FeedHeader = ({ feed }: { feed: DbPlaylist }) => (
  <ListItem style={{ paddingLeft: 0 }}>
    <ListItemAvatar>
      <Avatar
        alt={feed.author_name || undefined}
        src={
          feed.cover_file &&
          feed.cover_file.data &&
          feed.cover_file.data.thumbnails !== null
            ? feed.cover_file.data.thumbnails.find(t => t.height < 100)!.url
            : ""
        }
      />
    </ListItemAvatar>
    <ListItemText primary={feed.title} secondary={feed.description} />
  </ListItem>
);

export default FeedHeader;
