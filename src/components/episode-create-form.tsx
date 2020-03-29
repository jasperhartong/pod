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
import axios from "axios";
import { rpcUrl } from "../api/rpc/urls";
import { RequestData, ResponseData } from "../api/rpc/episode.create";
import rpcClient from "../api/rpc/client";

const EpisodeCreateDrawer = () => {
  const { roomState, roomDispatch, recording } = useRoomContext();

  return (
    <SwipeableDrawer
      anchor="bottom"
      open={!!roomState.recordingFor}
      onClose={() => recording.cancel()}
      onOpen={() => console.warn("on open")}
    >
      {roomState.recordingFor && (
        <Box p={2} pb={8}>
          <EpisodeCreateForm playlist={roomState.recordingFor} />
        </Box>
      )}
    </SwipeableDrawer>
  );
};

const EpisodeCreateForm = ({ playlist }: { playlist: IDbPlaylist }) => {
  const error = false;

  const defaultValues: RequestData = {
    title: "",
    description: "",
    image_url: "",
    audio_url: "",
    status: "published",
    playlist: playlist.id.toString()
  };

  const { handleSubmit, control, watch, formState } = useForm({
    mode: "onChange",
    defaultValues
  });

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
        <Controller
          control={control}
          rules={{ required: true }}
          as={TextField}
          label=""
          placeholder="De omschrijving"
          name="description"
        />
        <Controller
          control={control}
          rules={{ required: true }}
          as={TextField}
          label=""
          placeholder="Audio url"
          name="audio_url"
        />
        <Controller
          control={control}
          rules={{ required: true }}
          as={TextField}
          label=""
          placeholder="Image url"
          name="image_url"
        />
        {error && (
          <Box p={2}>
            <Typography variant="subtitle2" color="error" gutterBottom>
              Something went wrong...
            </Typography>
          </Box>
        )}
      </FormGroup>
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
