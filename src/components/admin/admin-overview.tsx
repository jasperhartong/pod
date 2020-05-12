import { IRoom } from "@/app-schema/IRoom";
import { useRouter } from "@/hooks/useRouter";
import {
  Box,
  Button,
  Container,
  Divider,
  List,
  Paper,
  Typography,
} from "@material-ui/core";
import AppContainer from "../app-container";
import PageFooter from "../page-footer";
import PlaylistHeader from "../playlist-header";
import { ListenRoomPanel } from "./components/listen-room-panel";
import { PodcastPanel } from "./components/podcast-panel";
import AdminHeader from "./layout/admin-header";

export const AdminOverview = ({ room }: { room: IRoom }) => {
  const router = useRouter();

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <AdminHeader
          image={room.cover_file.data.full_url}
          title={room.title}
          subtitle="tapes.me"
        />

        <Paper>
          <Box pl={2} pr={2} pt={2}>
            <Typography variant="overline">Collecties</Typography>
          </Box>
          {room.playlists.map((p) => (
            <Box style={{ width: "100%" }} key={p.id}>
              <List style={{ padding: 0, width: "100%" }}>
                <PlaylistHeader
                  key={p.id}
                  playlist={p}
                  onClick={() => {
                    router.push(
                      "/rooms/[roomSlug]/admin/[playlistId]",
                      `/rooms/${room.slug}/admin/${p.id}`
                    );
                  }}
                  secondaryAction={
                    <Typography variant="button">Open</Typography>
                  }
                />
              </List>
            </Box>
          ))}

          <Box pt={2}>
            <Divider />
          </Box>

          <Box p={2}>
            <Button
              fullWidth
              onClick={() => {
                router.push(
                  "/rooms/[roomSlug]/admin/new-playlist",
                  `/rooms/${room.slug}/admin/new-playlist`
                );
              }}
            >
              Nieuwe collectie beginnen
            </Button>
          </Box>
        </Paper>

        <Box pt={4}>
          <Paper>
            <Box pl={2} pr={2} pt={1} pb={1}>
              <Typography variant="overline">Delen</Typography>
            </Box>
          </Paper>
          <ListenRoomPanel room={room} />
          <PodcastPanel room={room} />
        </Box>

        <PageFooter />
      </Container>
    </AppContainer>
  );
};
