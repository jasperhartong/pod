import { useRef, useEffect } from "react";
import { makeStyles, Paper } from "@material-ui/core";
import { AppColors } from "../../theme";

/* 
  For usage with useAudioRecorder
 */

interface Props {
  uniqueId: string;
  getFrequencyData: (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => void;
  bandCount?: number;
}

const useStyles = makeStyles((theme) => ({
  flexContainer: {
    display: "flex",
    flexWrap: "wrap",
    justifyContent: "center",
    height: 0,
  },
  frequencyBand: {
    minWidth: 6,
  },
}));

const defaultBandCount = 32;

export const AudioRecorderVisualizer = (props: Props) => {
  const animationFrameRef = useRef<number>(0);
  const domElementsRef = useRef<(HTMLElement | null)[]>([null]);
  const frequencyBandArrayRef = useRef<number[]>(
    Array.from(Array(props.bandCount || defaultBandCount).keys())
  );

  const classes = useStyles();

  const animationCallback = (newAmplitudeData: Uint8Array) => {
    frequencyBandArrayRef.current.forEach((bandIndex) => {
      const element = domElementsRef.current[bandIndex];
      // Distribute the displayed bands accross the returned amplitudevalues
      const amplitudeValue =
        newAmplitudeData[
          Math.floor(
            (newAmplitudeData.length / frequencyBandArrayRef.current.length) *
              bandIndex
          )
        ];

      if (element && amplitudeValue !== undefined) {
        element.style.height = `${amplitudeValue}px`;
        element.style.opacity = `${(amplitudeValue / 1000) * 3}`;
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
      <div className={classes.flexContainer}>
        {frequencyBandArrayRef.current.map((num) => (
          <Paper
            className={classes.frequencyBand}
            elevation={4}
            id={`audio-visualizer-${props.uniqueId}${num}`}
            key={num}
            style={{
              backgroundColor: AppColors.RED,
            }}
          />
        ))}
      </div>
    </div>
  );
};
