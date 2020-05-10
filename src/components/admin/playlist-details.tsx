import {
  Box,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  Paper,
  ListItemText,
  Container,
  Typography,
  ListItemSecondaryAction,
  Divider,
} from "@material-ui/core";
import AdminHeader from "./layout/admin-header";
import IconAdd from "@material-ui/icons/Add";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { parseDbDate } from "../../api/collection-storage/backends/directus-utils";
import { IEpisode } from "../../app-schema/IEpisode";
import { IRoom } from "../../app-schema/IRoom";
import AppContainer from "../app-container";

import PageFooter from "../page-footer";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";
import { useRouter } from "../../hooks/useRouter";

export const PlaylistDetails = ({
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
          action={
            <AdminHeaderClose
              url={`/rooms/[roomSlug]/admin`}
              as={`/rooms/${room.slug}/admin`}
            />
          }
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
            secondary={`Neem nu op, publiceer later`}
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

        {/* // Busines Logic: Only show playlists that contain published episodes */}
        {playlist.episodes.filter((e) => e.status === "published").length ===
          0 && (
          <Box p={2} mt={2}>
            <Box mb={2}>
              <Divider />
            </Box>
            <AdminInstructionsLayout
              items={[
                {
                  title:
                    "Deze collectie bevat nog geen gepubliceerde aflevering",
                  text:
                    "Deze collectie is dan ook nog NIET zichtbaar in de luisterkamer en Podcast.",
                },
              ]}
            />
          </Box>
        )}
      </List>
    </Paper>
  );
};

const AdminEpisodeListItem = ({
  roomSlug,
  playlistId,
  episode,
}: {
  roomSlug: IRoom["slug"];
  playlistId: IPlaylist["id"];
  episode: IEpisode;
}) => {
  const router = useRouter();
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
      onClick={() =>
        episode.audio_file
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
            {episode.status === "draft"
              ? episode.audio_file
                ? "Niet gepubliceerd"
                : "Geen opname"
              : episode.published_on
              ? parseDbDate(episode.published_on).toRelative()
              : parseDbDate(episode.created_on).toRelative()}
          </>
        }
      />
      <ListItemSecondaryAction>
        <Typography variant="button">
          {episode.audio_file ? "open" : "neem op"}
        </Typography>
      </ListItemSecondaryAction>
    </ListItem>
  );
};
