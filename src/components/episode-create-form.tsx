import { TypeOf } from "io-ts";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce";
import {
  Box,
  Button,
  Typography,
  FormGroup,
  TextField,
  Grid,
} from "@material-ui/core";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import { IPlaylist } from "../app-schema/IPlaylist";
import MediaDropZone from "./media-dropzone";
import episodeCreateMeta from "../api/rpc/commands/episode.create.meta";
import { RPCClientFactory } from "../api/rpc/client";

type RequestData = TypeOf<typeof episodeCreateMeta["reqValidator"]>;

const defaultValues: RequestData = {
  title: "",
  image_url: "",
  audio_url: "",
  status: "published",
  playlist: "",
};

interface Props {
  playlist?: IPlaylist;
  onFormChange: (recording: Partial<RequestData>) => void;
  onFormSuccess: () => void;
}

const ErrorMessageTypography = ({ children }: { children?: JSX.Element }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);

const EpisodeCreateForm = ({
  playlist,
  onFormChange,
  onFormSuccess,
}: Props) => {
  const {
    handleSubmit,
    control,
    formState,
    register,
    setValue,
    watch,
    errors,
  } = useForm({
    mode: "onChange",
    defaultValues,
  });
  const [serverError, setServerError] = useState<string>();

  const disabled = !playlist || formState.isSubmitting;
  const [watchedFields] = useDebounce(watch(["title", "image_url"]), 100, {
    leading: true,
  });

  useEffect(() => {
    onFormChange({
      title: watchedFields.title as string,
      image_url: watchedFields.image_url as string,
    });
  }, [watchedFields.title, watchedFields.image_url]);

  return (
    <form
      onSubmit={handleSubmit(async (data) => {
        setServerError(undefined);
        const reqData = data as RequestData;
        const submission = await RPCClientFactory(episodeCreateMeta).call({
          ...defaultValues,
          ...reqData,
          playlist: playlist ? playlist.id.toString() : "",
        });

        if (submission.ok) {
          onFormSuccess();
        } else {
          setServerError(submission.error);
        }
      })}
    >
      <FormGroup>
        {/* Title */}
        <Controller
          control={control}
          rules={{ required: true }}
          as={TextField}
          label="Titel"
          placeholder="Nieuwe opname"
          name="title"
          disabled={disabled}
        />
      </FormGroup>
      <ErrorMessage
        errors={errors}
        name="title"
        as={<ErrorMessageTypography />}
        message="Vul een titel in"
      />

      <Box pt={2}>
        <Grid
          container
          justify="space-between"
          // alignContent="center"
          // alignItems="center"
        >
          {/* Image */}
          <Grid item>
            <Box pt={1} pb={1}>
              <input
                name="image_url"
                type="hidden"
                ref={register({
                  required: true,
                })}
              />
              <MediaDropZone
                instructions={"Afbeelding"}
                acceptedMimeTypes={["image/jpeg", "image/jpg", "image/png"]}
                onSuccess={(downloadUrl) => setValue("image_url", downloadUrl)}
              />
              <ErrorMessage
                errors={errors}
                name="image_url"
                as={<ErrorMessageTypography />}
                message="Voeg een afbeelding toe"
              />
            </Box>
          </Grid>

          {/* Audio */}
          <Grid item>
            <Box pt={1} pb={1}>
              <input
                name="audio_url"
                type="hidden"
                ref={register({
                  required: true,
                })}
              />
              <MediaDropZone
                instructions={"Opname"}
                acceptedMimeTypes={["audio/m4a", "video/mp4"]}
                onSuccess={(downloadUrl) => setValue("audio_url", downloadUrl)}
              />
              <ErrorMessage
                errors={errors}
                name="image_url"
                as={<ErrorMessageTypography />}
                message="Voeg een opname toe"
              />
            </Box>
          </Grid>
        </Grid>
      </Box>

      {/* Submit Button */}
      <Box pt={3}>
        <Button
          variant="contained"
          fullWidth={true}
          type="submit"
          color="primary"
          disabled={disabled}
        >
          Voeg toe
        </Button>
      </Box>

      {/* Help & error texts */}
      <Box p={2} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary">
          De opname wordt toegevoegd aan "{playlist ? playlist.title : "..."}"
        </Typography>
        {serverError && (
          <Typography variant="subtitle2" color="error" gutterBottom>
            Er is iets mis gegaan, probeer nog een keer, of bel Jasper.
          </Typography>
        )}
      </Box>
    </form>
  );
};

export default EpisodeCreateForm;
