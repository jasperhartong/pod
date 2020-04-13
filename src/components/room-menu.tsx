import { useState, MouseEvent } from "react";
import Menu from "@material-ui/core/Menu";
import MenuItem from "@material-ui/core/MenuItem";
import { IconButton } from "@material-ui/core";
import RecordIcon from "@material-ui/icons/Mic";
import ListenIcon from "@material-ui/icons/Headset";
import { makeStyles } from "@material-ui/styles";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import { useRoomContext, RoomMode } from "../hooks/useRoomContext";

const useStyles = makeStyles((theme: Theme) => ({
  iconButton: {
    opacity: 0.8,
    border: `2px solid ${theme.palette.text.secondary}`,
    marginRight: 1,
  },
}));

const RoomMenu = () => {
  const { state, actions } = useRoomContext();
  const classes = useStyles();
  const [anchorEl, setAnchorEl] = useState<Element | null>(null);

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget as Element);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };
  const handleModeChange = (mode: RoomMode) => {
    setAnchorEl(null);
    actions.mode.change(mode);
  };

  return (
    <div>
      <IconButton
        className={classes.iconButton}
        aria-controls="room-menu"
        aria-haspopup="true"
        onClick={handleClick}
      >
        {state.mode === "listen" && <ListenIcon />}
        {state.mode === "record" && <RecordIcon />}
      </IconButton>

      <Menu
        id="room-menu"
        anchorEl={anchorEl}
        keepMounted
        open={Boolean(anchorEl)}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 0,
          horizontal: 0,
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem
          onClick={() => handleModeChange("listen")}
          disabled={state.mode === "listen"}
        >
          <ListenIcon fontSize="inherit" style={{ marginRight: 4 }} /> Luisteren
        </MenuItem>
        <MenuItem
          onClick={() => handleModeChange("record")}
          disabled={state.mode === "record"}
        >
          <RecordIcon fontSize="inherit" style={{ marginRight: 4 }} /> Opnemen
        </MenuItem>
      </Menu>
    </div>
  );
};

export default RoomMenu;
