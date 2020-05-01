import { NextPageContext } from "next";

import roomFetch from "../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../src/api/IResponse";
import { IRoom } from "../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../src/app-schema/IPlaylist";
import EpisodeCreation from "../../../../../src/components/admin/episode-creation";
import ErrorPage from "../../../../../src/components/error-page";

interface Props {
  roomResponse: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
}

const AdminEpisodeCreationPage = ({ roomResponse, playlistId }: Props) => {
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

  return <EpisodeCreation room={room} playlist={playlist} />;
};

export default AdminEpisodeCreationPage;

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
