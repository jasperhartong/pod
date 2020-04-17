import { useRef, useEffect } from "react";
import useAudioRecorder from "../src/hooks/useAudioRecorder";
import {
  Container,
  Box,
  Button,
  Typography,
  makeStyles,
  Paper,
} from "@material-ui/core";

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
        <Typography>Recorder Component v0.2.5</Typography>
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

interface Props {
  getFrequencyData: (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => void;
  uniqueId: string;
}

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    paddingTop: "25%",
  },
  frequencyBand: {
    minWidth: 4,
  },
}));

// TODO: How to decide on frequence bands?
const frequencyBandArray: number[] = Array.from(Array(25).keys());
const AudioVisualizer = (props: Props) => {
  const classes = useStyles();

  const amplitudeValues = useRef<Uint8Array | null>(null);

  const adjustFreqBandStyle = (newAmplitudeData: Uint8Array) => {
    amplitudeValues.current = newAmplitudeData;

    let domElements = frequencyBandArray.map((num) =>
      document.getElementById(`${props.uniqueId}${num}`)
    );

    frequencyBandArray.forEach((num) => {
      const element = domElements[num];
      const amplitudeValue = amplitudeValues.current
        ? amplitudeValues.current[num]
        : null;
      if (element && amplitudeValue) {
        element.style.backgroundColor = `rgb(0, 255, ${amplitudeValue})`;
        element.style.height = `${amplitudeValue}px`;
      }
    });
  };

  const runSpectrum = () => {
    props.getFrequencyData(adjustFreqBandStyle);
    requestAnimationFrame(runSpectrum);
  };

  useEffect(() => {
    requestAnimationFrame(runSpectrum);
  }, []);

  return (
    <div>
      <div className={classes.flexContainer}>
        {frequencyBandArray.map((num) => (
          <Paper
            className={classes.frequencyBand}
            elevation={4}
            id={`${props.uniqueId}${num}`}
            key={num}
          />
        ))}
      </div>
    </div>
  );
};
