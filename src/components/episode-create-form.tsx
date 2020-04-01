import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormGroup,
  TextField
} from "@material-ui/core";
import { useForm, Controller, ErrorMessage } from "react-hook-form";
import { IPlaylist } from "../app-schema/IPlaylist";
import {
  RequestData,
  ResponseData
} from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import MediaDropZone from "./media-dropzone";
import { IEpisode } from "../app-schema/IEpisode";

const defaultValues: RequestData = {
  title: "",
  image_url: "",
  audio_url: "",
  status: "published",
  playlist: ""
};

interface Props {
  playlist?: IPlaylist;
  onFormChange: (recording: Partial<RequestData>) => void;
  onFormSuccess: (episode: IEpisode) => void;
}

const ErrorMessageTypography = ({ children }: { children?: JSX.Element }) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);

const EpisodeCreateForm = ({
  playlist,
  onFormChange,
  onFormSuccess
}: Props) => {
  const {
    handleSubmit,
    control,
    formState,
    register,
    setValue,
    watch,
    errors
  } = useForm({
    mode: "onChange",
    defaultValues
  });
  const [serverError, setServerError] = useState<string>();

  const disabled = !playlist || formState.isSubmitting;
  const watchedFields = watch(["title", "image_url"]);

  useEffect(() => {
    onFormChange({
      title: watchedFields.title as string,
      image_url: watchedFields.image_url as string
    });
  }, [watchedFields.title, watchedFields.image_url]);

  return (
    <form
      onSubmit={handleSubmit(async data => {
        setServerError(undefined);
        const reqData = data as RequestData;
        const submission = await rpcClient.call<RequestData, ResponseData>(
          "episode",
          "create",
          {
            ...defaultValues,
            ...reqData,
            playlist: playlist ? playlist.id.toString() : ""
          }
        );
        if (submission.ok) {
          onFormSuccess(submission.data);
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
          label=""
          placeholder="De titel"
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

      {/* Image */}
      <input
        name="image_url"
        type="hidden"
        ref={register({
          required: true
        })}
      />
      <MediaDropZone
        instructions={"drop image"}
        acceptedMimeTypes={["image/jpeg"]}
        onSuccess={downloadUrl => setValue("image_url", downloadUrl)}
      />
      <ErrorMessage
        errors={errors}
        name="image_url"
        as={<ErrorMessageTypography />}
        message="Voeg een afbeelding toe"
      />

      {/* Audio */}
      <input
        name="audio_url"
        type="hidden"
        ref={register({
          required: true
        })}
      />
      <MediaDropZone
        instructions={"drop audio / video"}
        acceptedMimeTypes={["audio/m4a", "video/mp4"]}
        onSuccess={downloadUrl => setValue("audio_url", downloadUrl)}
      />
      <ErrorMessage
        errors={errors}
        name="image_url"
        as={<ErrorMessageTypography />}
        message="Voeg een opname toe"
      />

      {/* Submit Button */}
      <Box pt={3}>
        <Button
          variant="contained"
          fullWidth={true}
          type="submit"
          disabled={disabled}
        >
          Voeg toe
        </Button>
      </Box>

      {/* Help & error texts */}
      <Box p={2} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary">
          De opname wordt toegevoegd aan {playlist ? playlist.title : "..."}
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
