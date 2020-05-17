import { AdminOverview } from "@/components/admin/admin-overview";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { ErrorPage } from "@/components/error-page";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";

const AdminPage = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomUid as string);

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok) {
    return <ErrorPage error={data.error} />;
  }

  return <AdminOverview room={data.data} />;
};

export default AdminPage;
