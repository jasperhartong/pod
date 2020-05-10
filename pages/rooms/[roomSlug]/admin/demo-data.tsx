import { useSWRRoom } from "../../../../src/hooks/useSWRRoom";
import { useRouter } from "../../../../src/hooks/useRouter";
import { RPCClientFactory } from "../../../../src/api/rpc/rpc-client";
import episodeCreateMeta from "../../../../src/api/rpc/commands/episode.create.meta";
import playlistCreateMeta from "../../../../src/api/rpc/commands/playlist.create.meta";
import { IEpisode } from "../../../../src/app-schema/IEpisode";
import { IPlaylist } from "../../../../src/app-schema/IPlaylist";
import { IRoom } from "../../../../src/app-schema/IRoom";
import { Typography, Button } from "@material-ui/core";
import { useState } from "react";
import { LoaderCentered } from "../../../../src/components/admin/layout/loader-centered";

const copyEpisode = async (episode: IEpisode, playlistId: IPlaylist["id"]) => {
  return await RPCClientFactory(episodeCreateMeta).call({
    playlistId: playlistId,
    data: {
      title: `Demo: ${episode.title}`,
      status: episode.status,
      image_url: episode.image_file.data.full_url,
      audio_file: episode.audio_file || undefined,
      published_on: episode.published_on || episode.created_on,
    },
  });
};

const copyPlaylist = async (playlist: IPlaylist, room: IRoom) => {
  if (room.slug === "famhartong") {
    return console.debug("protecting famhartong room");
  }
  const playlistCreation = await RPCClientFactory(playlistCreateMeta).call({
    roomId: room.id,
    data: {
      title: `Demo: ${playlist.title}`,
      description: playlist.description,
      image_url: playlist.cover_file.data.full_url,
    },
  });
  if (playlistCreation.ok) {
    try {
      playlist.episodes.forEach(async (episode) => {
        const creation = await copyEpisode(episode, playlistCreation.data.id);
        if (!creation.ok) {
          throw Error("episode failed to copy");
        }
      });
    } catch (error) {
      console.error(error);
    }
  }
};

const DemoAdmin = () => {
  const router = useRouter();
  const famHartongRoom = useSWRRoom("famhartong");
  const currentRoom = useSWRRoom(router.query.roomSlug as string);
  const [copying, setCopying] = useState<boolean>(false);

  if (!currentRoom.data || !famHartongRoom.data) {
    return <>loading rooms</>;
  }
  if (!currentRoom.data.ok) {
    return <>Error in current room</>;
  }

  const current = currentRoom.data.data;
  if (!famHartongRoom.data.ok) {
    return <>Error in famhartong room</>;
  }

  if (copying) {
    return <LoaderCentered />;
  }

  return (
    <>
      <Typography variant="h4">
        Copy one of the following playlists into: {current.title}
      </Typography>
      <ul>
        {famHartongRoom.data.data.playlists.map((playlist) => (
          <li key={playlist.id}>
            {playlist.title} • {playlist.episodes.length}
            <Button
              onClick={async () => {
                setCopying(true);
                await copyPlaylist(playlist, current);
                setCopying(false);
              }}
            >
              Copy
            </Button>
          </li>
        ))}
      </ul>
    </>
  );
};

export default DemoAdmin;
