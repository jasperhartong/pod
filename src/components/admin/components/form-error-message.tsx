import { Typography } from "@material-ui/core";
import { ReactNode } from "react";

export const FormErrorMessageTypography = ({
  children,
}: {
  children?: ReactNode;
}) => (
  <Typography variant="subtitle2" color="error">
    {children}
  </Typography>
);
