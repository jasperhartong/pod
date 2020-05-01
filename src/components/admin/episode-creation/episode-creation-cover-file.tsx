import { ReactNode, MouseEvent } from "react";
import {
  Box,
  makeStyles,
  Grid,
  Typography,
  IconButton,
  Grow,
  CircularProgress,
} from "@material-ui/core";
import { Theme } from "@material-ui/core/styles/createMuiTheme";
import ImageIcon from "@material-ui/icons/Image";
import IconDelete from "@material-ui/icons/Delete";
import { CSSProperties } from "@material-ui/styles";
import themeOptionsProvider from "../../../theme";

const useStyles = makeStyles((theme: Theme) => ({
  image: {
    position: "relative",
    width: 300,
    height: 300,
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

const EpisodeCoverLayout = ({
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

export const EpisodeCoverInDropZone = ({
  imageUrl,
  isUploading,
  uploadPercentCompleted,
  onDelete,
}: {
  imageUrl?: string;
  isUploading: boolean;
  uploadPercentCompleted?: number;
  onDelete: () => void;
}) => {
  return (
    <EpisodeCoverLayout
      style={{ width: 240, height: 240 }}
      imageUrl={imageUrl}
      centeredChildren={
        <Grow in={!imageUrl}>
          <Box>
            {isUploading ? (
              <CircularProgress
                value={uploadPercentCompleted}
                variant={
                  [undefined, 0, 100].includes(uploadPercentCompleted)
                    ? "indeterminate"
                    : "determinate"
                }
              />
            ) : (
              <Box pb={1}>
                <ImageIcon fontSize="large" />
                <Typography variant="subtitle2">Selecteer plaatje</Typography>
              </Box>
            )}
          </Box>
        </Grow>
      }
      bottomRightAction={
        <Grow in={!!imageUrl}>
          <IconButton
            color="secondary"
            style={{
              background: themeOptionsProvider.theme.palette.action.selected,
            }}
            onClick={(event: MouseEvent<HTMLElement>) => {
              event.preventDefault();
              event.stopPropagation();
              onDelete();
            }}
          >
            <IconDelete fontSize="small" />
          </IconButton>
        </Grow>
      }
    />
  );
};
