import { NextPageContext } from "next";

import roomFetch from "../../../../../../src/api/rpc/commands/room.fetch";
import { IResponse } from "../../../../../../src/api/IResponse";
import { IRoom } from "../../../../../../src/app-schema/IRoom";
import { IPlaylist } from "../../../../../../src/app-schema/IPlaylist";
import ErrorPage from "../../../../../../src/components/error-page";
import { IEpisode } from "../../../../../../src/app-schema/IEpisode";
import RecordEpisode from "../../../../../../src/components/admin/record-episode";
import { useRouter } from "next/dist/client/router";
import { useSWRRoom } from "../../../../../../src/hooks/useSWRRoom";
import { LoaderCentered } from "../../../../../../src/components/admin/loader-centered";

const AdminRecordEpisode = () => {
  const router = useRouter();
  const { data } = useSWRRoom(router.query.roomSlug as string);
  const playlistId = router.query.playlistId as string;
  const episodeId = router.query.episodeId as string;

  if (!data) {
    return <LoaderCentered />;
  }

  if (!data.ok || !playlistId) {
    return <ErrorPage error={!data.ok ? data.error : undefined} />;
  }
  const room = data.data;
  const playlist = room.playlists.find((p) => p.id.toString() === playlistId);

  if (!playlist) {
    return <ErrorPage error="Playlist not found in room" />;
  }

  const episode = playlist.episodes.find((e) => e.id.toString() === episodeId);

  if (!episode) {
    return <ErrorPage error="Episode not found in room" />;
  }

  return <RecordEpisode room={room} playlist={playlist} episode={episode} />;
};

export default AdminRecordEpisode;
