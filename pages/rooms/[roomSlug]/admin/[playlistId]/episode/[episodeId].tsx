import ErrorPage from "../../../../../../src/components/error-page";
import { EpisodeDetails } from "../../../../../../src/components/admin/episode-details";
import { useRouter } from "next/dist/client/router";
import { useSWRRoom } from "../../../../../../src/hooks/useSWRRoom";
import { LoaderCentered } from "../../../../../../src/components/admin/layout/loader-centered";

const AdminEpisodeDetails = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string);
  const playlistId = router.query.playlistId as string;
  const episodeId = router.query.episodeId as string;

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok || !playlistId) {
    return <ErrorPage error={!data.ok ? data.error : undefined} />;
  }
  const room = data.data;
  const playlist = room.playlists.find((p) => p.id.toString() === playlistId);

  if (!playlist) {
    return <ErrorPage error="Playlist not found in room" />;
  }

  const episode = playlist.episodes.find((e) => e.id.toString() === episodeId);

  if (!episode) {
    return <ErrorPage error="Episode not found in room" />;
  }

  return <EpisodeDetails room={room} playlist={playlist} episode={episode} />;
};

export default AdminEpisodeDetails;
