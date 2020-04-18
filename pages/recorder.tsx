import useAudioRecorder from "../src/hooks/useAudioRecorder";
import {
  Container,
  Box,
  Button,
  Typography,
  Fab,
  Divider,
  ButtonBase,
} from "@material-ui/core";
import { AudioVisualizer } from "../src/components/audio-visualizer";
import RecordIcon from "@material-ui/icons/Mic";
import MicOff from "@material-ui/icons/Cancel";
import themeOptionsProvider, { AppColors } from "../src/theme";

const Recorder = () => {
  const { state, data } = useAudioRecorder();

  return (
    <>
      <Box position="absolute" top={0} left={0} p={1}>
        <Typography variant="overline" color="textSecondary">
          Recorder Test v0.4.6
        </Typography>
      </Box>

      <Container maxWidth="lg">
        <Box textAlign="center" pt={8}>
          {"idle" === state.recorderState.state && (
            <Button onClick={state.startListening} variant="outlined">
              Geef toegang tot microfoon
            </Button>
          )}
          {["listen_error"].includes(state.recorderState.state) && (
            <Typography color={"error"}>
              Oeps er ging iets mis. Heb je wel toegang gegeven? Probeer het
              anders in een andere browsers
            </Typography>
          )}

          {["listening", "recording"].includes(state.recorderState.state) && (
            <>
              <Fab
                variant="extended"
                color="secondary"
                style={{
                  color:
                    "recording" === state.recorderState.state
                      ? AppColors.RED
                      : themeOptionsProvider.theme.palette.secondary
                          .contrastText,
                }}
                onClick={
                  "recording" === state.recorderState.state
                    ? state.stopRecording
                    : () => state.startRecording(3000)
                }
              >
                <RecordIcon
                  style={{
                    paddingRight: 4,
                    color: AppColors.RED,
                  }}
                />{" "}
                {"recording" === state.recorderState.state
                  ? "Stop met opnemen"
                  : "Start met opnemen"}
              </Fab>

              {"recording" === state.recorderState.state && (
                <AudioVisualizer
                  uniqueId="recording"
                  getFrequencyData={state.getFrequencyData}
                />
              )}

              <Box textAlign="center" pt={2}>
                <Typography variant="overline" color="textSecondary">
                  {"listening" === state.recorderState.state && (
                    <>
                      Microfoon actief{" "}
                      <ButtonBase
                        onClick={state.stopListening}
                        style={{ marginTop: -2 }}
                      >
                        <MicOff fontSize="inherit" />
                      </ButtonBase>
                    </>
                  )}
                  {"recording" === state.recorderState.state &&
                    "Aan het opnemen.."}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {state.recorderState.state !== "recording" && data.audioBlobs && (
          <Box textAlign="center" pt={8}>
            <Divider />
            <Box pb={2} pt={2}>
              {data.audioBlobs.map((blob, index) => (
                <Box key={index}>
                  <Typography>recording {index + 1}</Typography>
                  <audio src={URL.createObjectURL(blob)} controls />
                </Box>
              ))}
            </Box>
            <Button size="small" onClick={data.clear}>
              Clear
            </Button>
            {data.audioBlobs.length > 1 && (
              <Button size="small" onClick={data.combine}>
                Combine
              </Button>
            )}
          </Box>
        )}
      </Container>
    </>
  );
};

export default Recorder;
