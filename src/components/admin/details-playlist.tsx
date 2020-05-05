import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Chip,
  Paper,
  ListItemText,
  Container,
  Typography,
  ListItemSecondaryAction,
} from "@material-ui/core";
import { Key } from "react";
import AdminHeader from "./layout/admin-header";
import IconAdd from "@material-ui/icons/Add";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { parseDbDate } from "../../api/collection-storage/backends/directus-utils";
import { IEpisode, episodeHasAudio } from "../../app-schema/IEpisode";
import { IRoom } from "../../app-schema/IRoom";
import AppContainer from "../app-container";
import { useRouter } from "next/dist/client/router";
import PageFooter from "../page-footer";
import AdminHeaderCloseToOverview from "./layout/admin-header-close-to-overview";

export const DetailsPlaylist = ({
  room,
  playlist,
}: {
  room: IRoom;
  playlist: IPlaylist;
}) => {
  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <AdminHeader
          image={
            playlist.cover_file.data.thumbnails.find((t) => t.width > 400)?.url
          }
          title={playlist.title}
          subtitle={`in ${room.title}`}
          action={<AdminHeaderCloseToOverview roomSlug={room.slug} />}
        />

        <AdminEpisodeList room={room} playlist={playlist} />

        <PageFooter />
      </Container>
    </AppContainer>
  );
};

const AdminEpisodeList = ({
  room,
  playlist,
}: {
  room: IRoom;
  playlist: IPlaylist;
}) => {
  const router = useRouter();

  return (
    <Paper>
      <Box pl={2} pr={2} pt={2}>
        <Typography variant="overline">
          {playlist.episodes.length} afleveringen
        </Typography>
      </Box>
      <List style={{ width: "100%", padding: 0 }}>
        {/* New Episode creation Button */}
        <ListItem
          button
          onClick={() =>
            router.push(
              "/rooms/[roomSlug]/admin/[playlistId]/new-episode",
              `/rooms/${room.slug}/admin/${playlist.id}/new-episode`
            )
          }
        >
          <ListItemAvatar>
            <Box style={{ marginLeft: 2 }}>
              <IconAdd fontSize="large" />
            </Box>
          </ListItemAvatar>
          <ListItemText
            primary={"Nieuwe aflevering"}
            secondary={`In ${playlist.title}`}
          />
          <ListItemSecondaryAction>
            <Typography variant="button">Voeg toe</Typography>
          </ListItemSecondaryAction>
        </ListItem>

        {/* Existing episodes: drafts, published */}
        {playlist.episodes.map((episode) => (
          <AdminEpisodeListItem
            key={episode.id}
            roomSlug={room.slug}
            playlistId={playlist.id}
            episode={episode}
          />
        ))}
      </List>
    </Paper>
  );
};

const AdminEpisodeListItem = ({
  key,
  roomSlug,
  playlistId,
  episode,
}: {
  key: Key;
  roomSlug: IRoom["slug"];
  playlistId: IPlaylist["id"];
  episode: IEpisode;
}) => {
  const router = useRouter();
  const hasAudio = episodeHasAudio(episode);
  const recordLink = {
    url: "/rooms/[roomSlug]/admin/[playlistId]/record-episode/[episodeId]",
    as: `/rooms/${roomSlug}/admin/${playlistId}/record-episode/${episode.id}`,
  };
  const detailsLink = {
    url: "/rooms/[roomSlug]/admin/[playlistId]/episode/[episodeId]",
    as: `/rooms/${roomSlug}/admin/${playlistId}/episode/${episode.id}`,
  };

  return (
    <ListItem
      key={key}
      onClick={() =>
        hasAudio
          ? router.push(detailsLink.url, detailsLink.as)
          : router.push(recordLink.url, recordLink.as)
      }
      button
    >
      <ListItemAvatar>
        <Avatar
          variant="square"
          alt={episode.title}
          src={
            episode.image_file.data.thumbnails.find((t) => t.width > 100)?.url
          }
        />
      </ListItemAvatar>
      <ListItemText
        primary={episode.title}
        secondary={
          <>
            {episode.status === "draft" ? (
              <Chip
                style={{ padding: 0 }}
                size="small"
                color={hasAudio ? "secondary" : "primary"}
                label={hasAudio ? "Niet gepubliceerd" : "Geen opname"}
              />
            ) : (
              parseDbDate(episode.created_on).toRelative()
            )}
          </>
        }
      />
      <ListItemSecondaryAction>
        <Typography variant="button">
          {hasAudio ? "open" : "neem op"}
        </Typography>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
