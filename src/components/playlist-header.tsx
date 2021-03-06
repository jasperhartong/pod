import { IPlaylist } from "@/app-schema/IPlaylist";
import {
  Avatar,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
} from "@material-ui/core";
import { ReactNode } from "react";

const PlaylistHeader = ({
  playlist,
  onClick,
  secondaryAction,
}: {
  playlist: IPlaylist;
  onClick?: () => void;
  secondaryAction?: ReactNode;
}) => {
  const cover = playlist.cover_file.data.full_url;

  return (
    <ListItem
      // @ts-ignore
      button={!!onClick ? true : undefined}
      onClick={onClick}
    >
      <ListItemAvatar>
        <Avatar
          variant="square"
          style={{ height: 80, width: 80, marginRight: 16 }}
          alt={playlist.title}
          src={cover}
        />
      </ListItemAvatar>
      <ListItemText
        primary={playlist.title}
        secondary={`${playlist.description} • ${playlist.episodes.length} ${
          playlist.episodes.length === 1 ? "aflevering" : "afleveringen"
        }`}
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
