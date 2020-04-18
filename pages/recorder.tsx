import useAudioRecorder from "../src/hooks/useAudioRecorder";
import { Container, Box, Button, Typography } from "@material-ui/core";
import { AudioVisualizer } from "../src/components/audio-visualizer";

const Recorder = () => {
  const { state, data } = useAudioRecorder();

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" pt={8}>
        <Typography
          color={state.recorderState.isError ? "error" : "textPrimary"}
        >
          {state.recorderState.state}
        </Typography>
      </Box>

      <Box textAlign="center" pt={8}>
        <Button onClick={state.startListening}>startListening</Button>
        <Button onClick={state.stopListening}>stopListening</Button>
        <Button onClick={() => state.startRecording(3000)}>
          startRecording
        </Button>
        <Button onClick={state.stopRecording}>stopRecording</Button>
      </Box>

      {state.recorderState.state !== "recording" && data.audioBlobs && (
        <Box textAlign="center" pt={8}>
          <Button onClick={data.clear}>Clear</Button>
          <Button onClick={data.combine}>Combine</Button>
        </Box>
      )}

      <Box textAlign="center" pt={8}>
        {data.audioBlobs !== undefined &&
          data.audioBlobs.map((blob, index) => (
            <Box key={index}>
              <Typography>recording {index + 1}</Typography>
              <audio src={URL.createObjectURL(blob)} controls />
            </Box>
          ))}
      </Box>

      <Box textAlign="center" pt={8}>
        <Typography>Recorder Component v0.3.0</Typography>
      </Box>

      {["recording", "listening"].includes(state.recorderState.state) && (
        <AudioVisualizer
          uniqueId="test"
          getFrequencyData={state.getFrequencyData}
        />
      )}
    </Container>
  );
};

export default Recorder;
