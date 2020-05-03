import { NextPageContext } from "next";

import roomFetch from "../../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../../src/api/IResponse";
import { IRoom } from "../../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../../src/app-schema/IPlaylist";
import ErrorPage from "../../../../../../src/components/error-page";
import { IEpisode } from "../../../../../../src/app-schema/IEpisode";
import DetailsEpisode from "../../../../../../src/components/admin/details-episode";

interface Props {
  roomResponse: IResponse<IRoom>;
  playlistId: IPlaylist["id"] | null;
  episodeId: IEpisode["id"] | null;
}

const AdminDetailsEpisode = ({
  roomResponse,
  playlistId,
  episodeId,
}: Props) => {
  if (!roomResponse.ok || !playlistId) {
    return (
      <ErrorPage error={!roomResponse.ok ? roomResponse.error : undefined} />
    );
  }
  const room = roomResponse.data;
  const playlist = room.playlists.find((p) => p.id === playlistId);

  if (!playlist) {
    return <ErrorPage error="Playlist not found in room" />;
  }

  const episode = playlist.episodes.find((e) => e.id === episodeId);

  if (!episode) {
    return <ErrorPage error="Episode not found in room" />;
  }

  return <DetailsEpisode room={room} playlist={playlist} episode={episode} />;
};

export default AdminDetailsEpisode;

export async function getServerSideProps(
  context: NextPageContext
): Promise<{ props: Props }> {
  const playlistId =
    (parseInt(context.query.playlistId as string) as IPlaylist["id"]) ||
    undefined;
  const episodeId =
    (parseInt(context.query.episodeId as string) as IEpisode["id"]) ||
    undefined;

  const roomSlug = (context.query.roomSlug as string) || undefined;
  const roomResponse = await roomFetch.handle({
    slug: roomSlug,
  });

  return {
    props: {
      roomResponse,
      playlistId: playlistId || null,
      episodeId: episodeId || null,
    },
  };
}
