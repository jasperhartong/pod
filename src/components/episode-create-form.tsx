import { useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormGroup,
  TextField
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import { IPlaylist } from "../app-schema/IPlaylist";
import {
  RequestData,
  ResponseData
} from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import MediaDropZone from "./media-dropzone";

const EpisodeCreateForm = ({
  playlist,
  updateRecording
}: {
  playlist?: IPlaylist;
  updateRecording: (episode: Partial<RequestData>) => void;
}) => {
  const error = false;

  const defaultValues: RequestData = {
    title: "",
    image_url: "",
    audio_url: "",
    status: "published",
    playlist: ""
  };

  const {
    handleSubmit,
    control,
    formState,
    register,
    setValue,
    watch
  } = useForm({
    mode: "onChange",
    defaultValues
  });

  const watchedFields = watch(["title", "image_url"]);

  useEffect(() => {
    updateRecording({
      title: watchedFields.title as string,
      image_url: watchedFields.image_url as string
    });
  }, [watchedFields.title, watchedFields.image_url]);

  return (
    <form
      onSubmit={handleSubmit(data => {
        const reqData = data as RequestData;
        rpcClient.call<RequestData, ResponseData>("episode", "create", {
          ...defaultValues,
          ...reqData,
          playlist: playlist ? playlist.id.toString() : ""
        });
      })}
    >
      <FormGroup>
        <Controller
          control={control}
          rules={{ required: true }}
          as={TextField}
          label=""
          placeholder="De titel"
          name="title"
        />
        {error && (
          <Box p={2}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Something went wrong...
            </Typography>
          </Box>
        )}
      </FormGroup>
      <input name="image_url" type="hidden" ref={register} />
      <MediaDropZone
        instructions={"drop image"}
        acceptedMimeTypes={["image/jpeg"]}
        onSuccess={downloadUrl => setValue("image_url", downloadUrl)}
      />
      <input name="audio_url" type="hidden" ref={register} />
      <MediaDropZone
        instructions={"drop audio / video"}
        acceptedMimeTypes={["audio/m4a", "video/mp4"]}
        onSuccess={downloadUrl => setValue("audio_url", downloadUrl)}
      />
      <Box pt={3}>
        <Button
          variant="contained"
          fullWidth={true}
          type="submit"
          disabled={formState.isSubmitting}
        >
          Voeg toe
        </Button>
      </Box>
      <Box p={2} textAlign="center">
        <Typography variant="subtitle2" color="textSecondary">
          De opname wordt toegevoegd aan {playlist ? playlist.title : "..."}
        </Typography>
      </Box>
    </form>
  );
};

export default EpisodeCreateForm;
