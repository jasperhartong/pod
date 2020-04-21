import {
  Paper,
  Box,
  List,
  ListSubheader,
  Button,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import Link from "next/link";
import { AdminPageProps } from "./admin-container";
import IconBack from "@material-ui/icons/ChevronLeft";

export const AdminPlaylistDetails = ({ state }: AdminPageProps) => {
  if (!state.room.ok || !state.selectedPlayList) {
    return <>Something went wrong</>;
  }

  const slug = state.room.data.slug;
  const playlist = state.room.data.playlists.find(
    (p) => p.id === state.selectedPlayList
  );

  return (
    <>
      <Box pt={2} pb={1}>
        <Link href="/rooms/[roomSlug]/admin" as={`/rooms/${slug}/admin`}>
          <Button variant="outlined">
            <IconBack /> {state.room.data.title}
          </Button>
        </Link>
      </Box>
      <Paper>
        <Box p={1}>
          <Box p={1}>
            <Typography variant="h5">{playlist && playlist.title}</Typography>
          </Box>
          <Box p={1}>
            <Button
              fullWidth
              variant="contained"
              onClick={() => alert("new episode")}
            >
              Nieuwe Aflevering
            </Button>
          </Box>
          <List>
            <ListSubheader>Laatste 5 afleveringen</ListSubheader>
            {playlist &&
              playlist.episodes.slice(0, 5).map((episode) => (
                <ListItem key={episode.id}>
                  <ListItemAvatar>
                    <Avatar
                      variant="square"
                      alt={episode.title}
                      src={
                        episode.image_file.data.thumbnails.find(
                          (t) => t.width > 100
                        )?.url
                      }
                    />
                  </ListItemAvatar>
                  <ListItemText
                    primary={episode.title}
                    secondary={episode.created_on}
                  />
                </ListItem>
              ))}
          </List>
        </Box>
      </Paper>
    </>
  );
};
