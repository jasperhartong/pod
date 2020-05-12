import { useRouter } from "@/hooks/useRouter";
import {
  Box,
  Container,
  Fade,
  LinearProgress,
  makeStyles,
} from "@material-ui/core";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { ReactNode, useEffect, useRef, useState } from "react";

const useRouterTransition = () => {
  const router = useRouter();
  const isMountedRef = useRef<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  const handleStart = () => {
    isMountedRef.current && setIsTransitioning(true);
  };
  const handleComplete = () => {
    isMountedRef.current && setIsTransitioning(false);
  };

  useEffect(() => {
    console.debug("useRouterTransition:: setup");
    isMountedRef.current = true;
    router.events.on("routeChangeStart", handleStart);
    router.events.on("routeChangeComplete", () => handleComplete);
    return () => {
      console.debug("useRouterTransition:: cleanup");
      isMountedRef.current = false;
      router.events.off("routeChangeStart", handleStart);
      router.events.off("routeChangeComplete", () => handleComplete);
    };
  }, []);

  return { isTransitioning };
};

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    // backgroundImage: "url(/background.png)",
    // backgroundRepeat: "no-repeat",
    // backgroundPositionX: "right",
    // backgroundPositionY: -400,
    // minHeight: 500,
  },
}));

const AppContainer = ({
  children,
  maxWidth,
}: {
  children: ReactNode;
  maxWidth?: Breakpoint;
}) => {
  const { isTransitioning } = useRouterTransition();
  const classes = useStyles();

  return (
    <Container
      className={classes.rootContainer}
      maxWidth={maxWidth || "lg"}
      style={{ transition: "all 500ms", width: "auto", padding: 0 }}
    >
      {isTransitioning && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress variant="indeterminate" />
        </Box>
      )}
      <Fade in={!isTransitioning} timeout={400}>
        <div>{children}</div>
      </Fade>
    </Container>
  );
};

export default AppContainer;
