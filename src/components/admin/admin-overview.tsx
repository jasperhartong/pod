import NextLink from "next/link";
import {
  Link,
  Button,
  List,
  Box,
  Fab,
  ExpansionPanel,
  ExpansionPanelSummary,
  ExpansionPanelDetails,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Typography,
} from "@material-ui/core";
import PlaylistHeader from "../playlist-header";
import SubscribePanel from "../subscribe-panel";
import { AdminPageProps } from "./admin-container";
import { useState, useEffect, ChangeEvent } from "react";
import AdminHeader from "./layout/admin-header";
import IconAdd from "@material-ui/icons/Add";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { parseDbDate } from "../../api/collection-storage/backends/directus-utils";
import { IEpisode } from "../../app-schema/IEpisode";
import SurroundSound from "@material-ui/icons/SurroundSound";
import { IResponse } from "../../api/IResponse";
import { IRoom } from "../../app-schema/IRoom";

const panelIdFromPlaylistId = (id: IPlaylist["id"]) => `panel-playlist-${id}`;

const defaultPlaylistPanelId = (room: IResponse<IRoom>) => {
  if (room.ok && room.data.playlists.length > 0) {
    return panelIdFromPlaylistId(room.data.playlists[0].id);
  }
  return false;
};

export const AdminOverview = ({ state }: AdminPageProps) => {
  const [expanded, setExpanded] = useState<string | false>(
    defaultPlaylistPanelId(state.room)
  );

  const handleChange = (panel: string) => (
    _: ChangeEvent<{}>,
    isExpanded: boolean
  ) => {
    setExpanded(isExpanded ? panel : false);
  };

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
              style={{ padding: 0 }}
              aria-controls={`playlist-content-${p.id}`}
              id={`playlist-header-${p.id}`}
            >
              <List style={{ padding: 0, width: "100%" }}>
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
              style={{ padding: 0 }}
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
      <Box p={4} textAlign="center">
        <SurroundSound fontSize="large" color="disabled" />
        <Typography
          component="div"
          variant="overline"
          style={{ lineHeight: "110%" }}
        >
          Tapes.me ©2020
        </Typography>
        <Typography component="div" variant="overline" color="textSecondary">
          {state.room.data.slug || ""}
        </Typography>
      </Box>
    </>
  );
};

const initialMaxLength = 3;
const AdminEpisodeList = ({ episodes }: { episodes: IEpisode[] }) => {
  const [maxLength, setMaxLength] = useState<number | undefined>(
    initialMaxLength
  );

  const limitedEpisodes =
    maxLength === undefined ? episodes : episodes.slice(0, maxLength);

  return (
    <List style={{ width: "100%", padding: 0 }}>
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

      <Box p={2} pt={1}>
        {maxLength === undefined && (
          <Link
            color="textSecondary"
            href="#"
            onClick={() => setMaxLength(initialMaxLength)}
          >
            <Typography variant="subtitle2">Minder...</Typography>
          </Link>
        )}

        {maxLength !== undefined && episodes.length > maxLength && (
          <Link
            color="textSecondary"
            href="#"
            onClick={() => setMaxLength(undefined)}
          >
            <Typography variant="subtitle2">
              {episodes.length - maxLength} meer...
            </Typography>
          </Link>
        )}
      </Box>
    </List>
  );
};
