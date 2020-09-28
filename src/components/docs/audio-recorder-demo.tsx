import useAudioRecorder from "@/hooks/useAudioRecorder";
import { Paper } from "@material-ui/core";
import { Duration } from "luxon";
import { AudioRecorderButton } from "../audio-recorder-hook/audio-recorder-button";
import { AudioRecorderVisualizer } from "../audio-recorder-hook/audio-recorder-visualizer";

export const AudioRecorderDemo = () => {
    const {
        isRecording,
        isRequestingAccess,
        startRecording,
        stopRecording,
        stopListening,
        dataBlobs,
        dataSeconds,
        clearData,
        getFrequencyData
    } = useAudioRecorder();
    return (
        <Paper elevation={0} variant="outlined">
            <div style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                padding: 32
            }}>
                <AudioRecorderButton
                    onStartRecording={() => { startRecording() }}
                    // also stop listening for the demo (no red icon)
                    onStopRecording={() => { stopRecording(); stopListening(); }}
                    isRecording={isRecording}
                    isRequestingAccess={isRequestingAccess}
                />
                <div style={{ margin: 16 }}>
                    {Duration.fromObject({
                        seconds: dataSeconds,
                    }).toFormat("mm:ss")}
                </div>
                {dataBlobs.length === 0 && !isRecording && (<code>Yes, you can press that button 👆</code>)}
                {isRecording && <>
                    <AudioRecorderVisualizer getFrequencyData={getFrequencyData} />
                    <p>Make some noise now! 😁</p>
                </>
                }
                {dataBlobs.map((dataBlob, i) => (<audio key={`${i}`} src={URL.createObjectURL(dataBlob)} controls></audio>))}
                {dataBlobs.length > 0 && (<button onClick={clearData}>Clear recording</button>)}
            </div>
        </Paper>
    )
}