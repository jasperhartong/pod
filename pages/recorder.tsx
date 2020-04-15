import useAudioRecorder from "../src/hooks/useAudioRecorder";
import { Container, Box, Button, Typography } from "@material-ui/core";

const Recorder = () => {
  const {
    start,
    stop,
    clear,
    audioBlobs,
    recordStatus,
    combine,
  } = useAudioRecorder();

  return (
    <Container maxWidth="lg">
      <Box textAlign="center" pt={8}>
        <Typography>{recordStatus}</Typography>
      </Box>

      <Box textAlign="center" pt={8}>
        <Button onClick={start}>Start</Button>
        <Button onClick={stop}>Stop</Button>
        <Button onClick={clear}>Clear</Button>
        <Button onClick={combine}>Combine</Button>
        {audioBlobs !== undefined &&
          audioBlobs.map((blob, index) => (
            <Box key={index}>
              <Typography>recording {index + 1}</Typography>
              <audio src={URL.createObjectURL(blob)} controls />
            </Box>
          ))}
      </Box>
      <Box textAlign="center" pt={8}>
        <Typography>v0.0.1</Typography>
      </Box>
    </Container>
  );
};

export default Recorder;
