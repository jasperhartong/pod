import { useRef, useEffect } from "react";
import { makeStyles, Paper } from "@material-ui/core";

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
    paddingTop: "25%",
  },
  frequencyBand: {
    minWidth: 4,
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
        element.style.backgroundColor = `rgb(0, 255, ${amplitudeValue})`;
        element.style.height = `${amplitudeValue}px`;
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
          />
        ))}
      </div>
    </div>
  );
};
