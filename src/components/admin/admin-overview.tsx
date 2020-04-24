import Link from "next/link";
import {
  Button,
  List,
  Box,
  Fab,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ListSubheader,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
} from "@material-ui/core";
import PlaylistHeader from "../playlist-header";
import SubscribePanel from "../subscribe-panel";
import { AdminPageProps } from "./admin-container";
import { useState, useEffect, ChangeEvent } from "react";
import AdminHeader from "./layout/admin-header";
import IconExpandMore from "@material-ui/icons/ExpandMore";
import IconAdd from "@material-ui/icons/Add";
import { IPlaylist } from "../../app-schema/IPlaylist";

const panelIdFromPlaylistId = (id: IPlaylist["id"]) => `panel-playlist-${id}`;

export const AdminOverview = ({ state }: AdminPageProps) => {
  const [expanded, setExpanded] = useState<string | false>(false);
  const handleChange = (panel: string) => (
    _: ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

  useEffect(() => {
    requestAnimationFrame(() => {
      if (!state.room.ok) {
        return;
      }
      const playlists = state.room.data.playlists;
      if (playlists.length > 0) {
        if (
          state.selectedPlayList &&
          playlists.find((p) => p.id === state.selectedPlayList)
        ) {
          setExpanded(panelIdFromPlaylistId(state.selectedPlayList));
        } else {
          setExpanded(panelIdFromPlaylistId(playlists[0].id));
        }
      }
    });
  }, []);

  if (!state.room.ok) {
    return <>error</>;
  }
  const slug = state.room.data.slug;

  return (
    <>
      <AdminHeader title={state.room.data.title} subtitle="admin" />

      <Box>
        {state.room.data.playlists.map((p) => (
          <ExpansionPanel
            key={p.id}
            expanded={expanded === panelIdFromPlaylistId(p.id)}
            onChange={handleChange(panelIdFromPlaylistId(p.id))}
          >
            <ExpansionPanelSummary
              expandIcon={<IconExpandMore />}
              aria-controls={`playlist-content-${p.id}`}
              id={`playlist-header-${p.id}`}
            >
              <List style={{ width: "100%" }}>
                <PlaylistHeader
                  key={p.id}
                  playlist={p}
                  secondaryAction={
                    <Link
                      href="/rooms/[roomSlug]/admin/[playlistId]/new"
                      as={`/rooms/${slug}/admin/${p.id}/new`}
                    >
                      <Fab size="small">
                        <IconAdd />
                      </Fab>
                    </Link>
                  }
                />
              </List>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              id={`playlist-content-${p.id}`}
              style={{ paddingTop: 0 }}
            >
              <Box>
                <List style={{ width: "100%", padding: 0 }}>
                  <ListSubheader disableSticky>
                    Laatste 3 afleveringen
                  </ListSubheader>
                  {p &&
                    p.episodes.slice(0, 3).map((episode) => (
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
            </ExpansionPanelDetails>
          </ExpansionPanel>
        ))}
      </Box>

      <Box textAlign="center" p={2}>
        <Button variant="outlined" onClick={() => alert("😅 Coming soon!")}>
          Nieuwe collectie beginnen
        </Button>
      </Box>

      <Box pt={4}>
        <SubscribePanel slug={state.room.data.slug} />
      </Box>
      <Box pt={4}>
        <Link href="/rooms/[roomSlug]" as={`/rooms/${slug}`}>
          <Button fullWidth variant="outlined">
            Open Luisterkamer
          </Button>
        </Link>
      </Box>
    </>
  );
};
