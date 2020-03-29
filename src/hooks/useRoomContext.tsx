import React from "react";
import { useImmer } from "use-immer";
import { IDbRoom } from "../api/collections/interfaces/IDbRoom";
import { IDbPlaylist } from "../api/collections/interfaces/IDbPlaylist";

type RoomMode = "listen" | "record";

export interface RoomState {
  room: IDbRoom;
  slug: string;
  mode: RoomMode;
  // Recording state
  recordingFor: IDbPlaylist | undefined;
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

  const recording = {
    initiate: (playlist: IDbPlaylist) => {
      dispatch(room => {
        room.recordingFor = playlist;
      });
    },
    cancel: () => {
      dispatch(room => {
        room.recordingFor = undefined;
      });
    }
  };

  return { roomState: state, roomDispatch: dispatch, recording };
};

export { RoomProvider, useRoomContext };
