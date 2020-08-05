import { IResponse } from "@/api/IResponse";
import roomFetchMeta from "@/api/rpc/commands/room.fetch.meta";
import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IEpisode } from "@/app-schema/IEpisode";
import { IPlaylist } from "@/app-schema/IPlaylist";
import { IRoom } from "@/app-schema/IRoom";
import produce from "immer";
import useSWR from "swr";

/**
 * Hook to fetch IRoom
 *
 * Wraps useSWR
 * - exposes all return values except the raw `mutate`
 * - exposes explicit methods instead, e.g: mutateEpisode
 *
 * @param uid Uid of IRoom to fetch
 * @param initialData initial data of IRoom
 */
export const useSWRRoom = (
  uid: string | null,
  initialData?: IResponse<IRoom>
) => {
  const { data, mutate, ...rest } = useSWR(uid, roomFetcher, {
    refreshInterval: 0,
    initialData,
  });

  /**
   * Mutates local episode object nested within IRoom,
   * revalidates on the server if shouldRevalidate === true
   *
   * @param playlistUid Parent uid of playlist of IEpisode
   * @param updatedEpisode The updated IEpisode object
   * @param shouldRevalidate passed along to mutate of useSWR
   */
  const mutateEpisodeUpdate = (
    playlistUid: IPlaylist["uid"],
    updatedEpisode: IEpisode,
    shouldRevalidate?: boolean
  ) => {
    mutate(
      produce(data, (draft) => {
        // Even with Immer.. updating data deep down nested arrays is quite a feat to pull off
        if (draft && draft.ok) {
          const playlistDraft = draft.data.playlists.find(
            (p) => p.uid === playlistUid
          );
          if (playlistDraft) {
            playlistDraft.episodes[
              playlistDraft.episodes.findIndex(
                (e) => e.uid === updatedEpisode.uid
              )
            ] = updatedEpisode;
          }
        }
      }),
      shouldRevalidate
    );
  };

  /**
   * Deletes local episode object nested within IRoom,
   * revalidates on the server if shouldRevalidate === true
   *
   * @param playlistUid Parent uid of playlist of IEpisode
   * @param episodeUid The deleted IEpisode uid
   * @param shouldRevalidate passed along to mutate of useSWR
   */
  const mutateEpisodeDelete = (
    playlistUid: IPlaylist["uid"],
    episodeUid: IEpisode["uid"],
    shouldRevalidate?: boolean
  ) => {
    mutate(
      produce(data, (draft) => {
        // Even with Immer.. updating data deep down nested arrays is quite a feat to pull off
        if (draft && draft.ok) {
          const playlistDraft = draft.data.playlists.find(
            (p) => p.uid === playlistUid
          );
          if (playlistDraft) {
            playlistDraft.episodes = playlistDraft.episodes.filter(
              (e) => e.uid !== episodeUid
            );
          }
        }
      }),
      shouldRevalidate
    );
  };

  // Needs Typescript fix to make sure `typeof data === IResponse<IRoom>`
  return {
    data: data as IResponse<IRoom> | undefined,
    mutateEpisodeUpdate,
    mutateEpisodeDelete,
    ...rest,
  };
};

// rpc call wrapped in fetcher so it can be used by useSWR
const roomFetcher = async (uid: IRoom["uid"]) =>
  RPCClientFactory(roomFetchMeta).call({ uid });
