import { useRef, useEffect } from "react";
import { makeStyles } from "@material-ui/core";
import { AppColors } from "../../theme";
import { CSSProperties } from "@material-ui/styles";

/* 
  For usage with useAudioRecorder
 */

interface Props {
  uniqueId: string;
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
}));

const defaultBandCount = 32;
const defaultHeight = 240;
const defaultWidth = 240;
const defaultColor = AppColors.RED;

export const AudioRecorderVisualizer = (props: Props) => {
  const bandCount = props.bandCount || defaultBandCount;
  const height = props.height || defaultHeight;
  const width = props.width || defaultWidth;
  const color = props.color || defaultColor;

  const animationFrameRef = useRef<number>(0);
  const domElementsRef = useRef<(HTMLElement | null)[]>([null]);
  const frequencyBandArrayRef = useRef<number[]>(
    Array.from(Array(bandCount).keys())
  );

  const classes = useStyles();

  const magicHeightAmplification = 1.5;
  const magicOpacityAmplification = 2;
  const animationCallback = (newAmplitudeData: Uint8Array) => {
    frequencyBandArrayRef.current.forEach((bandIndex) => {
      const element = domElementsRef.current[bandIndex];
      // Distribute the displayed amplitudeValues accross the whole set of returned amplitudevalues
      // Would've been even better to actually get the averages per set of covered amplitudeValues, laterrr
      const amplitudeValue =
        newAmplitudeData[
          Math.floor(
            (newAmplitudeData.length / frequencyBandArrayRef.current.length) *
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
    props.getFrequencyData(animationCallback);
    animationFrameRef.current = requestAnimationFrame(animateSpectrum);
  };

  useEffect(() => {
    domElementsRef.current = frequencyBandArrayRef.current.map((num) =>
      document.getElementById(`audio-visualizer-${props.uniqueId}${num}`)
    );
    // Start animation loop on mount
    animationFrameRef.current = requestAnimationFrame(animateSpectrum);
    // Stop animation loop on unmount
    return () => cancelAnimationFrame(animationFrameRef.current);
  }, []);

  return (
    <div>
      <div className={classes.flexContainer} style={{ height, width }}>
        {frequencyBandArrayRef.current.map((num) => (
          <div
            id={`audio-visualizer-${props.uniqueId}${num}`}
            key={num}
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
