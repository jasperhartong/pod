import Link from "next/link";
import { IconButton } from "@material-ui/core";
import CloseIcon from "@material-ui/icons/Close";
import { IRoom } from "../../../app-schema/IRoom";

const AdminHeaderCloseToOverview = ({
  roomSlug,
}: {
  roomSlug: IRoom["slug"];
}) => (
  <Link href={`/rooms/[roomSlug]/admin`} as={`/rooms/${roomSlug}/admin`}>
    <IconButton>
      <CloseIcon />
    </IconButton>
  </Link>
);

export default AdminHeaderCloseToOverview;
