import { ReactNode } from "react";
import { Typography, Box, Avatar } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";

export interface AdminHeaderProps {
  image: string;
  title: string;
  subtitle: string;
  action?: ReactNode;
}

const useStyles = makeStyles((theme: Theme) => ({
  root: {
    position: "relative",
    height: 220,
  },
  image: {
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    zIndex: -1,
  },
  text: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: theme.spacing(2),
    background:
      "linear-gradient(to top, rgba(0,0,0,0.7) 0%, rgba(0,0,0,0.3) 70%, rgba(0,0,0,0) 100%)",
  },
  action: {
    position: "absolute",
    bottom: theme.spacing(2),
    right: theme.spacing(2),
  },
}));

const AdminHeader = (props: AdminHeaderProps) => {
  const classes = useStyles();

  return (
    <Box className={classes.root}>
      <Avatar
        className={classes.image}
        variant="square"
        alt={props.title}
        src={props.image}
      />
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
