import { NextPageContext } from "next";
import roomFetch from "../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../src/api/IResponse";
import { IRoom } from "../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../src/app-schema/IPlaylist";
import AdminPageContainer from "../../../../src/components/admin/admin-container";

const AdminPage = (props: {
  room: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
}) => {
  return (
    <AdminPageContainer
      room={props.room}
      playlistId={props.playlistId || undefined}
    />
  );
};

export default AdminPage;

export async function getServerSideProps(context: NextPageContext) {
  const playlistId =
    (parseInt(context.query.playlistId as string) as IPlaylist["id"]) || null;
  const roomSlug = (context.query.roomSlug as string) || null;
  const room = await roomFetch.handle({
    slug: roomSlug || undefined,
  });

  return {
    props: { room, playlistId },
  };
}
