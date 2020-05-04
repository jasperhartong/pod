import { useState } from "react";
import useAudioRecorder from "../src/hooks/useAudioRecorder";
import { Button, Container, Box } from "@material-ui/core";
import { AudioRecorderVisualizer } from "../src/components/audio-recorder-hook/audio-recorder-visualizer";
import { formatBytes } from "../src/utils/audio-context";
import { Duration } from "luxon";

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
      {[
        startListening,
        stopListening,
        startRecording,
        stopRecording,
        clearData,
      ].map((method) => (
        <li key={method.name}>
          <Button key={method.name} onClick={() => method()} variant="outlined">
            {method.name}
          </Button>
        </li>
      ))}
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
