import { Box, Container } from "@material-ui/core";
import AppContainer from "../app-container";
import { useImmer } from "use-immer";
import { AdminOverview } from "./admin-overview";
import { IResponse } from "../../api/IResponse";
import { IRoom } from "../../app-schema/IRoom";
import { IPlaylist } from "../../app-schema/IPlaylist";
import { AdminPlaylistDetails } from "./admin-playlist-details";

interface IAdminState {
  room: IResponse<IRoom>;
  selectedPlayList?: IPlaylist["id"];
}

export interface AdminPageProps {
  state: IAdminState;
}

const useAdminPageState = (
  room: IResponse<IRoom>,
  playlistId?: IPlaylist["id"]
) => {
  const [state, dispatch] = useImmer<IAdminState>({
    room,
    selectedPlayList: playlistId,
  });

  return { state };
};

const AdminPageContainer = ({
  room,
  playlistId,
}: {
  room: IResponse<IRoom>;
  playlistId?: IPlaylist["id"];
}) => {
  const adminPageState = useAdminPageState(room, playlistId);

  if (!room.ok) {
    return <>"Error"</>;
  }

  return (
    <AppContainer maxWidth="md">
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <Box>
          {!adminPageState.state.selectedPlayList && (
            <AdminOverview {...adminPageState} />
          )}
          {adminPageState.state.selectedPlayList && (
            <AdminPlaylistDetails {...adminPageState} />
          )}
        </Box>
      </Container>
    </AppContainer>
  );
};

export default AdminPageContainer;
