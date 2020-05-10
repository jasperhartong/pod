import { useRouter } from "next/dist/client/router";
import { Box, Typography } from "@material-ui/core";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { RPCClientFactory } from "../../api/rpc/rpc-client";
import episodeCreateMeta from "../../api/rpc/commands/episode.create.meta";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { AdminHeaderClose } from "./layout/admin-header-close";
import {
  useEpisodeFormContext,
  EpisodeFormValues,
  EpisodeForm,
} from "./components/episode-form";
import { EpisodeCoverDropZone } from "./components/episode-cover-dropzone";
import { useSWRRoom } from "../../hooks/useSWRRoom";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

export const EpisodeNew = ({ room, playlist }: Props) => {
  const router = useRouter();
  const episodeFormContext = useEpisodeFormContext();
  const { revalidate } = useSWRRoom(room.slug);

  const handleSubmit = async (formData: EpisodeFormValues) => {
    const response = await RPCClientFactory(episodeCreateMeta).call({
      playlistId: playlist.id,
      data: {
        title: formData.title,
        status: "draft",
        image_url: formData.imageUrl,
      },
    });
    if (response.ok) {
      // Make sure to update local state with API truth and then move on.. Current back end needs some breathing before it returns the new episode
      await revalidate();
      router.push(
        `/rooms/[roomSlug]/admin/[playlistId]/record-episode/[episodeId]`,
        `/rooms/${room.slug}/admin/${playlist.id}/record-episode/${response.data.id}`
      );
    } else {
      alert("De aflevering kan niet bewaard worden.");
      episodeFormContext.clearError();
    }
  };

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = episodeFormContext.watch("title");

  return (
    <AdminDualPaneLayout
      title={"Nieuwe aflevering"}
      subtitle={watchedTitle || defaultTitle}
      image={
        playlist.cover_file.data.thumbnails.find((t) => t.width > 400)?.url
      }
      blur={40}
      action={
        <AdminHeaderClose
          url={`/rooms/[roomSlug]/admin/[playlistId]`}
          as={`/rooms/${room.slug}/admin/${playlist.id}`}
        />
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <EpisodeCoverDropZone
            onSuccess={(downloadUrl) =>
              episodeFormContext.setValue("imageUrl", downloadUrl, true)
            }
            onDelete={() =>
              episodeFormContext.setValue("imageUrl", undefined, true)
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
          <Box mt={4} mb={2}>
            <Typography variant="body2" color="textPrimary" gutterBottom>
              Tips
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Plaatje</b>: Bijvoorbeeld een plaatje uit het verhaal, of
              gewoon een mooie foto
            </Typography>
            <Typography variant="body2" color="textSecondary">
              <b>Titel</b>: Bijvoorbeeld de titel van een hoofdstuk, of de titel
              van het korte verhaal
            </Typography>
          </Box>
        </Box>
      }
    />
  );
};
