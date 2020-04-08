import React from "react";
import { useImmer } from "use-immer";
import { IRoom } from "../app-schema/IRoom";
import { IPlaylist } from "../app-schema/IPlaylist";
import { RequestData } from "../api/rpc/commands/episode.create.meta";
import rpcClient from "../api/rpc/client";
import * as RoomFetch from "../api/rpc/commands/room.fetch.meta";
import { IEpisode } from "../app-schema/IEpisode";

export type RoomMode = "listen" | "record";

export interface RoomState {
  room?: IRoom;
  slug?: IRoom["slug"];
  mode: RoomMode;
  playingEpisode:
    | {
        episodeId: IEpisode["id"];
        isPaused: boolean;
      }
    | undefined;
  recordingEpisode:
    | {
        partialEpisode: Partial<RequestData>;
        playlist: IPlaylist;
      }
    | undefined;
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
      },
      fetch: async () => {
        if (state.slug) {
          const reqData: RoomFetch.RequestData = {
            slug: state.slug,
          };
          const response = await rpcClient.call<
            RoomFetch.RequestData,
            RoomFetch.ResponseData
          >("room", "fetch", reqData);
          if (response.ok) {
            dispatch((room) => {
              room.room = response.data;
            });
          }
        }
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
        dispatch((room) => {
          room.recordingEpisode = undefined;
        });
        actions.room.fetch();
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

  /* Side-effects */

  // Changing the slug will refetch the room
  React.useEffect(() => {
    if (state.slug !== state.room?.slug) {
      actions.room.fetch();
    }
  }, [state.slug]);

  return {
    state,
    actions,
  };
};

export { RoomProvider, useRoomContext };
