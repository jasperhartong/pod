import { Button, List, Paper, Box, Divider } from "@material-ui/core";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import PlaylistHeader from "../playlist-header";
import SubscribePanel from "../subscribe-panel";
import { AdminPageProps } from "./admin-container";
import { useRouter } from "next/dist/client/router";
import { useEffect } from "react";
import AdminHeader from "./layout/admin-header";

export const AdminOverview = ({ state }: AdminPageProps) => {
  if (!state.room.ok) {
    return <>error</>;
  }
  const slug = state.room.data.slug;
  const router = useRouter();

  useEffect(() => {
    if (state.room.ok) {
      state.room.data.playlists.forEach((p) =>
        router.prefetch(
          "/rooms/[roomSlug]/admin/[playlistId]",
          `/rooms/${slug}/admin/${p.id}`
        )
      );
    }
  }, []);

  return (
    <>
      <AdminHeader title={state.room.data.title} subtitle="admin" />
      <Paper>
        <Box p={1}>
          <List>
            {state.room.data.playlists.map((p) => (
              <PlaylistHeader
                key={p.id}
                playlist={p}
                onClick={() =>
                  router.push(
                    "/rooms/[roomSlug]/admin/[playlistId]",
                    `/rooms/${slug}/admin/${p.id}`
                  )
                }
                secondaryAction={<ChevronRightIcon />}
              />
            ))}
          </List>
        </Box>
        <Divider />
        <Box textAlign="center" p={2}>
          <Button variant="outlined" onClick={() => alert("😅 Coming soon!")}>
            Nieuwe collectie beginnen
          </Button>
        </Box>
      </Paper>
      <Box pt={4}>
        <SubscribePanel slug={state.room.data.slug} />
      </Box>
      <Box pt={4}>
        <Button
          fullWidth
          variant="outlined"
          onClick={() => router.push("/rooms/[roomSlug]", `/rooms/${slug}`)}
        >
          Open Luisterkamer
        </Button>
      </Box>
    </>
  );
};
