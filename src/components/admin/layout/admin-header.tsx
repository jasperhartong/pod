import { Box, Typography } from "@material-ui/core";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { makeStyles } from "@material-ui/styles";
import { ReactNode } from "react";

export interface AdminHeaderProps {
  title: string;
  subtitle: string;
  image?: string;
  blur?: number;
  action?: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    height: 160,
  },
  image: {
    height: "100%",
    width: "100%",
    position: "absolute",
    backgroundSize: "cover",
    backgroundPosition: "center",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  text: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    background:
      "linear-gradient(to bottom, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  action: {
    position: "absolute",
    top: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const AdminHeader = (props: AdminHeaderProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      {props.image && (
        <div
          className={classes.image}
          style={{
            backgroundImage: `url(${props.image})`,
            filter: props.blur ? `blur(${props.blur}px)` : "",
          }}
        />
      )}
      <Box className={classes.text}>
        <Typography component="div" variant="h6">
          {props.title}
        </Typography>
        <Typography component="div" variant="overline">
          {props.subtitle}
        </Typography>
      </Box>
      {props.action && <Box className={classes.action}>{props.action}</Box>}
    </Box>
  );
};

export default AdminHeader;
