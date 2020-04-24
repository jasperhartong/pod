import { ReactNode } from "react";
import { Typography, Box, IconButton } from "@material-ui/core";

export interface AdminHeaderProps {
  title: string;
  subtitle: string;
  leftAction?: ReactNode;
}

const AdminHeader = (props: AdminHeaderProps) => (
  <Box pt={2} pb={2} textAlign="center" position="relative">
    <Typography component="div" variant="h6">
      {props.title}
    </Typography>
    <Typography component="div" variant="overline">
      {props.subtitle}
    </Typography>
    {props.leftAction && (
      <Box position="absolute" top={24} left={16}>
        {props.leftAction}
      </Box>
    )}
  </Box>
);

export default AdminHeader;
