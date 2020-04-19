import { ReactNode } from "react";
import {
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { IPlaylist } from "../app-schema/IPlaylist";

const PlaylistHeader = ({
  playlist,
  onClick,
  secondaryAction,
}: {
  playlist: IPlaylist;
  onClick?: () => void;
  secondaryAction?: ReactNode;
}) => {
  const cover =
    playlist.cover_file &&
    playlist.cover_file.data &&
    playlist.cover_file.data.thumbnails !== null
      ? playlist.cover_file.data.thumbnails.find((t) => t.height > 100)!.url
      : "";

  return (
    <ListItem
      // @ts-ignore
      button={!!onClick ? true : undefined}
      onClick={onClick}
    >
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
      {secondaryAction && (
        <ListItemSecondaryAction>{secondaryAction}</ListItemSecondaryAction>
      )}
    </ListItem>
  );
};

export default PlaylistHeader;
