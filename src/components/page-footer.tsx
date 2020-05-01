import { Box, Typography } from "@material-ui/core";
import SurroundSound from "@material-ui/icons/SurroundSound";

const PageFooter = ({ secondaryText }: { secondaryText?: string }) => (
  <Box p={4} textAlign="center">
    <SurroundSound fontSize="large" color="disabled" />
    <Typography
      component="div"
      variant="overline"
      style={{ lineHeight: "110%" }}
    >
      Tapes.me ©2020
    </Typography>
    <Typography component="div" variant="overline" color="textSecondary">
      {secondaryText || ""}
    </Typography>
  </Box>
);

export default PageFooter;
