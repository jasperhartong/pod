import { NextPageContext } from "next";
import roomFetch from "../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../src/api/IResponse";
import { IRoom } from "../../../../src/app-schema/IRoom";
import { AdminOverview } from "../../../../src/components/admin/admin-overview";

const AdminPage = ({ room }: { room: IResponse<IRoom> }) => {
  return <AdminOverview room={room} />;
};

export default AdminPage;

export async function getServerSideProps(context: NextPageContext) {
  const roomSlug = (context.query.roomSlug as string) || null;
  const room = await roomFetch.handle({
    slug: roomSlug || undefined,
  });
  console.warn(room);

  return {
    props: { room },
  };
}
