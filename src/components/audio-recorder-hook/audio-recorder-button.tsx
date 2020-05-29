import { ButtonBase, makeStyles } from "@material-ui/core";
import { useCallback } from "react";
import { AppColors } from "src/theme";

const useStyles = makeStyles((theme) => {
  const buttonSize = 56; // hard-coded size like Fab

  return {
    outerRing: {
      position: "relative",
      height: buttonSize,
      width: buttonSize,
      minHeight: buttonSize,
      minWidth: buttonSize,
      borderColor: theme.palette.text.primary,
      borderStyle: "solid",
      borderWidth: 2,
      borderRadius: "100%",
      transition: `all`,
      transitionDuration: `${theme.transitions.duration.short}ms`,
      transitionTimingFunction: theme.transitions.easing.easeOut,
    },
    innerRing: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: AppColors.RED,
      transformOrigin: "center",
      transition: `all`,
      transitionDuration: `${theme.transitions.duration.short}ms`,
      transitionTimingFunction: theme.transitions.easing.easeOut,
    },
    idle: {
      "& $innerRing": {
        borderRadius: buttonSize,
        transform: "scale(0.85)",
      },
    },
    requestingAccess: {
      opacity: 0.85,
      "& $innerRing": {
        borderRadius: buttonSize,
        transform: "scale(0.75)",
        opacity: 0.4,
      },
    },
    recording: {
      "& $innerRing": {
        borderRadius: 8,
        transform: "scale(0.42)",
      },
    },
  };
});

interface Props {
  isRecording: boolean;
  isRequestingAccess: boolean;
  onStartRecording: () => void;
  onStopRecording: () => void;
}

export const AudioRecorderButton = ({
  isRecording,
  isRequestingAccess,
  onStartRecording,
  onStopRecording,
}: Props) => {
  const classes = useStyles();

  const handleClick = useCallback(() => {
    isRecording ? onStopRecording() : onStartRecording();
  }, [isRecording]);

  let ringStateClass = classes.idle;
  if (isRequestingAccess) {
    ringStateClass = classes.requestingAccess;
  } else if (isRecording) {
    ringStateClass = classes.recording;
  }

  return (
    <ButtonBase
      centerRipple={true}
      focusRipple={true}
      className={`${classes.outerRing} ${ringStateClass}`}
      onClick={handleClick}
    >
      <div className={classes.innerRing}></div>
    </ButtonBase>
  );
};
