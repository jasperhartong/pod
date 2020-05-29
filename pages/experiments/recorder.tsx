import { AudioRecorderButton } from "@/components/audio-recorder-hook/audio-recorder-button";
import { AudioRecorderVisualizer } from "@/components/audio-recorder-hook/audio-recorder-visualizer";
import useAudioRecorder from "@/hooks/useAudioRecorder";
import { formatBytes } from "@/utils/audio-context";
import { Box, Button, Container, Grid } from "@material-ui/core";
import { Duration } from "luxon";
import { useState } from "react";

const RecorderWrapper = () => {
  const [mounted, setMounted] = useState<boolean>(true);
  const remount = () => {
    setMounted(false);
    setTimeout(() => {
      setMounted(true);
    }, 1000);
  };

  return (
    <>
      <Box p={4}>
        <Button onClick={remount}>Remount</Button>
      </Box>
      {mounted ? <Recorder /> : <>Remounting</>}
    </>
  );
};

const Recorder = () => {
  const {
    isListening,
    isRecording,
    isRequestingAccess,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    getFrequencyData,
    dataBlobs,
    dataSize,
    dataSeconds,
    clearData,
    error,
  } = useAudioRecorder();
  const [blob, setBlob] = useState<Blob>();
  const [playing, setPlaying] = useState<boolean>(false);

  return (
    <Container>
      {[startListening, stopListening, clearData].map((method) => (
        <li key={method.name}>
          <Button key={method.name} onClick={() => method()} variant="outlined">
            {method.name}
          </Button>
        </li>
      ))}
      <Grid container alignItems="center" justify="space-around">
        <Grid item>
          <AudioRecorderButton
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            isRecording={isRecording}
            isRequestingAccess={isRequestingAccess}
          />
        </Grid>
      </Grid>
      <Box p={4}>
        {!!dataSize && <div>Recorded {formatBytes(dataSize)}</div>}

        <div>
          Recorded{" "}
          {Duration.fromObject({ seconds: dataSeconds }).toFormat("m:ss")}
        </div>
      </Box>

      {isListening && (
        <AudioRecorderVisualizer
          uniqueId="test"
          getFrequencyData={getFrequencyData}
          color="green"
          width={600}
          bandCount={8}
        />
      )}

      {dataBlobs.length === 1 && (
        <audio src={URL.createObjectURL(dataBlobs[0])} controls></audio>
      )}

      {/* {blob && (
        <>
          <FilePlayer playing={playing} url={URL.createObjectURL(blob)} />
          <Button onClick={() => setPlaying(!playing)}>
            {playing ? "pause" : "play"}
          </Button>
        </>
      )} */}
    </Container>
  );
};

export default RecorderWrapper;
