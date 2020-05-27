import { RPCClientFactory } from "@/api/rpc/rpc-client";
import { IRPCMeta } from "@/api/rpc/rpc-meta";
import useLoadingState from "@/hooks/useLoadingState";

export const useRPC = <Tq, Oq, Iq, Ts, Os, Is>(
  meta: IRPCMeta<Tq, Oq, Iq, Ts, Os, Is>
) => {
  const {
    isValidating,
    setIsvalidating,
    data,
    setData,
    error,
    setError,
  } = useLoadingState<Ts>();

  const call = async (data: Tq) => {
    setIsvalidating(true);
    const theCall = await RPCClientFactory(meta).call(data);
    if (theCall.ok) {
      setData(theCall.data);
    } else {
      setError(theCall.error);
    }
    return theCall;
  };

  return { call, isValidating, data, error };
};
