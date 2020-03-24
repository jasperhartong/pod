import { baseUrl } from "../storage/urls";

import { domain, action } from "./episode.count";

type domains = typeof domain;
type actions = typeof action;

export const rpcBasePath = `${baseUrl}/api/rpc/`;

export const rpcUrl = (domain: domains, action: actions) =>
  `${rpcBasePath}${domain}.${action}`;
