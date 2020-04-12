import * as t from "io-ts";

export interface IRPCMeta<Tq, Oq, Iq, Ts, Os, Is> {
  domain: string;
  action: string;
  reqValidator: t.Type<Tq, Oq, Iq>;
  resValidator: t.Type<Ts, Os, Is>;
}

export const RPCMeta = <Tq, Oq, Iq, Ts, Os, Is>(
  domain: string,
  action: string,
  reqValidator: t.Type<Tq, Oq, Iq>,
  resValidator: t.Type<Ts, Os, Is>
): IRPCMeta<Tq, Oq, Iq, Ts, Os, Is> => {
  return { domain, action, reqValidator, resValidator };
};
