import React from "react";
import { useImmer } from "use-immer";

type RoomMode = "listen" | "record";

interface RoomState {
  mode: RoomMode;
}

const defaultState: RoomState = {
  mode: "listen"
};

const RoomContext = React.createContext<
  | [RoomState, (f: (draft: { mode: RoomMode }) => void | RoomState) => void]
  | undefined
>(undefined);

const RoomProvider = (props: { children: JSX.Element }) => {
  const [state, dispatch] = useImmer<RoomState>({ ...defaultState });

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
