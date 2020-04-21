import {
  Button,
  List,
  Paper,
  Box,
  Typography,
  Divider,
} from "@material-ui/core";
import Link from "next/link";
import ChevronRightIcon from "@material-ui/icons/ChevronRight";
import PlaylistHeader from "../playlist-header";
import SubscribePanel from "../subscribe-panel";
import { AdminPageProps } from "./admin-container";

export const AdminOverview = ({ state }: AdminPageProps) => {
  if (!state.room.ok) {
    return <>error</>;
  }
  const slug = state.room.data.slug;

  return (
    <>
      <Box pt={2} pb={2} textAlign="center">
        <Typography component="div" variant="h6">
          {state.room.data.title}
        </Typography>
        <Typography component="div" variant="overline">
          admin
        </Typography>
      </Box>
      <Paper>
        <Box p={1}>
          <List>
            {state.room.data.playlists.map((p) => (
              <Link
                href="/rooms/[roomSlug]/admin/[playlistId]"
                as={`/rooms/${slug}/admin/${p.id}`}
              >
                <PlaylistHeader
                  key={p.id}
                  playlist={p}
                  onClick={() => {}}
                  secondaryAction={<ChevronRightIcon />}
                />
              </Link>
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
    </>
  );
};
