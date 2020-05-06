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
import SubscribePanel from "../subscribe-panel";
import AdminHeader from "./layout/admin-header";
import { IResponse } from "../../api/IResponse";
import { IRoom } from "../../app-schema/IRoom";
import AppContainer from "../app-container";
import { useRouter } from "next/dist/client/router";
import PageFooter from "../page-footer";
import { RPCClientFactory } from "../../api/rpc/rpc-client";
import playlistCreateMeta from "../../api/rpc/commands/playlist.create.meta";
import { useSWRRoom } from "../../hooks/useSWRRoom";

export const AdminOverview = ({ room }: { room: IResponse<IRoom> }) => {
  const router = useRouter();
  const { revalidate } = useSWRRoom();

  if (!room.ok) {
    return <>error</>;
  }
  const slug = room.data.slug;

  const handlePlaylistCreation = async () => {
    const playlistCreation = await RPCClientFactory(playlistCreateMeta).call({
      roomId: room.data.id,
      data: {
        title: "💅 Nice",
        description: "is it?",
        image_url:
          "https://api.directus.cloud/dcMJTq1b80lIY4CT/assets/crsl719k1m0ow04g?key=directus-medium-crop",
      },
    });
    if (!playlistCreation.ok) {
      alert(playlistCreation.error);
    } else {
      await revalidate();
      router.push(
        "/rooms/[roomSlug]/admin/[playlistId]",
        `/rooms/${slug}/admin/${playlistCreation.data.id}`
      );
    }
  };

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <AdminHeader
          image={room.data.cover_file.data.full_url}
          title={room.data.title}
          subtitle="tapes.me"
        />

        <Paper>
          <Box pl={2} pr={2} pt={2}>
            <Typography variant="overline">Collecties</Typography>
          </Box>
          {room.data.playlists.map((p) => (
            <Box style={{ width: "100%" }} key={p.id}>
              <List style={{ padding: 0, width: "100%" }}>
                <PlaylistHeader
                  key={p.id}
                  playlist={p}
                  onClick={() => {
                    router.push(
                      "/rooms/[roomSlug]/admin/[playlistId]",
                      `/rooms/${slug}/admin/${p.id}`
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
            <Button fullWidth onClick={handlePlaylistCreation}>
              Nieuwe collectie beginnen
            </Button>
          </Box>
        </Paper>

        <Box pt={4}>
          <SubscribePanel slug={room.data.slug} />
        </Box>
        <Box pt={4}>
          <NextLink href="/rooms/[roomSlug]" as={`/rooms/${slug}`}>
            <Button fullWidth>Open Luisterkamer</Button>
          </NextLink>
        </Box>

        <PageFooter />
      </Container>
    </AppContainer>
  );
};
