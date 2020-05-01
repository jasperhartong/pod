import { ReactNode } from "react";
import { Box, makeStyles, Grid } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { CSSProperties } from "@material-ui/styles";

const useStyles = makeStyles((theme: Theme) => ({
  image: {
    position: "relative",
    width: 300,
    height: 300,
    overflow: "hidden",
    backgroundSize: "cover",
    backgroundColor: theme.palette.background.paper,
    color: theme.palette.text.secondary,
    boxShadow: theme.shadows[8],
    textAlign: "center",
  },
  bottomRightAction: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

interface EpisodeCoverLayoutProps {
  style?: CSSProperties;
  imageUrl?: string;
  centeredChildren?: ReactNode;
  bottomRightAction?: ReactNode;
}

export const EpisodeCoverLayout = ({
  style,
  imageUrl,
  centeredChildren,
  bottomRightAction,
}: EpisodeCoverLayoutProps) => {
  const classes = useStyles();
  const rootStyle = {
    ...(style || {}),
    ...(imageUrl ? { backgroundImage: `url("${imageUrl}")` } : {}),
  };

  return (
    <Box className={classes.image} style={rootStyle}>
      {centeredChildren && (
        <Grid
          container
          justify="center"
          direction="column"
          style={{ height: "100%" }}
        >
          <Grid item>{centeredChildren}</Grid>
        </Grid>
      )}
      {bottomRightAction && (
        <Box className={classes.bottomRightAction}>{bottomRightAction}</Box>
      )}
    </Box>
  );
};
