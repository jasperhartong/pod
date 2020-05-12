import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { PlaylistNew } from "@/components/admin/playlist-new";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";

const AdminNewEpisodePage = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string);

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={!data.ok ? data.error : undefined} />;
  }
  const room = data.data;

  return <PlaylistNew room={room} />;
};

export default AdminNewEpisodePage;
