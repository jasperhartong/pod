import { IRoom } from "@/app-schema/IRoom";
import {
  Box,
  Button,
  Container,
  Divider,
  Grid,
  List,
  Paper,
  Typography,
} from "@material-ui/core";
import IconHeadset from "@material-ui/icons/Headset";
import IconMic from "@material-ui/icons/Mic";
import { useRouter } from "next/dist/client/router";
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
            <Grid container alignContent="center" alignItems="center">
              <Grid item>
                <IconMic
                  fontSize="small"
                  style={{ marginRight: 4, marginTop: 2 }}
                />
              </Grid>
              <Grid item>
                <Typography variant="overline">
                  Neem nieuwe afleveringen op
                </Typography>
              </Grid>
            </Grid>
          </Box>
          {room.playlists.map((p) => (
            <Box style={{ width: "100%" }} key={p.uid}>
              <List style={{ padding: 0, width: "100%" }}>
                <PlaylistHeader
                  key={p.uid}
                  playlist={p}
                  onClick={() => {
                    router.push(
                      "/rooms/[roomUid]/admin/[playlistUid]",
                      `/rooms/${room.uid}/admin/${p.uid}`
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
                  "/rooms/[roomUid]/admin/new-playlist",
                  `/rooms/${room.uid}/admin/new-playlist`
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
              <Grid container alignContent="center" alignItems="center">
                <Grid item>
                  <IconHeadset
                    fontSize="small"
                    style={{ marginRight: 4, marginTop: 2 }}
                  />
                </Grid>
                <Grid item>
                  <Typography variant="overline">
                    Deel de afleveringen om te luisteren
                  </Typography>
                </Grid>
              </Grid>
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
