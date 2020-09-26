import useAudioRecorder from "@/hooks/useAudioRecorder";
import { Duration } from "luxon";
import { AudioRecorderButton } from "../audio-recorder-hook/audio-recorder-button";
import { AudioRecorderVisualizer } from "../audio-recorder-hook/audio-recorder-visualizer";

export const AudioRecorderDemo = () => {
    const {
        isRecording,
        isRequestingAccess,
        startRecording,
        stopRecording,
        dataBlobs,
        dataSeconds,
        clearData,
        getFrequencyData
    } = useAudioRecorder();
    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 32 }}>
            <AudioRecorderButton
                onStartRecording={() => { clearData(); startRecording() }}
                onStopRecording={stopRecording}
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
                <AudioRecorderVisualizer
                    uniqueId="demo"
                    getFrequencyData={getFrequencyData}
                />
                <p>Make some noise now! 😁</p>
            </>
            }
            {dataBlobs.length === 1 && (<audio src={URL.createObjectURL(dataBlobs[0])} controls></audio>)}
            {dataBlobs.length === 1 && (<button onClick={clearData}>Clear recording</button>)}
        </div>
    )
}