import { Box } from "@material-ui/core";
import { IRoom } from "@/app-schema/IRoom";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { ImageCoverDropZone } from "./components/image-cover-dropzone";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { useRouter } from "@/hooks/useRouter";
import { PlaylistForm } from "./components/playlist-form";
import {
  usePlaylistFormContext,
  PlaylistFormValues,
} from "./components/playlist-form";
import playlistCreateMeta from "@/api/rpc/commands/playlist.create.meta";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";

interface Props {
  room: IRoom;
}

export const PlaylistNew = ({ room }: Props) => {
  const router = useRouter();
  const formContext = usePlaylistFormContext();
  const { revalidate } = useSWRRoom(room.slug);

  const handleSubmit = async (formData: PlaylistFormValues) => {
    const playlistCreation = await RPCClientFactory(playlistCreateMeta).call({
      roomId: room.id,
      data: {
        title: formData.title,
        description: formData.description || "",
        image_url: formData.imageUrl,
      },
    });
    if (playlistCreation.ok) {
      // Make sure to update local state with API truth and then move on..
      await revalidate();
      router.push(
        `/rooms/[roomSlug]/admin/[playlistId]`,
        `/rooms/${room.slug}/admin/${playlistCreation.data.id}`
      );
    } else {
      alert("De collectie kon niet worden aangemaakt, probeer opnieuw.");
      formContext.clearError();
    }
  };

  const defaultTitle = `Naamloze collectie`;
  const watchedTitle = formContext.watch(formContext.formKeys.title);

  return (
    <AdminDualPaneLayout
      title={"Nieuwe collectie"}
      subtitle={watchedTitle || defaultTitle}
      image={room.cover_file.data.thumbnails.find((t) => t.width > 400)?.url}
      blur={40}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomSlug]/admin`}
          as={`/rooms/${room.slug}/admin`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <ImageCoverDropZone
            onSuccess={(downloadUrl) =>
              formContext.setValue(
                formContext.formKeys.imageUrl,
                downloadUrl,
                true
              )
            }
            onDelete={() =>
              formContext.setValue(
                formContext.formKeys.imageUrl,
                undefined,
                true
              )
            }
          />
        </Box>
      }
      secondItem={
        <Box pt={2}>
          <PlaylistForm
            formContext={formContext}
            initialValues={{ title: defaultTitle }}
            onSubmit={handleSubmit}
          />
          <AdminInstructionsLayout
            items={[
              {
                title: "Plaatje",
                text:
                  "Bijvoorbeeld een leuke foto van degene die voorleest, of van het boek dat wordt voorgelezen.",
              },
              {
                title: "Titel",
                text:
                  "Bijvoorbeeld de titel van een boek, of de naam van een eigen bedachte held (jippie-jippie-cowboy?) of de naam van een auteur.",
              },
              {
                title: "Korte omschrijving",
                text: "Bijvoorbeeld de gene die het voorleest 'Van Oma Els'.",
              },
            ]}
          />
        </Box>
      }
    />
  );
};
