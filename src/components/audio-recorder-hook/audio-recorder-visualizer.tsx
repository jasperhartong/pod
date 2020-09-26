import { makeStyles } from "@material-ui/core";
import { CSSProperties } from "@material-ui/styles";
import { useEffect, useRef, useState } from "react";
import { useUID } from 'react-uid';
import themeOptionsProvider from "src/theme";

/* 
  For usage with useAudioRecorder
 */

const magicHeightAmplification = 1.4;
const magicOpacityAmplification = 2;
const magicSkipTopSpectrumPercentage = 0.35; // drops top part of amplitude spectrum (not used in voice)

interface Props {
  getFrequencyData: (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => void;
  bandCount?: number;
  height?: CSSProperties["height"];
  width?: number; // For now only number, as we want to divide it to be able to calculate bandwidth
  color?: CSSProperties["color"];
}

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    alignItems: "center",
  },
  frequencyBand: {
    transition: "all 50ms ease-in-out"
  }
}));

const defaultBandCount = 32;
const defaultHeight = 240;
const defaultWidth = 240;
const defaultColor = themeOptionsProvider.theme.palette.error.main;

export const AudioRecorderVisualizer = ({
  getFrequencyData,
  bandCount = defaultBandCount,
  height = defaultHeight,
  width = defaultWidth,
  color = defaultColor,
}: Props) => {
  const uniqueId = useUID();
  const classes = useStyles();
  const [didMount, setDidMount] = useState<boolean>(false);
  const animationFrameRef = useRef<number>(0);
  const domElementsRef = useRef<(HTMLElement | null)[]>([null]);
  const frequencyBandArrayRef = useRef<number[]>(
    Array.from(Array(bandCount).keys())
  );

  const animationCallback = (newAmplitudeData: Uint8Array) => {
    frequencyBandArrayRef.current.forEach((bandIndex) => {
      const element = domElementsRef.current[bandIndex];
      // Distribute the displayed amplitudeValues accross the whole set of returned amplitudevalues
      // Would've been even better to actually get the averages per set of covered amplitudeValues, laterrr
      const amplitudeValue =
        newAmplitudeData[
        Math.floor(
          ((newAmplitudeData.length * (1 - magicSkipTopSpectrumPercentage)) /
            frequencyBandArrayRef.current.length) *
          bandIndex
        )
        ];

      if (element && amplitudeValue !== undefined) {
        // Clamp height to 100%
        element.style.height = `${Math.min(
          100,
          (amplitudeValue / 256) * 100 * magicHeightAmplification
        )}%`;
        // opacity needs no clamping.
        element.style.opacity = `${
          (amplitudeValue / 256) * magicOpacityAmplification
          }`;
      }
    });
  };

  const animateSpectrum = () => {
    getFrequencyData(animationCallback);
    animationFrameRef.current = requestAnimationFrame(animateSpectrum);
  };

  /* Orchestrated mounting:
    0. Track mounted state
    1. Don't render anything server side
    2. Generate uniqueId on client side
    3. Render the frequency band divs with the unique id
    4. Set up `domElementsRef` towards just created divs
    5. Start animation that uses this list in domElementsRef
    */
  useEffect(() => {
    setDidMount(true);
  }, [])

  useEffect(() => {
    domElementsRef.current = frequencyBandArrayRef.current.map((num) =>
      document.getElementById(`audio-visualizer-${uniqueId}${num}`)
    );
    // Start animation loop on mount
    animationFrameRef.current = requestAnimationFrame(animateSpectrum);
    // Stop animation loop on unmount
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, [didMount]);


  if (!didMount) {
    return null;
  }

  return (
    <div>
      <div className={classes.flexContainer} style={{ height, width }}>
        {frequencyBandArrayRef.current.map((num) => (
          <div
            id={`audio-visualizer-${uniqueId}${num}`}
            key={num}
            className={classes.frequencyBand}
            style={{
              backgroundColor: color,
              minWidth: width / bandCount,
            }}
          />
        ))}
      </div>
    </div>
  );
};
