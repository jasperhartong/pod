import Link from "next/link";
import { Typography, Box, IconButton } from "@material-ui/core";
import IconBack from "@material-ui/icons/ChevronLeft";

export interface AdminHeaderProps {
  title: string;
  subtitle: string;
  backLink?: {
    href: string;
    as: string;
  };
}

const AdminHeader = (props: AdminHeaderProps) => (
  <Box pt={2} pb={2} textAlign="center" position="relative">
    <Typography component="div" variant="h6">
      {props.title}
    </Typography>
    <Typography component="div" variant="overline">
      {props.subtitle}
    </Typography>
    {props.backLink && (
      <Box position="absolute" top={24} left={16}>
        <Link href={props.backLink.href} as={props.backLink.as}>
          <IconButton>
            <IconBack />
          </IconButton>
        </Link>
      </Box>
    )}
  </Box>
);

export default AdminHeader;
