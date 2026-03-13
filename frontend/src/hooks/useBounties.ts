import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS } from "../contracts";

export interface BountyCore {
    id: number;
    poster: string;
    posterEns: string;
    prizeAmount: bigint;
    deadline: bigint;
    applicantCount: number;
    status: number;
}

export function useBounty(bountyId: number) {
    return useReadContract({
        ...CONTRACTS.BountyEscrow,
        functionName: "getBountyCore",
        args: [BigInt(bountyId)],
    });
}


export function useBountyCount() {
    return useReadContract({
        ...CONTRACTS.BountyEscrow,
        functionName: "bountyCount",
    });
}

export function useBounties(count: number) {
    const ids = Array.from({ length: count }, (_, i) => i + 1);

    return useReadContracts({
        contracts: ids.map((id) => ({
            ...CONTRACTS.BountyEscrow,
            functionName: "getBountyCore" as const,
            args: [BigInt(id)],
        })),
    });
}
