import { useRef, useEffect } from "react";
import { makeStyles, Paper } from "@material-ui/core";
import { AppColors } from "../theme";

interface Props {
  uniqueId: string;
  getFrequencyData: (
    callback: (audioByteFrequencyData: Uint8Array) => void
  ) => void;
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

export const AudioVisualizer = (props: Props) => {
  const amplitudeValuesRef = useRef<Uint8Array | null>(null);
  const requestRef = useRef<number>(0);

  // TODO: How to decide on frequence bands?
  const frequencyBandArrayRef = useRef<number[]>(Array.from(Array(25).keys()));
  const classes = useStyles();

  const animationCallback = (newAmplitudeData: Uint8Array) => {
    amplitudeValuesRef.current = newAmplitudeData;
    let domElements = frequencyBandArrayRef.current.map((num) =>
      document.getElementById(`${props.uniqueId}${num}`)
    );
    frequencyBandArrayRef.current.forEach((num) => {
      const element = domElements[num];
      const amplitudeValue = amplitudeValuesRef.current
        ? amplitudeValuesRef.current[num]
        : null;
      if (element && amplitudeValue) {
        element.style.height = `${amplitudeValue}px`;
        element.style.opacity = `${(amplitudeValue / 1000) * 3}`;
      }
    });
  };

  const animateSpectrum = () => {
    props.getFrequencyData(animationCallback);
    requestRef.current = requestAnimationFrame(animateSpectrum);
  };

  useEffect(() => {
    // Start animation loop on mount
    requestRef.current = requestAnimationFrame(animateSpectrum);
    // Stop animation loop on unmount
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  return (
    <div>
      <div className={classes.flexContainer}>
        {frequencyBandArrayRef.current.map((num) => (
          <Paper
            className={classes.frequencyBand}
            elevation={4}
            id={`${props.uniqueId}${num}`}
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
