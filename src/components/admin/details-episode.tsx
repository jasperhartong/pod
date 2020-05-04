import Link from "next/link";
import { Box, Button } from "@material-ui/core";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { EpisodeCoverLayout } from "./layout/episode-cover-layout";
import { IEpisode } from "../../app-schema/IEpisode";
import AdminHeaderCloseToOverview from "./layout/admin-header-close-to-overview";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

const DetailsEpisode = ({ room, playlist, episode }: Props) => {
  return (
    <AdminDualPaneLayout
      image={episode.image_file.data.thumbnails.find((e) => e.width > 100)?.url}
      blur={40}
      title={episode.title}
      subtitle={"in " + playlist.title}
      action={<AdminHeaderCloseToOverview roomSlug={room.slug} />}
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <EpisodeCoverLayout
              imageUrl={
                episode.image_file.data.thumbnails.find((t) => t.width > 240)
                  ?.url
              }
              style={{ width: 240, height: 240 }}
            />
          </Box>
        </Box>
      }
      secondItem={
        <>
          <audio style={{ width: "100%" }} src={episode.audio_file} controls />
          <Box mt={2}>
            <Link
              href={`/rooms/[roomSlug]/admin/[playListId]/record-episode/[episodeId]`}
              as={`/rooms/${room.slug}/admin/${playlist.id}/record-episode/${episode.id}`}
            >
              <Button fullWidth>Neem opnieuw op</Button>
            </Link>
          </Box>
        </>
      }
    />
  );
};

export default DetailsEpisode;
