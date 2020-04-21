import { useState, useEffect } from "react";
import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { Box, Container, makeStyles, LinearProgress } from "@material-ui/core";
import { ReactNode } from "react";
import { useRouter } from "next/dist/client/router";

const useRouterTransition = () => {
  const router = useRouter();
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  useEffect(() => {
    router.events.on("routeChangeStart", () => setIsTransitioning(true));
    router.events.on("routeChangeComplete", () => setIsTransitioning(false));
  }, []);

  return { isTransitioning };
};

const useStyles = makeStyles((theme) => ({
  rootContainer: {
    backgroundImage: "url(/background.png)",
    backgroundRepeat: "no-repeat",
    backgroundPositionX: "right",
    backgroundPositionY: -400,
    minHeight: 500,
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
      style={{ transition: "all 500ms", width: "auto" }}
    >
      {isTransitioning && (
        <Box position="absolute" top={0} left={0} right={0}>
          <LinearProgress variant="indeterminate" />
        </Box>
      )}
      {children}
    </Container>
  );
};

export default AppContainer;
