import Link from "next/link";
import { Box, Button, IconButton, Typography } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { EpisodeCoverLayout } from "./layout/episode-cover-layout";
import { IEpisode } from "../../app-schema/IEpisode";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

const EpisodeEdit = ({ room, playlist, episode }: Props) => {
  return (
    <AdminDualPaneLayout
      image={playlist.cover_file.data.full_url}
      title={playlist.title}
      subtitle={episode.title}
      action={
        <Link href={`/rooms/[roomSlug]/admin`} as={`/rooms/${room.slug}/admin`}>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Link>
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <EpisodeCoverLayout
            imageUrl={
              episode.image_file.data.thumbnails.find((t) => t.width > 240)?.url
            }
            style={{ width: 240, height: 240 }}
          />
        </Box>
      }
      secondItem={
        <Box pt={2}>
          <Button fullWidth>Test Microfoon</Button>

          <Box mt={4} mb={2}>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Voordat we beginnen met voorlezen, is het goed om even de
              microfoon te testen.
            </Typography>
          </Box>
          <Box mb={2}>
            <Typography variant="caption" color="textSecondary">
              Tips voor het opnemen
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
              Spreek niet te dichtbij de microfoon
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Probeer het oppervlakte waarop de microfoon ligt niet te veel aan
              te raken
            </Typography>
          </Box>
        </Box>
      }
    />
  );
};

export default EpisodeEdit;
