import { AudioRecorderButton } from "@/components/audio-recorder-hook/audio-recorder-button";
import { useEffect, useState } from "react";

export const LoopingAudioRecorderButton = ({ states = ["idle", "requestingAccess", "idle", "recording"] }) => {
    const [currentStates, setStates] = useState(states);

    useEffect(() => {
        const interval = setInterval(() => {
            // rotate
            setStates(currentStates => [...currentStates.slice(1), ...currentStates.slice(0, 1)]);
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const current = currentStates[0]
    const props = {
        onStartRecording: () => { },
        onStopRecording: () => { },
        isRecording: current === `recording`,
        isRequestingAccess: current === `requestingAccess`
    }
    return <div style={{ display: "flex", alignItems: "center", flexDirection: "column", padding: 32 }}>
        <AudioRecorderButton {...props} />
        <code style={{ marginTop: 16 }}>{current}</code>
    </div>
}
