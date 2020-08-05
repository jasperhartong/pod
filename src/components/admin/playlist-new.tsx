import playlistCreateMeta from "@/api/rpc/commands/playlist.create.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IRoom } from "@/app-schema/IRoom";
import { useRouter } from "@/hooks/useRouter";
import { useSWRRoom } from "@/hooks/useSWRRoom";
import { Box } from "@material-ui/core";
import { ImageCoverDropZone } from "./components/image-cover-dropzone";
import {
  PlaylistForm,
  PlaylistFormValues,
  usePlaylistFormContext,
} from "./components/playlist-form";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import { AdminInstructionsLayout } from "./layout/admin-instruction-layout";

interface Props {
  room: IRoom;
}

export const PlaylistNew = ({ room }: Props) => {
  const router = useRouter();
  const formContext = usePlaylistFormContext();
  const { revalidate } = useSWRRoom(room.uid);

  const handleSubmit = async (formData: PlaylistFormValues) => {
    const playlistCreation = await RPCClientFactory(playlistCreateMeta).call({
      roomUid: room.uid,
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
        `/rooms/[roomUid]/admin/[playlistUid]`,
        `/rooms/${room.uid}/admin/${playlistCreation.data.uid}`
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
      image={room.cover_file.data.full_url}
      blur={40}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomUid]/admin`}
          as={`/rooms/${room.uid}/admin`}
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
