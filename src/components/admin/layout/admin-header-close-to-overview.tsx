import Link from "next/link";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";

const AdminHeaderClose = ({ url, as }: { url: string; as: string }) => (
  <Link href={url} as={as}>
    <IconButton>
      <CloseIcon />
    </IconButton>
  </Link>
);

export default AdminHeaderClose;
