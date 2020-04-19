import { Breakpoint } from "@material-ui/core/styles/createBreakpoints";
import { Container, makeStyles } from "@material-ui/core";
import { ReactNode } from "react";

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
  const classes = useStyles();

  return (
    <Container
      className={classes.rootContainer}
      maxWidth={maxWidth || "lg"}
      style={{ transition: "all 500ms", width: "auto" }}
    >
      {children}
    </Container>
  );
};

export default AppContainer;
