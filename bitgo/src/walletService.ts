import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { config } from "./config.js";

export interface FundLock {
    lockId: string;
    bountyId: number;
    posterAddress: string;
    prizeAmount: string;
    bitgoWalletId: string;
    status: "locked" | "unlocked" | "paid";
    createdAt: string;
}

export interface PrizesData {
    locks: FundLock[];
}

// --- JSON Helpers ---

function ensureDataDir(): void {
    const dir = path.dirname(config.PRIZES_JSON_PATH);
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
}

function readPrizes(): PrizesData {
    ensureDataDir();
    if (!existsSync(config.PRIZES_JSON_PATH)) {
        const initial: PrizesData = { locks: [] };
        writeFileSync(config.PRIZES_JSON_PATH, JSON.stringify(initial, null, 2));
        return initial;
    }
    return JSON.parse(readFileSync(config.PRIZES_JSON_PATH, "utf-8"));
}

function writePrizes(data: PrizesData): void {
    ensureDataDir();
    writeFileSync(config.PRIZES_JSON_PATH, JSON.stringify(data, null, 2));
}

// --- Wallet Service ---

import { getBitgo, getCoin, getWallet } from "./bitgoClient.js";

/**
 * Create a new MPC hot wallet for a poster.
 * Returns { walletId, receiveAddress }.
 */
export async function createWallet(label: string): Promise<{
    walletId: string;
    receiveAddress: string;
}> {
    const coin = getCoin();

    const result = await coin.wallets().generateWallet({
        label,
        passphrase: config.BITGO_WALLET_PASSPHRASE,
        multisigType: "tss",
        enterprise: config.BITGO_ENTERPRISE_ID,
        walletVersion: 5, // Required for ECDSA (ETH)
    });

    const wallet = result.wallet;
    const walletId = wallet.id();
    const receiveAddress = wallet.receiveAddress();

    console.log(`[WalletService] Created wallet ${walletId} — ${label}`);
    console.log(`[WalletService] Receive address: ${receiveAddress}`);

    // Attach webhook policy if WEBHOOK_URL is configured
    if (config.WEBHOOK_URL) {
        try {
            await attachWebhookPolicy(walletId);
            await attachTransferWebhook(walletId);
        } catch (err) {
            console.warn(`[WalletService] Warning: Could not attach webhook policy:`, err);
        }
    }

    return { walletId, receiveAddress };
}

/**
 * Lock funds for a bounty. Checks wallet balance >= prize + already reserved.
 * Records reservation in prizes.json. Returns lockId.
 */
export async function lockFunds(
    walletId: string,
    bountyId: number,
    prizeAmount: string,
    posterAddress: string
): Promise<string> {
    // 1. Check existing reservations for this wallet
    const data = readPrizes();
    const existingLocks = data.locks.filter(
        (l) => l.bitgoWalletId === walletId && l.status === "locked"
    );
    const totalReserved = existingLocks.reduce(
        (sum, l) => sum + BigInt(l.prizeAmount),
        BigInt(0)
    );

    // 2. Check wallet balance
    const wallet = await getWallet(walletId);
    const balance = BigInt(wallet.balanceString() || "0");
    const needed = totalReserved + BigInt(prizeAmount);

    if (balance < needed) {
        throw new Error(
            `Insufficient balance. Wallet has ${balance.toString()} wei, ` +
            `but ${needed.toString()} wei needed (${totalReserved.toString()} already reserved + ${prizeAmount} for this bounty)`
        );
    }

    // 3. Create lock entry
    const lockId = `lock-${uuidv4().slice(0, 8)}`;
    const lock: FundLock = {
        lockId,
        bountyId,
        posterAddress,
        prizeAmount,
        bitgoWalletId: walletId,
        status: "locked",
        createdAt: new Date().toISOString(),
    };

    data.locks.push(lock);
    writePrizes(data);

    console.log(
        `[WalletService] Locked ${prizeAmount} wei for bounty #${bountyId} — lockId: ${lockId}`
    );

    return lockId;
}

/**
 * Unlock funds for a bounty (cancel/refund).
 */
export async function unlockFunds(
    walletId: string,
    lockId: string
): Promise<void> {
    const data = readPrizes();
    const lock = data.locks.find(
        (l) => l.lockId === lockId && l.bitgoWalletId === walletId
    );

    if (!lock) {
        throw new Error(`Lock ${lockId} not found for wallet ${walletId}`);
    }

    if (lock.status !== "locked") {
        throw new Error(`Lock ${lockId} is already ${lock.status}`);
    }

    lock.status = "unlocked";
    writePrizes(data);

    console.log(
        `[WalletService] Unlocked ${lock.prizeAmount} wei for bounty #${lock.bountyId}`
    );
}

/**
 * Send payment from a poster's wallet to a recipient.
 */
export async function sendPayment(
    walletId: string,
    recipientAddress: string,
    amount: string
): Promise<string> {
    const wallet = await getWallet(walletId);

    const result = await wallet.sendMany({
        walletPassphrase: config.BITGO_WALLET_PASSPHRASE,
        recipients: [
            {
                address: recipientAddress,
                amount,
            },
        ],
        type: "transfer",
    });

    const txid = result.txid || result.tx || "unknown";
    console.log(
        `[WalletService] Sent ${amount} wei to ${recipientAddress} — txid: ${txid}`
    );

    return String(txid);
}

/**
 * Mark a lock as paid after successful transfer.
 */
export function markLockPaid(bountyId: number): void {
    const data = readPrizes();
    const lock = data.locks.find(
        (l) => l.bountyId === bountyId && l.status === "locked"
    );
    if (lock) {
        lock.status = "paid";
        writePrizes(data);
    }
}

/**
 * Get lock data for a bounty.
 */
export function getLockByBountyId(bountyId: number): FundLock | undefined {
    const data = readPrizes();
    return data.locks.find((l) => l.bountyId === bountyId);
}

/**
 * Get wallet balance.
 */
export async function getWalletBalance(walletId: string): Promise<string> {
    const wallet = await getWallet(walletId);
    return wallet.balanceString() || "0";
}

async function attachTransferWebhook(walletId: string): Promise<void> {
    const wallet = await getWallet(walletId);
    await wallet.addWebhook({
        type: "transfer",
        url: `${config.WEBHOOK_URL}/bitgo-transfer-notify`,
    } as any);
    console.log(`[WalletService] Transfer webhook attached to wallet ${walletId}`);
}


async function attachWebhookPolicy(walletId: string): Promise<void> {
    const bitgo = getBitgo();


    const scopesRes = await bitgo
        .get(
            bitgo.url(
                `/policy/v1/enterprises/${config.BITGO_ENTERPRISE_ID}/scopes`,
                2
            )
        )
        .result();

    const scopes = (scopesRes as any).scopes || [];
    const walletScope = scopes.find(
        (s: any) => s.name === "wallet.segregated"
    );

    if (!walletScope) {
        console.warn("[WalletService] Could not find wallet scope for policy. Skipping.");
        return;
    }


    const touchpointsRes = await bitgo
        .get(
            bitgo.url(
                `/policy/v1/enterprises/${config.BITGO_ENTERPRISE_ID}/scopes/${walletScope.id}/touchpoints`,
                2
            )
        )
        .result();

    const touchpoints = (touchpointsRes as any).touchpoints || [];
    const withdrawTouchpoint = touchpoints.find(
        (t: any) => t.name === "wallet.segregated.transfer"
    );

    if (!withdrawTouchpoint) {
        console.warn("[WalletService] Could not find withdrawal touchpoint. Skipping.");
        return;
    }

    // tp reate webhook policy rule
    await bitgo
        .post(
            bitgo.url(
                `/policy/v1/enterprises/${config.BITGO_ENTERPRISE_ID}/touchpoints/${withdrawTouchpoint.name}/rules`,
                2
            )
        )
        .send({
            name: `DarkEarn ReputationNFT Check - ${walletId.slice(0, 8)}`,
            adminOnly: false,
            clauses: [
                {
                    conditions: [],
                    actions: [
                        {
                            name: "webhook",
                            parameters: {
                                url: `${config.WEBHOOK_URL}/bitgo-webhook`,
                            },
                        },
                    ],
                },
            ],
            filteringConditions: [
                {
                    name: "wallet.ids",
                    parameters: {
                        walletId: [walletId],
                    },
                },
            ],
        })
        .result();

    console.log(`[WalletService] Webhook policy attached to wallet ${walletId}`);
}
