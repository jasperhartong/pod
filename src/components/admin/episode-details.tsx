import { Box, Button } from "@material-ui/core";
import { IRoom } from "@/app-schema/IRoom";
import { IPlaylist } from "@/app-schema/IPlaylist";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { ImageCoverLayout } from "./layout/image-cover-layout";
import { IEpisode } from "@/app-schema/IEpisode";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import episodeUpdateMeta from "@/api/rpc/commands/episode.update.meta";
import { useRouter } from "@/hooks/useRouter";
import { useState } from "react";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { toDbDate } from "@/api/collection-storage/backends/directus-utils";
import { DateTime } from "luxon";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

export const EpisodeDetails = ({ room, playlist, episode }: Props) => {
  const router = useRouter();
  const { mutateEpisode } = useSWRRoom(room.slug);
  const [isValidating, setIsValidating] = useState<boolean>(false);

  const handlePublish = async () => {
    setIsValidating(true);
    const published_on = toDbDate(DateTime.utc());
    const updating = await RPCClientFactory(episodeUpdateMeta).call({
      id: episode.id,
      data: {
        status: "published",
        published_on,
      },
    });
    if (updating.ok) {
      // Mutate local data and move on
      mutateEpisode(
        playlist.id,
        {
          ...episode,
          status: "published",
          published_on,
        },
        false
      );

      router.push(
        `/rooms/[roomSlug]/admin/[playlistId]`,
        `/rooms/${room.slug}/admin/${playlist.id}`
      );
    } else {
      alert("Publiceren mislukt, probeer nogmaals");
      setIsValidating(false);
    }
  };
  return (
    <AdminDualPaneLayout
      image={
        playlist.cover_file.data.thumbnails.find((t) => t.width > 400)?.url
      }
      blur={40}
      title={episode.title}
      subtitle={"in " + playlist.title}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomSlug]/admin/[playlistId]`}
          as={`/rooms/${room.slug}/admin/${playlist.id}`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <ImageCoverLayout
              imageUrl={
                episode.image_file.data.thumbnails.find((t) => t.width > 240)
                  ?.url
              }
              style={{ width: 240, height: 240 }}
            />
          </Box>
        </Box>
      }
      secondItem={
        <>
          <Box mt={2}>
            <audio
              style={{ width: "100%" }}
              src={episode.audio_file || undefined}
              controls
            />
          </Box>
          <Box mt={4}>
            {episode.status === "draft" && (
              <>
                <Button
                  disabled={isValidating}
                  onClick={handlePublish}
                  variant="contained"
                  fullWidth
                >
                  Publiceer nu
                </Button>
                <AdminInstructionsLayout
                  items={[
                    {
                      title: "Deze aflevering is nog niet gepubliceerd",
                      text:
                        "Pas na publiceren wordt deze zichtbaar in de luisterkamer en Podcast.",
                    },
                  ]}
                />
              </>
            )}
            {episode.status === "published" && (
              <AdminInstructionsLayout
                items={[
                  {
                    title: "Deze aflevering is gepubliceerd",
                    text: "Deze is nu zichtbaar in de luisterkamer en Podcast.",
                  },
                ]}
              />
            )}
          </Box>
          {/* We can easily allow to re-record stuff :) */}
          {/* <Box mt={2}>
            <Link
              href={`/rooms/[roomSlug]/admin/[playlistId]/record-episode/[episodeId]`}
              as={`/rooms/${room.slug}/admin/${playlist.id}/record-episode/${episode.id}`}
            >
              <Button fullWidth>Neem opnieuw op</Button>
            </Link>
          </Box> */}
        </>
      }
    />
  );
};
