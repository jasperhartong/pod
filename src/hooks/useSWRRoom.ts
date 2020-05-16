import { IResponse } from "@/api/IResponse";
import roomFetchMeta from "@/api/rpc/commands/room.fetch.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import produce from "immer";
import useSWR from "swr";

const fetcher = async (uid: IRoom["uid"]) =>
  RPCClientFactory(roomFetchMeta).call({ uid });

export const useSWRRoom = (
  uid: string | null,
  initialData?: IResponse<IRoom>
) => {
  const { data, mutate, ...rest } = useSWR(uid, fetcher, {
    refreshInterval: 0,
    initialData,
  });

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
