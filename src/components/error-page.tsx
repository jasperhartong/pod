import { Box, Divider, Typography } from "@material-ui/core";
import AppContainer from "./app-container";

export const ErrorPage = ({ error }: { error?: string }) => (
  <AppContainer>
    <Box textAlign="center" pt={8}>
      <Typography variant="overline" color="textSecondary">
        Error
      </Typography>
      <Divider />
      <Typography
        variant="overline"
        color="textSecondary"
        style={{ opacity: 0.2 }}
      >
        {error || "unknown error"}
      </Typography>
    </Box>
  </AppContainer>
);
