import { Button, Typography } from "@material-ui/core";
import themeOptionsProvider, { AppColors } from "../../theme";
import RecordIcon from "@material-ui/icons/Mic";

/* 
  For usage with useAudioRecorder
 */

interface Props {
  isListening: boolean;
  isRecording: boolean;
  error?: Error;
  startListening: () => void;
  startRecording: () => void;
  stopRecording: () => void;
  fullWidth?: boolean;
}

const AudioRecorderButton = ({
  isListening,
  isRecording,
  error,
  startListening,
  startRecording,
  stopRecording,
  fullWidth,
}: Props) => {
  return (
    <>
      {!isListening && (
        <Button onClick={startListening} variant="outlined">
          Geef toegang tot microfoon
        </Button>
      )}
      {error && (
        <Typography color={"error"}>
          Oeps er ging iets mis. Heb je wel toegang gegeven? Probeer het anders
          in een andere browsers
        </Typography>
      )}

      {(isListening || isRecording) && (
        <>
          <Button
            variant="contained"
            color="secondary"
            fullWidth={fullWidth}
            style={{
              color: isRecording
                ? AppColors.RED
                : themeOptionsProvider.theme.palette.secondary.contrastText,
            }}
            onClick={isRecording ? stopRecording : () => startRecording()}
          >
            <RecordIcon
              style={{
                paddingRight: 4,
                color: AppColors.RED,
              }}
            />{" "}
            {isRecording ? "Stop met opnemen" : "Start met opnemen"}
          </Button>
        </>
      )}
    </>
  );
};

export default AudioRecorderButton;
