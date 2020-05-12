import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import Link from "next/link";

export const AdminHeaderClose = ({ url, as }: { url: string; as: string }) => (
  <Link href={url} as={as}>
    <IconButton>
      <CloseIcon />
    </IconButton>
  </Link>
);
