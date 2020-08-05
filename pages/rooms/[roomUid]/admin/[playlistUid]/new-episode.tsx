import { EpisodeNew } from "@/components/admin/episode-new";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";

const AdminNewEpisodePage = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomUid as string);
  const playlistUid = router.query.playlistUid as string;

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok || !playlistUid) {
    return <ErrorPage error={!data.ok ? data.error : undefined} />;
  }
  const room = data.data;
  const playlist = room.playlists.find((p) => p.uid === playlistUid);

  if (!playlist) {
    return <ErrorPage error="No playlist found" />;
  }

  return <EpisodeNew room={room} playlist={playlist} />;
};

export default AdminNewEpisodePage;
