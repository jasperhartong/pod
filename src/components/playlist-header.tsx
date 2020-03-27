import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Typography
} from "@material-ui/core";
import { DbPlaylist } from "../storage/interfaces";
import { useRoomContext } from "../hooks/useRoomContext";

const PlaylistHeader = ({ playlist }: { playlist: DbPlaylist }) => {
  const { roomState } = useRoomContext();
  if (roomState.mode === "listen") {
    return (
      <Box textAlign="center" pt={1} pb={4}>
        <Avatar
          style={{
            width: 160,
            height: 160,
            display: "inline-block",
            margin: 16
          }}
          alt={playlist.from}
          src="/elshartong.png"
        />
        <Typography component="div" variant="overline" color="textSecondary">
          van {playlist.from}, voor:
        </Typography>
        <Typography variant="h4">{playlist.to}</Typography>
      </Box>
    );
  } else {
    return (
      <ListItem style={{ paddingLeft: 0 }}>
        <ListItemAvatar>
          <Avatar
            alt={playlist.from}
            src={
              playlist.cover_file &&
              playlist.cover_file.data &&
              playlist.cover_file.data.thumbnails !== null
                ? playlist.cover_file.data.thumbnails.find(t => t.height < 100)!
                    .url
                : ""
            }
          />
        </ListItemAvatar>
        <ListItemText
          primary={`Voor ${playlist.to}`}
          secondary={`Van ${playlist.from}`}
        />
      </ListItem>
    );
  }
};

export default PlaylistHeader;
