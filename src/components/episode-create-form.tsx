import { useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  FormGroup,
  TextField,
  SwipeableDrawer
} from "@material-ui/core";
import { useForm, Controller } from "react-hook-form";
import { useRoomContext } from "../hooks/useRoomContext";
import { IDbPlaylist } from "../api/collection-storage/interfaces/IDbPlaylist";
import {
  RequestData,
  ResponseData
} from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import MediaDropZone from "./media-dropzone";

const EpisodeCreateDrawer = () => {
  const { roomState, recordingActions } = useRoomContext();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={!!roomState.newRecording}
      onClose={() => recordingActions.cancel()}
      onOpen={() => console.warn("on open")}
    >
      {roomState.newRecording && (
        <Box p={2} pb={8}>
          <EpisodeCreateForm
            playlist={roomState.newRecording.playlist}
            updateRecording={recordingActions.updateRecording}
          />
        </Box>
      )}
    </SwipeableDrawer>
  );
};

const EpisodeCreateForm = ({
  playlist,
  updateRecording
}: {
  playlist: IDbPlaylist;
  updateRecording: (episode: Partial<RequestData>) => void;
}) => {
  const error = false;

  const defaultValues: RequestData = {
    title: "",
    image_url: "",
    audio_url: "",
    status: "published",
    playlist: playlist.id.toString()
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
          ...reqData
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
    </form>
  );
};

export default EpisodeCreateDrawer;
