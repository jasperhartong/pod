import { ButtonBase, makeStyles } from "@material-ui/core";
import { useCallback } from "react";

const useStyles = makeStyles((theme) => {
  const buttonSize = 56; // hard-coded size like Fab
  // define several consts for more readable transitions
  const defaultTransition = theme.transitions.easing.easeOut;
  const shortDuration = `${theme.transitions.duration.short}ms`;
  const longDuration = `${theme.transitions.duration.complex}ms`;
  const withDelay = `${theme.transitions.duration.complex}ms`;
  const noDelay = `0ms`;

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
      transitionDuration: `${shortDuration}`,
      transitionTimingFunction: defaultTransition,
    },
    innerRing: {
      position: "absolute",
      width: "100%",
      height: "100%",
      backgroundColor: theme.palette.error.main,
      transformOrigin: "center",
      // When shrinking: first shrink with `transform`, then change border-radius
      transition: `opacity ${shortDuration} ${defaultTransition} ${noDelay},
        border-radius ${longDuration} ${defaultTransition} ${withDelay},
        transform ${shortDuration} ${defaultTransition} ${noDelay}`,
    },
    idle: {
      "& $innerRing": {
        borderRadius: buttonSize,
        transform: "scale(0.85)",
        // When growing: first change border-radius, then grow with `transform`
        transition: `opacity ${shortDuration} ${defaultTransition} ${noDelay},
          border-radius ${longDuration} ${defaultTransition} ${noDelay},
          transform ${shortDuration} ${defaultTransition} ${withDelay}`,
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
      disableTouchRipple={true}
      className={`${classes.outerRing} ${ringStateClass}`}
      onClick={handleClick}
    >
      <div className={classes.innerRing}></div>
    </ButtonBase>
  );
};
