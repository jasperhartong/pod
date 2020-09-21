import episodeDeleteMeta from "@/api/rpc/commands/episode.delete.meta";
import episodeUpdateMeta from "@/api/rpc/commands/episode.update.meta";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import { useRouter } from "@/hooks/useRouter";
import { useRPC } from "@/hooks/useRPC";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { Box, Button } from "@material-ui/core";
import IconHeadset from "@material-ui/icons/Headset";
import { DateTime } from "luxon";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";
import { ImageCoverLayout } from "./layout/image-cover-layout";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
  episode: IEpisode;
}

export const EpisodeDetails = ({ room, playlist, episode }: Props) => {
  const router = useRouter();
  const { mutateEpisodeUpdate, mutateEpisodeDelete } = useSWRRoom(room.uid);
  const { call: deleteEpisode, isValidating: isDeleting } = useRPC(
    episodeDeleteMeta
  );
  const { call: updateEpisode, isValidating: isUpdating } = useRPC(
    episodeUpdateMeta
  );

  const handlePublish = async () => {
    const published_on = DateTime.utc().toJSON();
    const updating = await updateEpisode({
      roomUid: room.uid,
      playlistUid: playlist.uid,
      episodeUid: episode.uid,
      data: {
        status: "published",
        published_on,
      },
    });
    if (updating.ok) {
      // Mutate local data and move on
      mutateEpisodeUpdate(
        playlist.uid,
        {
          ...episode,
          status: "published",
          published_on,
        },
        false
      );

      router.push(`/rooms/[roomUid]/admin`, `/rooms/${room.uid}/admin`);
    } else {
      alert("Publiceren mislukt, probeer nogmaals");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Weet u het zeker?")) {
      return;
    }
    const deletion = await deleteEpisode({
      roomUid: room.uid,
      playlistUid: playlist.uid,
      episodeUid: episode.uid,
    });
    if (deletion.ok) {
      mutateEpisodeDelete(playlist.uid, episode.uid);
      router.push(`/rooms/[roomUid]/admin`, `/rooms/${room.uid}/admin`);
    } else {
      alert("Verwijderen is mislukt");
    }
  };

  return (
    <AdminDualPaneLayout
      image={playlist.cover_file.data.full_url}
      blur={40}
      title={episode.title}
      subtitle={"in " + playlist.title}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomUid]/admin/[playlistUid]`}
          as={`/rooms/${room.uid}/admin/${playlist.uid}`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <Box style={{ display: "inline-block" }}>
            <ImageCoverLayout
              imageUrl={episode.image_file.data.full_url}
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
                  disabled={isUpdating}
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
              <>
                <AdminInstructionsLayout
                  items={[
                    {
                      title: "Deze aflevering is gepubliceerd",
                      text:
                        "Deze is nu zichtbaar in de luisterkamer en Podcast.",
                    },
                  ]}
                />
                <Box pt={2} />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    router.push(`/rooms/[roomUid]`, `/rooms/${room.uid}`)
                  }
                >
                  <IconHeadset
                    fontSize="small"
                    color="secondary"
                    style={{ marginRight: 8 }}
                  />{" "}
                  Open Luisterkamer
                </Button>
                <Box pt={2} />
                <Button
                  fullWidth
                  variant="outlined"
                  onClick={() =>
                    router.push(
                      `/rooms/[roomUid]/admin`,
                      `/rooms/${room.uid}/admin`
                    )
                  }
                >
                  Naar begin Opname Studio
                </Button>
              </>
            )}
            <Box pt={2} />
            <Button
              disabled={isDeleting}
              onClick={handleDelete}
              variant="outlined"
              fullWidth
            >
              Verwijder
            </Button>
          </Box>
          {/* We can easily allow to re-record stuff :) */}
          {/* <Box mt={2}>
            <Link
              href={`/rooms/[roomUid]/admin/[playlistUid]/record-episode/[episodeUid]`}
              as={`/rooms/${room.uid}/admin/${playlist.uid}/record-episode/${episode.uid}`}
            >
              <Button fullWidth>Neem opnieuw op</Button>
            </Link>
          </Box> */}
        </>
      }
    />
  );
};
