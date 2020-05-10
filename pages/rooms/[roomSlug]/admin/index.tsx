import { AdminOverview } from "../../../../src/components/admin/admin-overview";
import { useRouter } from "next/dist/client/router";
import { useSWRRoom } from "../../../../src/hooks/useSWRRoom";
import { LoaderCentered } from "../../../../src/components/admin/layout/loader-centered";
import { ErrorPage } from "../../../../src/components/error-page";

const AdminPage = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string);

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }

  return <AdminOverview room={data.data} />;
};

export default AdminPage;
