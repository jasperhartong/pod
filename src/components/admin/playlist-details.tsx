import { parseDbDate } from "@/api/collection-storage/backends/directus-utils";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import { useRouter } from "@/hooks/useRouter";
import {
  Avatar,
  Box,
  Container,
  Divider,
  List,
  ListItem,
  ListItemAvatar,
  ListItemSecondaryAction,
  ListItemText,
  Paper,
  Typography,
} from "@material-ui/core";
import IconAdd from "@material-ui/icons/Add";
import AppContainer from "../app-container";
import PageFooter from "../page-footer";
import AdminHeader from "./layout/admin-header";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";

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
          image={playlist.cover_file.data.full_url}
          title={playlist.title}
          subtitle={`in ${room.title}`}
          action={
            <AdminHeaderClose
              url={`/rooms/[roomUid]/admin`}
              as={`/rooms/${room.uid}/admin`}
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
              "/rooms/[roomUid]/admin/[playlistId]/new-episode",
              `/rooms/${room.uid}/admin/${playlist.id}/new-episode`
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
            roomUid={room.uid}
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
                  title: "Binnen deze collectie is niets gepubliceerd",
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
  roomUid,
  playlistId,
  episode,
}: {
  roomUid: IRoom["uid"];
  playlistId: IPlaylist["id"];
  episode: IEpisode;
}) => {
  const router = useRouter();
  const recordLink = {
    url: "/rooms/[roomUid]/admin/[playlistId]/record-episode/[episodeId]",
    as: `/rooms/${roomUid}/admin/${playlistId}/record-episode/${episode.id}`,
  };
  const detailsLink = {
    url: "/rooms/[roomUid]/admin/[playlistId]/episode/[episodeId]",
    as: `/rooms/${roomUid}/admin/${playlistId}/episode/${episode.id}`,
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
          src={episode.image_file.data.full_url}
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
