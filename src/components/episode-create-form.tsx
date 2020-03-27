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
import { DbPlaylist } from "../storage/interfaces";

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

const EpisodeCreateForm = ({ playlist }: { playlist: DbPlaylist }) => {
  const error = false;

  const { handleSubmit, control, watch, formState } = useForm({
    mode: "onChange"
  });

  return (
    <form onSubmit={handleSubmit(data => console.warn(data))}>
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
