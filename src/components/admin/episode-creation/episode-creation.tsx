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

interface Props {
  room: IRoom;
  playlist: IPlaylist;
}

const EpisodeCreation = ({ room, playlist }: Props) => {
  const { handleSubmit, control, formState, errors, watch } = useForm<{
    title: string;
  }>({
    mode: "onChange",
  });

  const defaultTitle = `Deel ${playlist.episodes.length + 1}`;
  const watchedTitle = watch("title");
  const SubmitDisabled = formState.isSubmitting;

  const onSubmit = (formData: { title: string }) => {};

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
        <Box
          width="100%"
          height="100%"
          minHeight={200}
          style={{
            backgroundImage: `url("/background.png")`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      }
      secondItem={
        <>
          <Typography variant="h6">Hoe heet de aflevering vandaag?</Typography>
          <Typography variant="body1" color="textSecondary">
            Bijvoorbeeld de title van een hoofdstuk of een nummer dat aangeeft
            hoeveelste deel het is.
          </Typography>

          <form onSubmit={handleSubmit(onSubmit)}>
            <Box pt={2} pb={2}>
              <FormGroup>
                {/* Title */}
                <Controller
                  // set default value at least to a string to counter "uncontrolled to controlled error"
                  // https://github.com/react-hook-form/react-hook-form-website/issues/133
                  defaultValue={defaultTitle}
                  control={control}
                  rules={{ required: true }}
                  as={TextField}
                  label="Titel"
                  placeholder="Titel aflevering"
                  name="title"
                  disabled={SubmitDisabled}
                />
              </FormGroup>
              <ErrorMessage
                errors={errors}
                name="title"
                as={<ErrorMessageTypography />}
                message="Vul een titel in"
              />
            </Box>
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
