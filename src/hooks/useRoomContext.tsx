import React from "react";
import { useImmer } from "use-immer";
import { DbRoom } from "../storage/interfaces";

type RoomMode = "listen" | "record";

export interface RoomState {
  room: DbRoom;
  slug: string;
  mode: RoomMode;
}

const RoomContext = React.createContext<
  | [RoomState, (f: (draft: { mode: RoomMode }) => void | RoomState) => void]
  | undefined
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
  return { roomState: state, roomDispatch: dispatch };
};

export { RoomProvider, useRoomContext };
