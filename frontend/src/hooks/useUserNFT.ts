import { useAccount, useReadContract } from "wagmi";
import { CONTRACTS } from "../contracts";

export function useUserNFT() {
    const { address } = useAccount();

    const { data: balance, isLoading: balanceLoading } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "balanceOf",
        args: address ? [address] : undefined,
        query: { enabled: !!address },
    });

    const hasNFT = balance ? (balance as bigint) > 0n : false;

    const { data: tokenId } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "addressToTokenId",
        args: address ? [address] : undefined,
        query: { enabled: !!address && hasNFT },
    });

    const resolvedTokenId = tokenId ? (tokenId as bigint) : null;

    const { data: ensName } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToEns",
        args: resolvedTokenId !== null ? [resolvedTokenId] : undefined,
        query: { enabled: resolvedTokenId !== null },
    });

    const { data: band } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToBand",
        args: resolvedTokenId !== null ? [resolvedTokenId] : undefined,
        query: { enabled: resolvedTokenId !== null },
    });

    const { data: memberSince } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToMemberSince",
        args: resolvedTokenId !== null ? [resolvedTokenId] : undefined,
        query: { enabled: resolvedTokenId !== null },
    });

    return {
        hasNFT,
        tokenId: resolvedTokenId,
        ensName: ensName as string | undefined,
        band: band !== undefined ? Number(band as bigint) : undefined,
        memberSince: memberSince !== undefined ? Number(memberSince as bigint) : undefined,
        isLoading: balanceLoading,
    };
}
