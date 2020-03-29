import { baseUrl } from "../../urls";

import * as count from "./episode.count";
import * as create from "./episode.create";

export type RpcDomains = typeof count.domain | typeof create.domain;
export type RpcActions = typeof count.action | typeof create.action;

export const rpcBasePath = `${baseUrl}/api/rpc/`;

export const rpcUrl = (domain: RpcDomains, action: RpcActions) =>
  `${rpcBasePath}${domain}.${action}`;
