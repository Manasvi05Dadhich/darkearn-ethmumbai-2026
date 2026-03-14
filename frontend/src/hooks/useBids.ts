import { useState, useEffect } from "react";
import { useAccount, usePublicClient } from "wagmi";
import { parseAbiItem } from "viem";
import { CONTRACTS } from "../contracts";
import { getLogsPaginated } from "../lib/getLogs";

export interface ReceivedBid {
    poster: string;
    encryptedBid: `0x${string}`;
    txHash: string;
    blockNumber: bigint;
}

export function useBids() {
    const { address } = useAccount();
    const publicClient = usePublicClient();
    const [bids, setBids] = useState<ReceivedBid[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!address || !publicClient) return;
        setIsLoading(true);
        getLogsPaginated(publicClient, {
            address: CONTRACTS.BountyEscrow.address,
            event: parseAbiItem(
                "event PrivateBidSent(address indexed contributor, address indexed poster, bytes encryptedBid)"
            ),
            args: { contributor: address },
        })
            .then((logs) => {
                setBids(
                    logs.map((log: { args: { poster?: string; encryptedBid?: `0x${string}` }; transactionHash: string; blockNumber: bigint }) => ({
                        poster: (log.args.poster as string) ?? "",
                        encryptedBid: (log.args.encryptedBid as `0x${string}`) ?? "0x",
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                    }))
                );
                setIsLoading(false);
            })
            .catch(() => setIsLoading(false));
    }, [address, publicClient]);

    return { bids, count: bids.length, isLoading };
}
