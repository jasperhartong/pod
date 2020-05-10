import { ErrorPage } from "../../../../src/components/error-page";
import { useRouter } from "../../../../src/hooks/useRouter";
import { useSWRRoom } from "../../../../src/hooks/useSWRRoom";
import { LoaderCentered } from "../../../../src/components/admin/layout/loader-centered";
import { PlaylistNew } from "../../../../src/components/admin/playlist-new";

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
