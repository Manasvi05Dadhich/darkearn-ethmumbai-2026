import { ethers } from "ethers";
import { config } from "./config.js";
import {
    getLockByBountyId,
    markLockPaid,
    sendPayment,
    unlockFunds,
} from "./walletService.js";

const BOUNTY_ESCROW_ABI = [
    "event PaymentClaimed(uint256 indexed bountyId, address indexed winner, address recipient)",
    "event BountyCancelled(uint256 indexed bountyId, bytes32 bitgoLockId)",
    "event BountyRefunded(uint256 indexed bountyId)",
    "event DisputeRaised(uint256 indexed bountyId)",
];

let provider: ethers.WebSocketProvider | ethers.JsonRpcProvider | null = null;
let escrowContract: ethers.Contract | null = null;

export function startEventListener(): void {
    console.log("[EventListener] Starting Base Sepolia event listener...");

    const rpcUrl = config.BASE_SEPOLIA_RPC_URL;
    const wsUrl = config.BASE_SEPOLIA_WS_URL;

    try {
        if (wsUrl && wsUrl.startsWith("wss://")) {
            provider = new ethers.WebSocketProvider(wsUrl);
            console.log(`[EventListener] Connected via WebSocket: ${wsUrl}`);
        } else {
            provider = new ethers.JsonRpcProvider(rpcUrl);
            console.log(`[EventListener] Connected via HTTP (polling): ${rpcUrl}`);
        }
    } catch {
        provider = new ethers.JsonRpcProvider(rpcUrl);
        console.log(`[EventListener] Fallback to HTTP (polling): ${rpcUrl}`);
    }

    escrowContract = new ethers.Contract(
        config.BOUNTY_ESCROW_ADDRESS,
        BOUNTY_ESCROW_ABI,
        provider
    );

    escrowContract.on(
        "PaymentClaimed",
        async (bountyId: bigint, winner: string, recipient: string) => {
            const id = Number(bountyId);
            console.log(
                `[EventListener] PaymentClaimed — bounty #${id}, winner: ${winner}, recipient: ${recipient}`
            );

            try {
                const lock = getLockByBountyId(id);
                if (!lock) {
                    console.error(`[EventListener] No lock found for bounty #${id}`);
                    return;
                }

                const txid = await sendPayment(
                    lock.bitgoWalletId,
                    recipient,
                    lock.prizeAmount
                );

                markLockPaid(id);

                console.log(
                    `[EventListener] Payment sent for bounty #${id} — txid: ${txid}`
                );
            } catch (err) {
                console.error(
                    `[EventListener] Failed to process payment for bounty #${id}:`,
                    err
                );
            }
        }
    );

    escrowContract.on(
        "BountyCancelled",
        async (bountyId: bigint, _bitgoLockId: string) => {
            const id = Number(bountyId);
            console.log(`[EventListener] BountyCancelled — bounty #${id}`);

            try {
                const lock = getLockByBountyId(id);
                if (!lock) {
                    console.warn(`[EventListener] No lock found for cancelled bounty #${id}`);
                    return;
                }

                await unlockFunds(lock.bitgoWalletId, lock.lockId);
                console.log(`[EventListener] Funds unlocked for cancelled bounty #${id}`);
            } catch (err) {
                console.error(
                    `[EventListener] Failed to unlock funds for bounty #${id}:`,
                    err
                );
            }
        }
    );

    escrowContract.on("BountyRefunded", async (bountyId: bigint) => {
        const id = Number(bountyId);
        console.log(`[EventListener] BountyRefunded — bounty #${id}`);

        try {
            const lock = getLockByBountyId(id);
            if (!lock) {
                console.warn(`[EventListener] No lock found for refunded bounty #${id}`);
                return;
            }

            await unlockFunds(lock.bitgoWalletId, lock.lockId);
            console.log(`[EventListener] Funds unlocked for refunded bounty #${id}`);
        } catch (err) {
            console.error(
                `[EventListener] Failed to unlock funds for bounty #${id}:`,
                err
            );
        }
    });

    escrowContract.on("DisputeRaised", async (bountyId: bigint) => {
        const id = Number(bountyId);
        console.log(
            `[EventListener] DisputeRaised — bounty #${id}. Waiting for dispute resolution on-chain.`
        );
    });

    console.log("[EventListener] Listening for BountyEscrow events...");
}

export function stopEventListener(): void {
    if (escrowContract) {
        escrowContract.removeAllListeners();
    }
    if (provider && "destroy" in provider) {
        (provider as ethers.WebSocketProvider).destroy();
    }
    provider = null;
    escrowContract = null;
    console.log("[EventListener] Stopped.");
}
