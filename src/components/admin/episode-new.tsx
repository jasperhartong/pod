import episodeCreateMeta from "@/api/rpc/commands/episode.create.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { Box } from "@material-ui/core";
import {
  EpisodeForm,
  EpisodeFormValues,
  useEpisodeFormContext,
} from "./components/episode-form";
import { ImageCoverDropZone } from "./components/image-cover-dropzone";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

export const EpisodeNew = ({ room, playlist }: Props) => {
  const router = useRouter();
  const episodeFormContext = useEpisodeFormContext();
  const { revalidate } = useSWRRoom(room.uid);

  const handleSubmit = async (formData: EpisodeFormValues) => {
    const response = await RPCClientFactory(episodeCreateMeta).call({
      roomUid: room.uid,
      playlistUid: playlist.uid,
      data: {
        title: formData.title,
        image_url: formData.imageUrl,
      },
    });
    if (response.ok) {
      // Make sure to update local state with API truth and then move on..
      await revalidate();
      router.push(
        `/rooms/[roomUid]/admin/[playlistId]/record-episode/[episodeId]`,
        `/rooms/${room.uid}/admin/${playlist.id}/record-episode/${response.data.id}`
      );
    } else {
      alert("De aflevering kan niet bewaard worden.");
      episodeFormContext.clearError();
    }
  };

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = episodeFormContext.watch(
    episodeFormContext.formKeys.title
  );

  return (
    <AdminDualPaneLayout
      title={"Nieuwe aflevering"}
      subtitle={watchedTitle || defaultTitle}
      image={playlist.cover_file.data.full_url}
      blur={40}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomUid]/admin/[playlistId]`}
          as={`/rooms/${room.uid}/admin/${playlist.id}`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <ImageCoverDropZone
            onSuccess={(downloadUrl) =>
              episodeFormContext.setValue(
                episodeFormContext.formKeys.imageUrl,
                downloadUrl,
                true
              )
            }
            onDelete={() =>
              episodeFormContext.setValue(
                episodeFormContext.formKeys.imageUrl,
                undefined,
                true
              )
            }
          />
        </Box>
      }
      secondItem={
        <Box pt={2}>
          <EpisodeForm
            formContext={episodeFormContext}
            initialValues={{ title: defaultTitle }}
            onSubmit={handleSubmit}
          />
          <AdminInstructionsLayout
            items={[
              {
                title: "Plaatje",
                text:
                  "Bijvoorbeeld een plaatje uit het verhaal, of gewoon een mooie foto",
              },
              {
                title: "Titel",
                text:
                  "Bijvoorbeeld de titel van een hoofdstuk, of de titel van het korte verhaal",
              },
            ]}
          />
        </Box>
      }
    />
  );
};
