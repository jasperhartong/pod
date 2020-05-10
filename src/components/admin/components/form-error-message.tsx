import { ReactNode } from "react";
import { Typography } from "@material-ui/core";

export const FormErrorMessageTypography = ({
  children,
}: {
  children?: ReactNode;
}) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);
