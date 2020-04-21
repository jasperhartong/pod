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
  Grid,
} from "@material-ui/core";
import Link from "next/link";
import { AdminPageProps } from "./admin-container";
import IconBack from "@material-ui/icons/ChevronLeft";

export const AdminPlaylistDetails = ({ state }: AdminPageProps) => {
  if (!state.room.ok || !state.selectedPlayList) {
    return <>Error</>;
  }

  const slug = state.room.data.slug;
  const playlist = state.room.data.playlists.find(
    (p) => p.id === state.selectedPlayList
  );

  if (!playlist) {
    return <>Error</>;
  }

  return (
    <>
      <Box pt={2} pb={2} textAlign="center">
        <Typography component="div" variant="h6">
          {playlist.title}
        </Typography>
        <Typography component="div" variant="overline">
          afspeellijst
        </Typography>
      </Box>
      <Paper>
        <Box p={2}>
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
          <Box pt={2}>
            <Grid container justify="space-between">
              <Grid item>
                <Link
                  href="/rooms/[roomSlug]/admin"
                  as={`/rooms/${slug}/admin`}
                >
                  <Button variant="outlined">
                    <IconBack /> {state.room.data.title}
                  </Button>
                </Link>
              </Grid>
              <Grid item>
                <Link
                  href="/rooms/[roomSlug]/admin/[playlistId]/new"
                  as={`/rooms/${slug}/admin/${playlist.id}/new`}
                >
                  <Button fullWidth variant="contained">
                    Nieuwe Aflevering
                  </Button>
                </Link>
              </Grid>
            </Grid>
          </Box>
        </Box>
      </Paper>
    </>
  );
};
