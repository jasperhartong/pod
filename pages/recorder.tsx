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
import { AudioRecorderVisualizer } from "../src/components/audio-recorder-hook/audio-recorder-visualizer";
import RecordIcon from "@material-ui/icons/Mic";
import MicOff from "@material-ui/icons/Cancel";
import themeOptionsProvider, { AppColors } from "../src/theme";

const Recorder = () => {
  const { context, data } = useAudioRecorder();

  return (
    <>
      <Box position="absolute" top={0} left={0} p={1}>
        <Typography variant="overline" color="textSecondary">
          Recorder Test v0.4.6
        </Typography>
      </Box>

      <Container maxWidth="lg">
        <Box textAlign="center" pt={8}>
          {["listen_error", "idle"].includes(context.recorderState.state) && (
            <Button onClick={context.startListening} variant="outlined">
              Geef toegang tot microfoon
            </Button>
          )}
          {["listen_error"].includes(context.recorderState.state) && (
            <Typography color={"error"}>
              Oeps er ging iets mis. Heb je wel toegang gegeven? Probeer het
              anders in een andere browsers
            </Typography>
          )}

          {["listening", "recording"].includes(context.recorderState.state) && (
            <>
              <Fab
                variant="extended"
                color="secondary"
                style={{
                  color:
                    "recording" === context.recorderState.state
                      ? AppColors.RED
                      : themeOptionsProvider.theme.palette.secondary
                          .contrastText,
                }}
                onClick={
                  "recording" === context.recorderState.state
                    ? context.stopRecording
                    : () => context.startRecording(3000)
                }
              >
                <RecordIcon
                  style={{
                    paddingRight: 4,
                    color: AppColors.RED,
                  }}
                />{" "}
                {"recording" === context.recorderState.state
                  ? "Stop met opnemen"
                  : "Start met opnemen"}
              </Fab>

              {"recording" === context.recorderState.state && (
                <AudioRecorderVisualizer
                  uniqueId="recording"
                  getFrequencyData={context.getFrequencyData}
                />
              )}

              <Box textAlign="center" pt={2}>
                <Typography variant="overline" color="textSecondary">
                  {"listening" === context.recorderState.state && (
                    <>
                      Microfoon actief{" "}
                      <ButtonBase
                        onClick={context.stopListening}
                        style={{ marginTop: -2 }}
                      >
                        <MicOff fontSize="inherit" />
                      </ButtonBase>
                    </>
                  )}
                  {"recording" === context.recorderState.state &&
                    "Aan het opnemen.."}
                </Typography>
              </Box>
            </>
          )}
        </Box>

        {context.recorderState.state !== "recording" && data.audioBlobs && (
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
