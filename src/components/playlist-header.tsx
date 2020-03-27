import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Typography,
  Collapse
} from "@material-ui/core";
import { DbPlaylist } from "../storage/interfaces";
import { useRoomContext } from "../hooks/useRoomContext";

const PlaylistHeader = ({ playlist }: { playlist: DbPlaylist }) => {
  const { roomState } = useRoomContext();
  const cover =
    playlist.cover_file &&
    playlist.cover_file.data &&
    playlist.cover_file.data.thumbnails !== null
      ? playlist.cover_file.data.thumbnails.find(t => t.height > 100)!.url
      : "";

  return (
    <>
      <Collapse in={roomState.mode === "listen"}>
        <Box textAlign="center" pt={1} pb={4}>
          <Avatar
            style={{
              width: 160,
              height: 160,
              display: "inline-block",
              margin: 16
            }}
            alt={playlist.from}
            src={cover}
          />
          <Typography component="div" variant="overline" color="textSecondary">
            van {playlist.from}, voor:
          </Typography>
          <Typography variant="h4">{playlist.to}</Typography>
        </Box>
      </Collapse>
      <Collapse in={roomState.mode === "record"}>
        <ListItem style={{ paddingLeft: 0 }}>
          <ListItemAvatar>
            <Avatar alt={playlist.from} src={cover} />
          </ListItemAvatar>
          <ListItemText
            primary={`Voor ${playlist.to}`}
            secondary={`Van ${playlist.from}`}
          />
        </ListItem>
      </Collapse>
    </>
  );
};

export default PlaylistHeader;
