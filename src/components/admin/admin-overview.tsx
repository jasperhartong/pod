import NextLink from "next/link";
import {
  Grid,
  Link,
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
import IconInfo from "@material-ui/icons/InfoOutlined";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { parseDbDate } from "../../api/collection-storage/backends/directus-utils";
import { IEpisode } from "../../app-schema/IEpisode";

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
                    <NextLink
                      href="/rooms/[roomSlug]/admin/[playlistId]/new"
                      as={`/rooms/${slug}/admin/${p.id}/new`}
                    >
                      <Fab size="small">
                        <IconAdd />
                      </Fab>
                    </NextLink>
                  }
                />
              </List>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails
              id={`playlist-content-${p.id}`}
              style={{ paddingTop: 0 }}
            >
              <AdminEpisodeList episodes={p.episodes} />
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
        <NextLink href="/rooms/[roomSlug]" as={`/rooms/${slug}`}>
          <Button fullWidth variant="outlined">
            Open Luisterkamer
          </Button>
        </NextLink>
      </Box>
    </>
  );
};

const AdminEpisodeList = ({ episodes }: { episodes: IEpisode[] }) => {
  const [maxLength, setMaxLength] = useState<number | undefined>(3);

  const limitedEpisodes =
    maxLength === undefined ? episodes : episodes.slice(0, maxLength);

  return (
    <List style={{ width: "100%", padding: 0 }}>
      <ListSubheader disableSticky>
        {maxLength !== undefined ? (
          <Grid container justify="space-between">
            <Grid item>Laatste {maxLength} afleveringen</Grid>
            <Grid item>
              <Link
                color="textSecondary"
                href="#"
                onClick={() => setMaxLength(undefined)}
              >
                Toon allen
              </Link>
            </Grid>
          </Grid>
        ) : (
          <Grid container justify="space-between">
            <Grid item>All {episodes.length} afleveringen</Grid>
            <Grid item>
              <Link
                color="textSecondary"
                href="#"
                onClick={() => setMaxLength(3)}
              >
                Toon laatste 3
              </Link>
            </Grid>
          </Grid>
        )}
      </ListSubheader>
      {limitedEpisodes.map((episode) => (
        <ListItem
          key={episode.id}
          onClick={() => alert("😅 Coming soon!")}
          button
        >
          <ListItemAvatar>
            <Avatar
              variant="square"
              alt={episode.title}
              src={
                episode.image_file.data.thumbnails.find((t) => t.width > 100)
                  ?.url
              }
            />
          </ListItemAvatar>
          <ListItemText
            primary={episode.title}
            secondary={parseDbDate(episode.created_on).toRelative()}
          />
        </ListItem>
      ))}
    </List>
  );
};
