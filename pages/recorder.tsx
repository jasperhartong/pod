import { useState } from "react";
import useAudioRecorder from "../src/hooks/useAudioRecorder";
import { Button, Container, Box } from "@material-ui/core";
import { AudioRecorderVisualizer } from "../src/components/audio-recorder-hook/audio-recorder-visualizer";
import FilePlayer from "react-player/lib/players/FilePlayer";
import { formatBytes } from "../src/utils/audio-context";
import { Duration } from "luxon";

const Recorder = () => {
  const {
    isListening,
    isRecording,
    startListening,
    stopListening,
    startRecording,
    stopRecording,
    extractBlobs,
    getFrequencyData,
    dataType,
    dataSize,
    dataSeconds,
    clearData,
    error,
  } = useAudioRecorder();
  const [blob, setBlob] = useState<Blob>();
  const [playing, setPlaying] = useState<boolean>(false);

  const showMp3 = async () => {
    const b = await extractBlobs();
    console.debug(`showMp3:: ${b}`);
    if (b) {
      setBlob(b[0]);
    }
  };

  return (
    <Container>
      {[
        startListening,
        stopListening,
        startRecording,
        stopRecording,
        clearData,
        showMp3,
      ].map((method) => (
        <li key={method.name}>
          <Button key={method.name} onClick={() => method()} variant="outlined">
            {method.name}
          </Button>
        </li>
      ))}
      <Box p={4}>
        {!!dataType && <div>Recording in {dataType}</div>}
        {!!dataSize && <div>Recorded {formatBytes(dataSize)}</div>}

        <div>
          Recorded{" "}
          {Duration.fromObject({ seconds: dataSeconds }).toFormat("m:ss")}
        </div>
      </Box>

      {isRecording && (
        <AudioRecorderVisualizer
          uniqueId="test"
          getFrequencyData={getFrequencyData}
        />
      )}

      {blob && <audio src={URL.createObjectURL(blob)} controls></audio>}

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

export default Recorder;
