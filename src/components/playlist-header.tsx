import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Zoom,
  ListItemSecondaryAction,
  Fab,
  List,
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
    <List>
      <ListItem style={{ paddingLeft: 0 }}>
        <ListItemAvatar>
          <Avatar
            style={{ height: 80, width: 80, marginRight: 16 }}
            alt={playlist.title}
            src={cover}
          />
        </ListItemAvatar>
        <ListItemText
          primary={playlist.title}
          secondary={playlist.description}
          primaryTypographyProps={{ variant: "h5" }}
          secondaryTypographyProps={{ variant: "h6" }}
        />
        <ListItemSecondaryAction>
          <Zoom in={state.mode === "record"}>
            <Fab
              size="small"
              style={{ marginRight: -8 }}
              color={"primary"}
              onClick={() => actions.recordingEpisode.initiate(playlist)}
              aria-label={`Nieuwe opname`}
            >
              <AddIcon />
            </Fab>
          </Zoom>
        </ListItemSecondaryAction>
      </ListItem>
    </List>
  );
};

export default PlaylistHeader;
