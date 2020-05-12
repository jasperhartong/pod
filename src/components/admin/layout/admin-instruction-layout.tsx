import { Box, Grid, Typography } from "@material-ui/core";
import IconInfo from "@material-ui/icons/InfoOutlined";

export const AdminInstructionsLayout = ({
  items,
}: {
  items: { title: string; text: string }[];
}) => (
  <Box mt={2} mb={2}>
    {items.map((item, index) => (
      <Box mb={2} key={`${item.title}-${index}`}>
        <Grid container alignItems="center" alignContent="center" wrap="nowrap">
          <IconInfo fontSize="inherit" style={{ marginRight: 4 }} />
          <Typography variant="body2" color="textPrimary">
            {item.title}
          </Typography>
        </Grid>
        <Typography variant="body2" color="textSecondary">
          {item.text}
        </Typography>
      </Box>
    ))}
  </Box>
);
