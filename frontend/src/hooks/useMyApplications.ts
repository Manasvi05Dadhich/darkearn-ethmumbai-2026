import { useMemo } from "react";
import { useAccount, useReadContracts } from "wagmi";
import { CONTRACTS } from "../contracts";
import { formatEther } from "viem";

const STORAGE_KEY = "darkearn-my-apps";

interface StoredApp {
    bountyId: number;
    applicantId: number;
    appliedAt: number;
}

export function saveApplication(address: string, bountyId: number, applicantId: number) {
    const key = `${STORAGE_KEY}-${address.toLowerCase()}`;
    const apps: StoredApp[] = JSON.parse(localStorage.getItem(key) || "[]");
    if (!apps.find((a) => a.bountyId === bountyId)) {
        apps.push({ bountyId, applicantId, appliedAt: Date.now() });
        localStorage.setItem(key, JSON.stringify(apps));
    }
}

export interface MyApplication {
    bountyId: number;
    applicantId: number;
    title: string;
    posterEns: string;
    prize: string;
    prizeWei: bigint;
    status: string;
    isWinner: boolean;
    appliedAt: number;
    categoryId: number;
}

export function useMyApplications() {
    const { address } = useAccount();

    const storedApps: StoredApp[] = useMemo(() => {
        if (!address) return [];
        const key = `${STORAGE_KEY}-${address.toLowerCase()}`;
        try {
            return JSON.parse(localStorage.getItem(key) || "[]");
        } catch {
            return [];
        }
    }, [address]);

    const bountyIds = storedApps.map((a) => a.bountyId);

    const { data: coreResults, isLoading: coreLoading } = useReadContracts({
        contracts: bountyIds.map((id) => ({
            ...CONTRACTS.BountyEscrow,
            functionName: "getBountyCore" as const,
            args: [BigInt(id)],
        })),
        query: { enabled: bountyIds.length > 0 },
    });

    const { data: metaResults } = useReadContracts({
        contracts: bountyIds.map((id) => ({
            ...CONTRACTS.BountyEscrow,
            functionName: "getBountyMeta" as const,
            args: [BigInt(id)],
        })),
        query: { enabled: bountyIds.length > 0 },
    });

    const applications: MyApplication[] = useMemo(() => {
        if (!coreResults || !address) return [];
        return storedApps
            .map((stored, i) => {
                const core = coreResults[i]?.result as
                    | [bigint, string, string, string, bigint, bigint, bigint, number]
                    | undefined;
                const meta = metaResults?.[i]?.result as
                    | [string, boolean, boolean, bigint, bigint, string]
                    | undefined;
                if (!core) return null;
                const [, , posterENS, title, categoryId, , prizeAmount, status] = core;
                const winner = meta?.[0] || "";
                const workSubmitted = meta?.[1] || false;
                const paymentClaimed = meta?.[2] || false;
                const isWinner = winner.toLowerCase() === address.toLowerCase();

                let appStatus: string;
                if (paymentClaimed && isWinner) appStatus = "payment-claimed";
                else if (status === 2 && isWinner) appStatus = "completed";
                else if (workSubmitted && isWinner) appStatus = "work-submitted";
                else if (isWinner && status === 1) appStatus = "accepted";
                else if (status === 4) appStatus = "disputed";
                else if (status === 3 || status === 5) appStatus = "cancelled";
                else appStatus = "pending";

                return {
                    bountyId: stored.bountyId,
                    applicantId: stored.applicantId,
                    title: title || `Bounty #${stored.bountyId}`,
                    posterEns: posterENS,
                    prize: `${Number(formatEther(prizeAmount)).toFixed(4)} ETH`,
                    prizeWei: prizeAmount,
                    status: appStatus,
                    isWinner,
                    appliedAt: stored.appliedAt,
                    categoryId: Number(categoryId),
                };
            })
            .filter(Boolean) as MyApplication[];
    }, [coreResults, metaResults, address, storedApps]);

    return { applications, isLoading: coreLoading, count: applications.length };
}
