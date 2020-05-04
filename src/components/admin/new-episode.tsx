import Link from "next/link";
import { ReactNode, MouseEvent } from "react";
import { useRouter } from "next/dist/client/router";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import {
  Box,
  TextField,
  Button,
  FormGroup,
  IconButton,
  Typography,
  Grow,
  CircularProgress,
  useTheme,
} from "@material-ui/core";
import ImageIcon from "@material-ui/icons/Image";
import IconDelete from "@material-ui/icons/DeleteOutline";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import useSignedMediaUploadDropZone from "../../hooks/useSignedMediaUploadDropZone";
import { RPCClientFactory } from "../../api/rpc/rpc-client";
import episodeCreateMeta from "../../api/rpc/commands/episode.create.meta";
import AdminDualPaneLayout from "./layout/admin-dual-pane";
import { EpisodeCoverLayout } from "./layout/episode-cover-layout";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

interface FormValues {
  title: string;
  imageUrl: string;
}

const NewEpisode = ({ room, playlist }: Props) => {
  const router = useRouter();
  const form = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = form.watch("title");
  const SubmitDisabled = form.formState.isSubmitting || !form.formState.isValid;

  const handleSubmit = async (formData: FormValues) => {
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

  return (
    <AdminDualPaneLayout
      title={"Nieuwe aflevering"}
      subtitle={watchedTitle || defaultTitle}
      action={
        <Link href={`/rooms/[roomSlug]/admin`} as={`/rooms/${room.slug}/admin`}>
          <IconButton>
            <CloseIcon />
          </IconButton>
        </Link>
      }
      firstItem={
        <Box p={2} pb={0} textAlign="center">
          <EpisodeCoverDropZone
            onSuccess={(downloadUrl) =>
              form.setValue("imageUrl", downloadUrl, true)
            }
            onDelete={() => form.setValue("imageUrl", undefined, true)}
          />
        </Box>
      }
      secondItem={
        <Box pt={2}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormGroup>
              {/* Title */}
              <Controller
                // set default value at least to a string to counter "uncontrolled to controlled error"
                // https://github.com/react-hook-form/react-hook-form-website/issues/133
                defaultValue={defaultTitle}
                control={form.control}
                rules={{ required: true }}
                as={TextField}
                label="Titel"
                placeholder="Titel aflevering"
                name="title"
                disabled={form.formState.isSubmitting}
              />
            </FormGroup>
            <ErrorMessage
              errors={form.errors}
              name="title"
              as={<ErrorMessageTypography />}
              message="Vul een titel in"
            />

            <input
              type="hidden"
              ref={form.register({ required: true })}
              name="imageUrl"
            />
            {/* submit */}
            <Box mt={2}>
              <Button
                disabled={SubmitDisabled}
                type="submit"
                variant="contained"
                fullWidth
              >
                Ga naar opnemen
              </Button>
            </Box>
          </form>

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

const ErrorMessageTypography = ({ children }: { children?: ReactNode }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);

const EpisodeCoverDropZone = ({
  onSuccess,
  onDelete,
}: {
  onSuccess: (downloadUrl: string) => void;
  onDelete: () => void;
}) => {
  const theme = useTheme();
  const dropZone = useSignedMediaUploadDropZone({
    onSuccess,
    acceptedMimeTypes: ["image/jpg", "image/jpeg"],
  });

  const _onDelete = () => {
    dropZone.reset();
    onDelete();
  };

  const hasImage = !!dropZone.downloadUrl;

  return (
    <div {...dropZone.getRootProps()} style={{ display: "inline-block" }}>
      <input {...dropZone.getInputProps()} />

      <EpisodeCoverLayout
        style={{
          width: 240,
          height: 240,
          transition: "opacity 300ms",
          opacity: dropZone.uploading ? 0.7 : 1.0,
        }}
        imageUrl={dropZone.downloadUrl}
        centeredChildren={
          <Grow in={!hasImage}>
            <Box>
              {/* Idle state: show placeholder */}
              {!hasImage && !dropZone.uploading && (
                <Box pb={1}>
                  <ImageIcon fontSize="large" />
                  <Typography variant="subtitle2">Selecteer plaatje</Typography>
                </Box>
              )}

              {/* Uploading state: show loader */}
              {dropZone.uploading && (
                <CircularProgress
                  value={dropZone.uploadPercentCompleted}
                  variant={
                    dropZone.uploadPercentCompleted === 100
                      ? "indeterminate"
                      : "determinate"
                  }
                />
              )}

              {/* Error state: show error */}
              {dropZone.uploadError && (
                <Box pb={1}>
                  <Typography variant="subtitle2" color="error">
                    Er ging iets mis bij het uploaden, probeer het nogmaals
                  </Typography>
                </Box>
              )}
            </Box>
          </Grow>
        }
        bottomRightAction={
          <Grow in={hasImage}>
            {/* Show delete button when there's an image */}
            <IconButton
              style={{
                background: theme.palette.action.selected,
                color: theme.palette.getContrastText(
                  theme.palette.action.selected
                ),
              }}
              onClick={(event: MouseEvent<HTMLElement>) => {
                event.preventDefault();
                event.stopPropagation();
                _onDelete();
              }}
            >
              <IconDelete fontSize="small" />
            </IconButton>
          </Grow>
        }
      />
    </div>
  );
};
