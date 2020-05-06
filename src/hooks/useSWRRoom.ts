import useSWR from "swr";
import produce from "immer";
import { RPCClientFactory } from "../api/rpc/rpc-client";
import roomFetchMeta from "../api/rpc/commands/room.fetch.meta";
import { IRoom } from "../app-schema/IRoom";
import { IResponse } from "../api/IResponse";
import { IPlaylist } from "../app-schema/IPlaylist";
import { IEpisode } from "../app-schema/IEpisode";

export const useSWRRoom = (slug: string = "test") => {
  const { data, mutate, ...rest } = useSWR(
    slug,
    (slug: IRoom["slug"]) => RPCClientFactory(roomFetchMeta).call({ slug }),
    { refreshInterval: 0 }
  );

  const mutateEpisode = (
    playlistId: IPlaylist["id"],
    updated: IEpisode,
    shouldRevalidate?: boolean
  ) => {
    mutate(
      produce(data, (draft) => {
        // Even with Immer.. updating data deep down nested arrays is quite a feat to pull off
        if (draft && draft.ok) {
          const playlistDraft = draft.data.playlists.find(
            (p) => p.id === playlistId
          );
          if (playlistDraft) {
            playlistDraft.episodes[
              playlistDraft.episodes.findIndex((e) => e.id === updated.id)
            ] = updated;
          }
        }
      }),
      shouldRevalidate
    );
  };

  // Needs some weird Typescript fix..
  return { data: data as IResponse<IRoom> | undefined, mutateEpisode, ...rest };
};
