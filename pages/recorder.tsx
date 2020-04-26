import { useState } from "react";
import useAudioRecorder from "../src/hooks/useAudioRecorder";
import { Button, Container } from "@material-ui/core";
import { AudioRecorderVisualizer } from "../src/components/audio-recorder-hook/audio-recorder-visualizer";
import FilePlayer from "react-player/lib/players/FilePlayer";
import { formatBytes } from "../src/utils/audio-context";

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
        showMp3,
      ].map((method) => (
        <Button key={method.name} onClick={() => method()}>
          {method.name}
        </Button>
      ))}
      {dataType && <div>Recording in {dataType}</div>}
      {dataSize && <div>Recorded {formatBytes(dataSize)}</div>}
      {dataSeconds && <div>Recorded {dataSeconds} seconds</div>}
      {isRecording && (
        <AudioRecorderVisualizer
          uniqueId="test"
          getFrequencyData={getFrequencyData}
        />
      )}
      {/* {blobs.map((blob, index) => (
        <audio key={index} src={URL.createObjectURL(blob)} controls></audio>
      ))} */}

      {blob && <audio src={URL.createObjectURL(blob)} controls></audio>}

      {/* <>
        <FilePlayer
          playing={playing}
          url={[
            "https://tapesme.s3.eu-central-1.amazonaws.com/08af0843-20e8-445a-a8cc-6e70d70da163.mp4",
            "https://tapesme.s3.eu-central-1.amazonaws.com/46de95ba-5b4f-4b13-a5a0-bc4eb7afa79e.mp4",
          ]}
        />
        <Button onClick={() => setPlaying(!playing)}>toggle playing</Button>
      </> */}
    </Container>
  );
};

export default Recorder;
