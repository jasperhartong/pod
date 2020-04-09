import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Box,
  Typography,
  Collapse,
  ListItemSecondaryAction,
  Fab,
} from "@material-ui/core";
import AddIcon from "@material-ui/icons/Add";
import { IPlaylist } from "../app-schema/IPlaylist";
import { useRoomContext } from "../hooks/useRoomContext";

const PlaylistHeader = ({ playlist }: { playlist: IPlaylist }) => {
  const { state, actions } = useRoomContext();
  const cover =
    playlist.cover_file &&
    playlist.cover_file.data &&
    playlist.cover_file.data.thumbnails !== null
      ? playlist.cover_file.data.thumbnails.find((t) => t.height > 100)!.url
      : "";

  return (
    <>
      <Collapse in={state.mode === "listen"}>
        <Box textAlign="center" pt={1} pb={4}>
          <Avatar
            style={{
              width: 160,
              height: 160,
              display: "inline-block",
              margin: 16,
            }}
            alt={playlist.title}
            src={cover}
          />
          <Typography component="div" variant="overline" color="textSecondary">
            {playlist.description}
          </Typography>
          <Typography variant="h4">{playlist.title}</Typography>
        </Box>
      </Collapse>
      <Collapse in={state.mode === "record"}>
        <ListItem style={{ paddingLeft: 0 }}>
          <ListItemAvatar>
            <Avatar alt={playlist.title} src={cover} />
          </ListItemAvatar>
          <ListItemText
            primary={playlist.title}
            secondary={playlist.description}
          />
          <ListItemSecondaryAction>
            <Fab
              size="small"
              style={{ marginRight: -8 }}
              color={"primary"}
              onClick={() => actions.recordingEpisode.initiate(playlist)}
              aria-label={`Nieuwe opname`}
            >
              <AddIcon />
            </Fab>
          </ListItemSecondaryAction>
        </ListItem>
      </Collapse>
    </>
  );
};

export default PlaylistHeader;
