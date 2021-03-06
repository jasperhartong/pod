import episodeCreateMeta from "@/api/rpc/commands/episode.create.meta";
import playlistCreateMeta from "@/api/rpc/commands/playlist.create.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import { LoaderCentered } from "@/components/admin/layout/loader-centered";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { Button, Typography } from "@material-ui/core";
import { useState } from "react";

const copyEpisode = async (
  episode: IEpisode,
  roomUid: IRoom["uid"],
  playlistUid: IPlaylist["uid"]
) => {
  return await RPCClientFactory(episodeCreateMeta).call({
    roomUid,
    playlistUid,
    data: {
      title: `Demo: ${episode.title}`,
      // status: episode.status,
      image_url: episode.image_file.data.full_url,
      audio_file: episode.audio_file,
      published_on: episode.published_on || episode.created_on,
    },
  });
};

const copyPlaylist = async (playlist: IPlaylist, room: IRoom) => {
  if (room.uid === "famhartong") {
    return console.debug("protecting famhartong room");
  }
  const playlistCreation = await RPCClientFactory(playlistCreateMeta).call({
    roomUid: room.uid,
    data: {
      title: `Demo: ${playlist.title}`,
      description: playlist.description,
      image_url: playlist.cover_file.data.full_url,
    },
  });
  if (playlistCreation.ok) {
    // episodes are ordered from new to old. We want to copy them old to new.
    playlist.episodes.reverse().forEach(async (episode, index) => {
      const creation = await copyEpisode(
        episode,
        room.uid,
        playlistCreation.data.uid
      );
      if (!creation.ok) {
        console.error(`"${episode.title}" failed to copy. Index: ${index}`);
      }
    });
  }
};

const DemoAdmin = () => {
  const router = useRouter();
  const famHartongRoom = useSWRRoom("famhartong");
  const currentRoom = useSWRRoom(router.query.roomUid as string);
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
          <li key={playlist.uid}>
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
