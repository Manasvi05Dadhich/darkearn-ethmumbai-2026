import { useReadContract } from "wagmi";
import { CONTRACTS } from "../contracts";

export function useReputationNFT(address?: `0x${string}`) {
    const balanceResult = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const bandResult = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "currentBand",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const hasNFT = balanceResult.data ? (balanceResult.data as bigint) > 0n : false;
    const band = bandResult.data !== undefined ? Number(bandResult.data) : undefined;

    return {
        hasNFT,
        band,
        isLoading: balanceResult.isLoading || bandResult.isLoading,
        error: balanceResult.error || bandResult.error,
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
