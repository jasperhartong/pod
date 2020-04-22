import useAudioRecorder from "../../hooks/useAudioRecorder";
import { Button, Typography, Fab } from "@material-ui/core";
import themeOptionsProvider, { AppColors } from "../../theme";
import RecordIcon from "@material-ui/icons/Mic";

/* 
  For usage with useAudioRecorder
 */

type AudioRecorderContext = ReturnType<typeof useAudioRecorder>["context"];

const defaultTimeSlice = 3000;

const AudioRecorderButton = ({
  context,
  timeSlice,
  fullWidth,
}: {
  context: AudioRecorderContext;
  timeSlice?: number;
  fullWidth?: boolean;
}) => {
  return (
    <>
      {["listen_error", "idle"].includes(context.recorderState.state) && (
        <Button onClick={context.startListening} variant="outlined">
          Geef toegang tot microfoon
        </Button>
      )}
      {["listen_error"].includes(context.recorderState.state) && (
        <Typography color={"error"}>
          Oeps er ging iets mis. Heb je wel toegang gegeven? Probeer het anders
          in een andere browsers
        </Typography>
      )}

      {["listening", "recording"].includes(context.recorderState.state) && (
        <>
          <Button
            variant="contained"
            color="secondary"
            fullWidth={fullWidth}
            style={{
              color:
                "recording" === context.recorderState.state
                  ? AppColors.RED
                  : themeOptionsProvider.theme.palette.secondary.contrastText,
            }}
            onClick={
              "recording" === context.recorderState.state
                ? context.stopRecording
                : () => context.startRecording(timeSlice || defaultTimeSlice)
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
          </Button>
        </>
      )}
    </>
  );
};

export default AudioRecorderButton;
