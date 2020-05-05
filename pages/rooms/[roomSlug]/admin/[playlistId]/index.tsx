import ErrorPage from "../../../../../src/components/error-page";
import { useRouter } from "next/dist/client/router";
import { useSWRRoom } from "../../../../../src/hooks/useSWRRoom";
import { LoaderCentered } from "../../../../../src/components/admin/loader-centered";
import { DetailsPlaylist } from "../../../../../src/components/admin/details-playlist";

const AdminNewEpisodePage = () => {
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

  return <DetailsPlaylist room={room} playlist={playlist} />;
};

export default AdminNewEpisodePage;
