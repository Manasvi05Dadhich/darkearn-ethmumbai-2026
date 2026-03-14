import { useState, useCallback } from "react";
import { usePublicClient } from "wagmi";
import { parseAbiItem, formatEther, type Hex } from "viem";
import { CONTRACTS } from "../contracts";
import {
    checkAnnouncementForHunter,
    computeStealthPrivateKey,
    type StealthKeys,
} from "../lib/stealth";

export interface StealthPayment {
    stealthAddress: string;
    ephemeralPublicKey: string;
    metadata: string;
    amount: string;
    amountWei: bigint;
    txHash: string;
    blockNumber: bigint;
    isSpent: boolean;
}

/**
 * Scans ERC-5564 Announcement events to find payments belonging to the hunter.
 * Uses view tag for fast initial filtering, then full ECDH check for matches.
 */
export function useStealthPayments(stealthKeys: StealthKeys | null) {
    const publicClient = usePublicClient();
    const [payments, setPayments] = useState<StealthPayment[]>([]);
    const [scanning, setScanning] = useState(false);

    const scanForPayments = useCallback(async () => {
        if (!stealthKeys || !publicClient) return;
        setScanning(true);

        try {
            const { getLogsPaginated } = await import("../lib/getLogs");
            const logs = await getLogsPaginated(publicClient, {
                address: CONTRACTS.ERC5564Announcer.address,
                event: parseAbiItem(
                    "event Announcement(uint256 indexed schemeId, address indexed stealthAddress, address indexed caller, bytes ephemeralPubKey, bytes metadata)"
                ),
                args: { schemeId: 0n },
            });

            const matched: StealthPayment[] = [];

            for (const log of logs) {
                const stealthAddress = log.args.stealthAddress as string;
                const ephemeralPubKey = log.args.ephemeralPubKey as string;
                const metadata = log.args.metadata as string;

                if (!stealthAddress || !ephemeralPubKey || !metadata) continue;

                const isForMe = checkAnnouncementForHunter(
                    { stealthAddress, ephemeralPublicKey: ephemeralPubKey, metadata },
                    stealthKeys
                );

                if (isForMe) {
                    const balance = await publicClient.getBalance({
                        address: stealthAddress as `0x${string}`,
                    });

                    matched.push({
                        stealthAddress,
                        ephemeralPublicKey: ephemeralPubKey,
                        metadata,
                        amount: formatEther(balance),
                        amountWei: balance,
                        txHash: log.transactionHash,
                        blockNumber: log.blockNumber,
                        isSpent: balance === 0n,
                    });
                }
            }

            setPayments(matched);
        } catch (err) {
            console.error("[StealthScanner] Scan failed:", err);
        } finally {
            setScanning(false);
        }
    }, [stealthKeys, publicClient]);

    const revealPrivateKey = useCallback(
        (payment: StealthPayment): Hex => {
            if (!stealthKeys) throw new Error("No stealth keys");
            return computeStealthPrivateKey(
                payment.ephemeralPublicKey,
                stealthKeys
            );
        },
        [stealthKeys]
    );

    return {
        payments,
        scanning,
        scanForPayments,
        revealPrivateKey,
        totalFound: payments.length,
        totalAvailable: payments.filter((p) => !p.isSpent).length,
    };
}
