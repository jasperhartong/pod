import { EpisodeRecord } from "@/components/admin/episode-record";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";

const AdminEpisodeRecord = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomUid as string);
  const playlistUid = router.query.playlistUid as string;
  const episodeUid = router.query.episodeUid as string;

  if (!data) {
    return <LoaderCentered />;
  }

  if (!playlistUid) {
    return <ErrorPage error={`No playlist Id: ${playlistUid}`} />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }
  const room = data.data;
  const playlist = room.playlists.find((p) => p.uid === playlistUid);

  if (!playlist) {
    return <ErrorPage error="Playlist not found in room" />;
  }

  const episode = playlist.episodes.find((e) => e.uid === episodeUid);

  if (!episode) {
    return <ErrorPage error="Episode not found in room" />;
  }

  return <EpisodeRecord room={room} playlist={playlist} episode={episode} />;
};

export default AdminEpisodeRecord;
