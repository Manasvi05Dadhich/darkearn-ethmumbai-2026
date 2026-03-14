import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbiItem, formatEther } from "viem";
import { CONTRACTS } from "../contracts";
import { getLogsPaginated } from "../lib/getLogs";

export interface Payment {
    bountyId: number;
    amount: bigint;
    recipient: string;
    txHash: string;
    blockNumber: bigint;
}

export function useEarnings() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [payments, setPayments] = useState<Payment[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!address || !publicClient) return;
        setIsLoading(true);
        getLogsPaginated(publicClient, {
            address: CONTRACTS.BountyEscrow.address,
            event: parseAbiItem(
                "event PaymentClaimed(uint256 indexed bountyId, address indexed winner, address recipient, uint256 amount)"
            ),
            args: { winner: address },
        })
            .then((logs) => {
                setPayments(
                    logs.map((log: { args: { bountyId?: bigint; amount?: bigint; recipient?: string }; transactionHash: string; blockNumber: bigint }) => ({
                        bountyId: Number(log.args.bountyId ?? 0),
                        amount: log.args.amount ?? 0n,
                        recipient: (log.args.recipient as string) ?? "",
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                    }))
                );
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [address, publicClient]);

    const totalEarned = payments.reduce((sum, p) => sum + p.amount, 0n);

    return {
        payments,
        totalEarned,
        totalEarnedFormatted: formatEther(totalEarned),
        isLoading,
    };
}
