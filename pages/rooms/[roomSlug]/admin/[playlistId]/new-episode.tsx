import { NextPageContext } from "next";

import roomFetch from "../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../src/api/IResponse";
import { IRoom } from "../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../src/app-schema/IPlaylist";
import EpisodeNew from "../../../../../src/components/admin/new-episode";
import ErrorPage from "../../../../../src/components/error-page";

interface Props {
  roomResponse: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
}

const AdminNewEpisodePage = ({ roomResponse, playlistId }: Props) => {
  if (!roomResponse.ok || !playlistId) {
    return (
      <ErrorPage error={!roomResponse.ok ? roomResponse.error : undefined} />
    );
  }
  const room = roomResponse.data;
  const playlist = room.playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return <ErrorPage error="No playlist found" />;
  }

  return <EpisodeNew room={room} playlist={playlist} />;
};

export default AdminNewEpisodePage;

export async function getServerSideProps(
  context: NextPageContext
): Promise<{ props: Props }> {
  const playlistId =
    (parseInt(context.query.playlistId as string) as IPlaylist["id"]) ||
    undefined;
  const roomSlug = (context.query.roomSlug as string) || undefined;
  const roomResponse = await roomFetch.handle({
    slug: roomSlug,
  });

  return {
    props: { roomResponse, playlistId: playlistId || null },
  };
}
