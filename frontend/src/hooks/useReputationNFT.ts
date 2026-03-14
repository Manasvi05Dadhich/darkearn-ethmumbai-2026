import { useReadContract } from "wagmi";
import { CONTRACTS } from "../contracts";

export function useReputationNFT(address?: `0x${string}`) {
    const balanceResult = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const hasNFT = balanceResult.data ? (balanceResult.data as bigint) > 0n : false;

    return {
        hasNFT,
        isLoading: balanceResult.isLoading,
        isError: balanceResult.isError,
        error: balanceResult.error,
    };
}

export function useEnsTokenId(ensName: string) {
    return useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "ensToTokenId",
        args: [ensName],
        query: { enabled: !!ensName },
    });
}
