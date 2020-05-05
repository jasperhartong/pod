import useSWR from "swr";
import { RPCClientFactory } from "../api/rpc/rpc-client";
import roomFetchMeta from "../api/rpc/commands/room.fetch.meta";
import { IRoom } from "../app-schema/IRoom";
import { IResponse } from "../api/IResponse";

export const useSWRRoom = (slug: string = "test") => {
  const { data, ...rest } = useSWR(slug, (slug: IRoom["slug"]) =>
    RPCClientFactory(roomFetchMeta).call({ slug })
  );
  // Needs some weird Typescript fix..
  return { data: data as IResponse<IRoom> | undefined, ...rest };
};
