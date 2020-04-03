import React from "react";
import { useImmer } from "use-immer";
import { IRoom } from "../app-schema/IRoom";
import { IPlaylist } from "../app-schema/IPlaylist";
import { RequestData } from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import * as RoomFetch from "../api/rpc/commands/room.fetch.meta";

export type RoomMode = "listen" | "record";

export interface RoomState {
  room?: IRoom;
  slug?: string;
  mode: RoomMode;
  newRecording:
    | {
        episodeCreation: Partial<RequestData>;
        playlist: IPlaylist;
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

  const roomActions = {
    fetch: async () => {
      if (state.slug) {
        const reqData: RoomFetch.RequestData = {
          slug: state.slug
        };
        const response = await rpcClient.call<
          RoomFetch.RequestData,
          RoomFetch.ResponseData
        >("room", "fetch", reqData);
        if (response.ok) {
          dispatch(room => {
            room.room = response.data;
          });
        }
      }
    }
  };

  const recordingActions = {
    initiate: (playlist: IPlaylist) => {
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
    },
    finish: () => {
      dispatch(room => {
        room.newRecording = undefined;
      });
      roomActions.fetch();
    }
  };

  React.useEffect(() => {
    if (state.slug !== state.room?.slug) {
      roomActions.fetch();
    }
  }, [state.slug]);

  return {
    roomState: state,
    roomDispatch: dispatch,
    roomActions,
    recordingActions
  };
};

export { RoomProvider, useRoomContext };
