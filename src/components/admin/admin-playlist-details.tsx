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
} from "@material-ui/core";
import Link from "next/link";
import { AdminPageProps } from "./admin-container";
import AdminHeader from "./layout/admin-header";

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
      <AdminHeader
        title={playlist.title}
        subtitle="Overzicht"
        backLink={{
          href: "/rooms/[roomSlug]/admin",
          as: `/rooms/${slug}/admin`,
        }}
      />

      <Paper>
        <Box p={2}>
          <Box pb={2} pt={2}>
            <Link
              href="/rooms/[roomSlug]/admin/[playlistId]/new"
              as={`/rooms/${slug}/admin/${playlist.id}/new`}
            >
              <Button fullWidth variant="contained">
                Nieuwe Aflevering
              </Button>
            </Link>
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
