import React, { useMemo } from "react";
import { useImmer } from "use-immer";
import { IRoom } from "../app-schema/IRoom";
import { IPlaylist } from "../app-schema/IPlaylist";
import { RequestData } from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import * as RoomFetch from "../api/rpc/commands/room.fetch.meta";
import { IEpisode } from "../app-schema/IEpisode";
import { IResponse } from "../api/IResponse";

export type RoomMode = "listen" | "record";

export interface RoomState {
  mode: RoomMode;
  slug?: IRoom["slug"];
  room?: IResponse<IRoom>;
  playingEpisode?: {
    episodeId: IEpisode["id"];
    isPaused: boolean;
  };
  recordingEpisode?: {
    partialEpisode: Partial<RequestData>;
    playlist: IPlaylist;
  };
}

type ImmerRoomDispatch = (f: (draft: RoomState) => void | RoomState) => void;
const RoomContext = React.createContext<
  [RoomState, ImmerRoomDispatch] | undefined
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

  const actions = useMemo(() => getActions(dispatch), [dispatch]);

  return {
    state,
    actions,
  };
};

export { RoomProvider, useRoomContext };

const getActions = (dispatch: ImmerRoomDispatch) => {
  const actions = {
    mode: {
      change: (mode: RoomMode) => {
        dispatch((room) => {
          room.mode = mode;
        });
      },
    },
    room: {
      initiate: (slug: string) => {
        dispatch((room) => {
          room.slug = slug;
        });
        actions.room.fetch(slug);
      },
      fetch: async (slug?: string) => {
        if (!slug) {
          return;
        }
        const reqData: RoomFetch.RequestData = {
          slug,
        };
        const response = await rpcClient.call<
          RoomFetch.RequestData,
          RoomFetch.ResponseData
        >("room", "fetch", reqData);
        dispatch((room) => {
          room.room = response;
        });
      },
    },
    recordingEpisode: {
      initiate: (playlist: IPlaylist) => {
        dispatch((room) => {
          room.recordingEpisode = { partialEpisode: {}, playlist };
        });
      },
      updateRecording: (episode: Partial<RequestData>) => {
        dispatch((room) => {
          if (room.recordingEpisode) {
            room.recordingEpisode.partialEpisode = episode;
          }
        });
      },
      cancel: () => {
        dispatch((room) => {
          room.recordingEpisode = undefined;
        });
      },
      finish: () => {
        let slugToRefetch: string | undefined;
        dispatch((room) => {
          room.recordingEpisode = undefined;
          slugToRefetch = room.slug;
        });
        actions.room.fetch(slugToRefetch);
      },
    },
    playingEpisode: {
      initiate: (episodeId: IEpisode["id"]) => {
        dispatch((room) => {
          room.playingEpisode = {
            episodeId,
            // always restart when initiating again
            isPaused: false,
          };
        });
      },
      pause: (isPaused: boolean) => {
        dispatch((room) => {
          if (room.playingEpisode) {
            room.playingEpisode.isPaused = isPaused;
          }
        });
      },
      stop: () => {
        dispatch((room) => {
          room.playingEpisode = undefined;
        });
      },
    },
  };
  return actions;
};
