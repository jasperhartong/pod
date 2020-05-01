import Link from "next/link";
import { ReactNode } from "react";
import AdminDualPaneLayout from "../layout/admin-dual-pane";
import {
  Box,
  Typography,
  TextField,
  Button,
  FormGroup,
  IconButton,
} from "@material-ui/core";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../../app-schema/IRoom";
import { IPlaylist } from "../../../app-schema/IPlaylist";
import useSignedMediaUploadDropZone from "../../../hooks/useSignedMediaUploadDropZone";
import { EpisodeCoverInDropZone } from "./episode-creation-cover-file";

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

interface FormValues {
  title: string;
  cover_file_url: string;
}

const EpisodeCreation = ({ room, playlist }: Props) => {
  const formContext = useForm<FormValues>({
    mode: "onChange",
    reValidateMode: "onChange",
  });

  const dropZone = useSignedMediaUploadDropZone({
    onSuccess: (downloadUrl) => {
      // Sync dropzone state to formState
      formContext.setValue("cover_file_url", downloadUrl, true);
    },
    acceptedMimeTypes: ["image/jpg", "image/jpeg"],
  });

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = formContext.watch("title");
  const SubmitDisabled =
    formContext.formState.isSubmitting || !formContext.formState.isValid;

  const handleSubmit = (formData: FormValues) => {
    console.warn(formData);
  };
  const handleCoverDelete = () => {
    // Sync dropzone state to formState
    formContext.setValue("cover_file_url", undefined, true);
    dropZone.reset();
  };

  return (
    <AdminDualPaneLayout
      image={playlist.cover_file.data.full_url}
      title={playlist.title}
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
          <div {...dropZone.getRootProps()} style={{ display: "inline-block" }}>
            <input {...dropZone.getInputProps()} />
            <EpisodeCoverInDropZone
              imageUrl={dropZone.downloadUrl}
              isUploading={dropZone.uploading}
              uploadError={!!dropZone.uploadError}
              uploadPercentCompleted={dropZone.uploadPercentCompleted}
              onDelete={handleCoverDelete}
            />
          </div>
        </Box>
      }
      secondItem={
        <Box pt={2}>
          <form onSubmit={formContext.handleSubmit(handleSubmit)}>
            <FormGroup>
              {/* Title */}
              <Controller
                // set default value at least to a string to counter "uncontrolled to controlled error"
                // https://github.com/react-hook-form/react-hook-form-website/issues/133
                defaultValue={defaultTitle}
                control={formContext.control}
                rules={{ required: true }}
                as={TextField}
                label="Titel"
                placeholder="Titel aflevering"
                name="title"
                disabled={formContext.formState.isSubmitting}
              />
            </FormGroup>
            <ErrorMessage
              errors={formContext.errors}
              name="title"
              as={<ErrorMessageTypography />}
              message="Vul een titel in"
            />

            <input
              type="hidden"
              ref={formContext.register({ required: true })}
              name="cover_file_url"
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
            <Typography variant="caption" color="textSecondary">
              Tips
            </Typography>
            <Typography variant="body2" color="textSecondary" gutterBottom>
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

export default EpisodeCreation;

const ErrorMessageTypography = ({ children }: { children?: ReactNode }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);
