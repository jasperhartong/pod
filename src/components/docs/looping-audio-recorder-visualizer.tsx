import { useScrollPosition } from '@n8tb1t/use-scroll-position';
import { useEffect, useRef, useState } from "react";
import { AudioRecorderVisualizer } from "../audio-recorder-hook/audio-recorder-visualizer";

const REFRESH_RATE = 32; //ms
const BAND_COUNT = 50;
const MAX_AMPLITUDE = 160;
const MAX_AMPLITUDE_CHANGE = 8;

const randomAmplitudeArray = (length = BAND_COUNT, max = MAX_AMPLITUDE) =>
    new Uint8Array(Array.from({ length }, () => Math.floor(Math.random() * max)));

const changedAmplitudeArray = (array: Uint8Array, min = 0, max = MAX_AMPLITUDE, maxChange = MAX_AMPLITUDE_CHANGE) =>
    array.map(x => {
        const newX = x + Math.floor(Math.random() * maxChange) - Math.floor(Math.random() * maxChange);
        const clampedX = Math.min(Math.max(newX, min), max);
        return clampedX;
    });


const hslString = (h: number) => `hsla(${h}, 100%, 25%)`;

export const LoopingAudioRecorderVisualizer = () => {
    const amplitudeArray = useRef<Uint8Array>(randomAmplitudeArray())
    const [color, setColor] = useState<string>(hslString(0))

    useEffect(() => {
        const interval = setInterval(() => {
            amplitudeArray.current = changedAmplitudeArray(amplitudeArray.current);
        }, REFRESH_RATE);
        return () => clearInterval(interval);
    }, []);

    useScrollPosition(({ currPos }) => {
        setColor(_ => hslString(currPos.y / 2))
    }, [])

    const getFrequencyData = (callback: (audioByteFrequencyData: Uint8Array) => void) => {
        return callback(amplitudeArray.current);
    }

    return (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", padding: 16 }}>
            <AudioRecorderVisualizer
                uniqueId="demo"
                getFrequencyData={getFrequencyData}
                color={color}
            />
            <code style={{ marginTop: 16 }}>Random noise</code>
        </div>
    );
}