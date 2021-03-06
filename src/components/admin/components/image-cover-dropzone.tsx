import { useSignedDokaImageUploadDropZone } from "@/hooks/useSignedUploadDropZone";
import { Box, CircularProgress, Grow, IconButton, Typography, useTheme } from "@material-ui/core";
import IconDelete from "@material-ui/icons/DeleteOutline";
import ImageIcon from "@material-ui/icons/Image";
import { makeStyles } from "@material-ui/styles";
import { MouseEvent } from "react";
import { ImageCoverLayout } from "../layout/image-cover-layout";

const useStyles = makeStyles(() => ({
  dropZoneRoot: {
    display: "inline-block",
    transition: "transform 300ms",
    "&:focus": {
      outline: "none",
      transform: "scale(0.9)",
    },
  },
}));

export const ImageCoverDropZone = ({
  onSuccess,
  onDelete,
}: {
  onSuccess: (downloadUrl: string) => void;
  onDelete: () => void;
}) => {
  const classes = useStyles();
  const theme = useTheme();
  const dropZone = useSignedDokaImageUploadDropZone({
    onSuccess,
  });

  const _onDelete = () => {
    dropZone.reset();
    onDelete();
  };

  const hasImage = !!dropZone.downloadUrl;

  return (
    <div {...dropZone.getRootProps()} className={classes.dropZoneRoot}>
      <input {...dropZone.getInputProps()} />

      <ImageCoverLayout
        style={{
          width: 240,
          height: 240,
          transition: "transform 1000ms",
          transform: !hasImage ? "rotate(0deg)" : "rotate(-2deg)",
          // opacity: dropZone.uploading ? 0.7 : 1.0,
        }}
        imageUrl={dropZone.downloadUrl}
        centeredChildren={
          <Grow in={!hasImage}>
            <Box>
              {/* Idle state: show placeholder */}
              {!hasImage && !dropZone.uploading && (
                <Box pb={1}>
                  <ImageIcon fontSize="large" />
                  <Typography variant="subtitle2">Selecteer plaatje</Typography>
                </Box>
              )}

              {/* Uploading state: show loader */}
              {dropZone.uploading && (
                <>
                  {[undefined, 0, 100].includes(
                    dropZone.uploadPercentCompleted
                  ) ? (
                      <CircularProgress
                        key="indeterminate"
                        variant="indeterminate"
                      />
                    ) : (
                      <CircularProgress
                        key="determinate"
                        value={dropZone.uploadPercentCompleted}
                        variant="determinate"
                      />
                    )}
                </>
              )}

              {/* Error state: show error */}
              {dropZone.uploadError && (
                <Box pb={1}>
                  <Typography variant="subtitle2" color="error">
                    Er ging iets mis bij het uploaden, probeer het nogmaals
                  </Typography>
                </Box>
              )}
            </Box>
          </Grow>
        }
        bottomRightAction={
          <Grow in={hasImage}>
            <div>
              {/* Show delete button when there's an image */}
              <IconButton
                style={{
                  background: theme.palette.action.selected,
                  color: theme.palette.getContrastText(
                    theme.palette.action.selected
                  ),
                }}
                onClick={(event: MouseEvent<HTMLElement>) => {
                  event.preventDefault();
                  event.stopPropagation();
                  _onDelete();
                }}
              >
                <IconDelete fontSize="small" />
              </IconButton>
            </div>
          </Grow>
        }
      />
    </div>
  );
};
