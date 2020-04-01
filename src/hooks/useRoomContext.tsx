import React from "react";
import { useImmer } from "use-immer";
import { IDbRoom } from "../api/collection-storage/interfaces/IDbRoom";
import { IDbPlaylist } from "../api/collection-storage/interfaces/IDbPlaylist";
import { IDbEpisode } from "../api/collection-storage/interfaces/IDbEpisode";
import { RequestData } from "../api/rpc/commands/episode.create.meta";

type RoomMode = "listen" | "record";

export interface RoomState {
  room: IDbRoom;
  slug: string;
  mode: RoomMode;
  newRecording:
    | {
        episodeCreation: Partial<RequestData>;
        playlist: IDbPlaylist;
      }
    | undefined;
}

const RoomContext = React.createContext<
  [RoomState, (f: (draft: RoomState) => void | RoomState) => void] | undefined
>(undefined);

const RoomProvider = (props: {
  children: JSX.Element;
  defaultState: RoomState;
}) => {
  const [state, dispatch] = useImmer<RoomState>({ ...props.defaultState });

  return (
    <RoomContext.Provider value={[state, dispatch]}>
      {props.children}
    </RoomContext.Provider>
  );
};

const useRoomContext = () => {
  const roomContext = React.useContext(RoomContext);
  if (!roomContext) {
    throw Error("No Room Context Founf");
  }
  const [state, dispatch] = roomContext;

  const recordingActions = {
    initiate: (playlist: IDbPlaylist) => {
      dispatch(room => {
        room.newRecording = { episodeCreation: {}, playlist };
      });
    },
    updateRecording: (episode: Partial<RequestData>) => {
      dispatch(room => {
        if (room.newRecording) {
          room.newRecording.episodeCreation = episode;
        }
      });
    },
    cancel: () => {
      dispatch(room => {
        room.newRecording = undefined;
      });
    }
  };

  return {
    roomState: state,
    roomDispatch: dispatch,
    recordingActions
  };
};

export { RoomProvider, useRoomContext };
