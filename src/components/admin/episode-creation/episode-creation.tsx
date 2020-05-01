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
import IconNext from "@material-ui/icons/ChevronRight";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../../app-schema/IRoom";
import { IPlaylist } from "../../../app-schema/IPlaylist";
import useSignedMediaUploadDropZone from "../../../hooks/useSignedMediaUploadDropZone";

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
      formContext.setValue("cover_file_url", downloadUrl, true);
    },
    acceptedMimeTypes: ["image/jpg", "image/jpeg"],
  });

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = formContext.watch("title");
  const SubmitDisabled =
    formContext.formState.isSubmitting || !formContext.formState.isValid;

  const onSubmit = (formData: FormValues) => {
    console.warn(formData);
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
        <div {...dropZone.getRootProps()}>
          <input {...dropZone.getInputProps()} />
          <Box
            width="100%"
            height="100%"
            minHeight={200}
            style={{
              backgroundImage: `url("${
                dropZone.downloadUrl || "/background.png"
              }")`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          />
        </div>
      }
      secondItem={
        <>
          <Typography variant="h6">Hoe heet de aflevering vandaag?</Typography>
          <Typography variant="body1" color="textSecondary">
            Bijvoorbeeld de title van een hoofdstuk of een nummer dat aangeeft
            hoeveelste deel het is.
          </Typography>

          <form onSubmit={formContext.handleSubmit(onSubmit)}>
            <Box pt={2} pb={2}>
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
            </Box>
            <input
              type="hidden"
              ref={formContext.register({ required: true })}
              name="cover_file_url"
            />
            {/* submit */}
            <Button
              disabled={SubmitDisabled}
              type="submit"
              variant="contained"
              fullWidth
            >
              Neem intro op <IconNext />
            </Button>
          </form>
        </>
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