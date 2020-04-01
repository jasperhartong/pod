import { SwipeableDrawer } from "@material-ui/core";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";

const useStyles = makeStyles((theme: Theme) => ({
  drawerPaper: {
    maxWidth: 360,
    margin: "auto"
  }
}));

interface Props {
  children: JSX.Element;
  open: boolean;
  onClose(): void;
}

export const BottomDrawer = (props: Props) => {
  const classes = useStyles();
  return (
    <SwipeableDrawer
      disableDiscovery={true}
      anchor="bottom"
      open={props.open}
      onClose={props.onClose}
      onOpen={() => {}}
      PaperProps={{ classes: { root: classes.drawerPaper } }}
    >
      {props.children}
    </SwipeableDrawer>
  );
};

export default BottomDrawer;
