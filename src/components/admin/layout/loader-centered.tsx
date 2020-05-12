import { Box, CircularProgress } from "@material-ui/core";

export const LoaderCentered = () => (
  <Box position="absolute" left="50%" top="50%" mt={-2} ml={-2}>
    <CircularProgress variant="indeterminate" />
  </Box>
);
