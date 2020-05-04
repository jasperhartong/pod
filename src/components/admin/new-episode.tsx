import { useRouter } from "next/dist/client/router";
import { Box, Typography } from "@material-ui/core";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { RPCClientFactory } from "../../api/rpc/rpc-client";
import episodeCreateMeta from "../../api/rpc/commands/episode.create.meta";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import AdminHeaderCloseToOverview from "./layout/admin-header-close-to-overview";
import {
  useEpisodeFormContext,
  EpisodeFormValues,
  EpisodeForm,
} from "./components/episode-form";
import { EpisodeCoverDropZone } from "./components/episode-cover-dropzone";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

const NewEpisode = ({ room, playlist }: Props) => {
  const router = useRouter();
  const episodeFormContext = useEpisodeFormContext();

  const handleSubmit = async (formData: EpisodeFormValues) => {
    const response = await RPCClientFactory(episodeCreateMeta).call({
      title: formData.title,
      status: "draft",
      playlist: playlist.id.toString(),
      image_url: formData.imageUrl,
    });
    if (response.ok) {
      router.push(
        `/rooms/[roomSlug]/admin/[playListId]/record-episode/[episodeId]`,
        `/rooms/${room.slug}/admin/${playlist.id}/record-episode/${response.data.id}`
      );
    }
    // TODO: Handle !ok
  };

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = episodeFormContext.watch("title");

  return (
    <AdminDualPaneLayout
      title={"Nieuwe aflevering"}
      subtitle={watchedTitle || defaultTitle}
      action={<AdminHeaderCloseToOverview roomSlug={room.slug} />}
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
            <Typography variant="body2" color="textPrimary">
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

export default NewEpisode;
