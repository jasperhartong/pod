import NextLink from "next/link";
import {
  Button,
  List,
  Box,
  Paper,
  Container,
  Typography,
  Divider,
} from "@material-ui/core";
import PlaylistHeader from "../playlist-header";
import { PodcastPanel } from "../podcast-panel";
import AdminHeader from "./layout/admin-header";
import { IRoom } from "../../app-schema/IRoom";
import AppContainer from "../app-container";
import { useRouter } from "next/dist/client/router";
import PageFooter from "../page-footer";

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
          <PodcastPanel slug={room.slug} />
        </Box>
        <Box pt={4}>
          <NextLink href="/rooms/[roomSlug]" as={`/rooms/${room.slug}`}>
            <Button fullWidth>Open Luisterkamer</Button>
          </NextLink>
        </Box>

        <PageFooter />
      </Container>
    </AppContainer>
  );
};
