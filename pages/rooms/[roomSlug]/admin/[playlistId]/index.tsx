import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { PlaylistDetails } from "@/components/admin/playlist-details";

const AdminPlaylistPage = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string);
  const playlistId = router.query.playlistId as string;

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok || !playlistId) {
    return <ErrorPage error={!data.ok ? data.error : undefined} />;
  }
  const room = data.data;
  const playlist = room.playlists.find((p) => p.id.toString() === playlistId);

  if (!playlist) {
    return <ErrorPage error="No playlist found" />;
  }

  return <PlaylistDetails room={room} playlist={playlist} />;
};

export default AdminPlaylistPage;
