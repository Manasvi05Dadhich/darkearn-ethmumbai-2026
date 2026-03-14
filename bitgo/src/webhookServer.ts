import express from "express";
import { ethers } from "ethers";
import { appendFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import { config } from "./config.js";

const app = express();
app.use(express.json());


const REPUTATION_NFT_ABI = [
    "function balanceOf(address owner) view returns (uint256)",
];

function logWebhookDecision(
    address: string,
    decision: "approved" | "denied",
    reason: string,
    extra: Record<string, any> = {}
): void {
    const logDir = path.dirname(config.WEBHOOK_LOG_PATH);
    if (!existsSync(logDir)) {
        mkdirSync(logDir, { recursive: true });
    }

    const entry = {
        timestamp: new Date().toISOString(),
        address,
        decision,
        reason,
        ...extra,
    };

    appendFileSync(config.WEBHOOK_LOG_PATH, JSON.stringify(entry) + "\n");
    console.log(`[Webhook] ${decision.toUpperCase()}: ${address} — ${reason}`);
}


async function checkReputationNFT(address: string): Promise<boolean> {
    try {
        const provider = new ethers.JsonRpcProvider(config.BASE_SEPOLIA_RPC_URL);
        const nftContract = new ethers.Contract(
            config.REPUTATION_NFT_ADDRESS,
            REPUTATION_NFT_ABI,
            provider
        );
        const balance = await nftContract.balanceOf(address);
        return balance > 0n;
    } catch (err) {
        console.error(`[Webhook] Error checking ReputationNFT for ${address}:`, err);
        return false;
    }
}

app.post("/bitgo-webhook", async (req, res) => {
    try {
        const payload = req.body;
        console.log("[Webhook] Received policy webhook:", JSON.stringify(payload, null, 2));

        // With ERC-5564 stealth addresses, the recipient is a fresh stealth address
        // that has no NFT. We check the WINNER (from the transfer comment) instead.
        const comment = payload?.transfer?.comment ?? payload?.comment ?? "";
        const winnerMatch = comment.match(/winner:(0x[a-fA-F0-9]{40})/);
        const winnerAddress = winnerMatch ? winnerMatch[1] : "";

        if (winnerAddress && ethers.isAddress(winnerAddress)) {
            const hasNFT = await checkReputationNFT(winnerAddress);

            if (hasNFT) {
                logWebhookDecision(winnerAddress, "approved", "Winner has ReputationNFT — paying stealth address");
                res.status(200).json({ approved: true });
            } else {
                logWebhookDecision(winnerAddress, "denied", "Winner has no ReputationNFT");
                res.status(200).json({
                    approved: false,
                    reason: "Winner has no DarkEarn reputation credential",
                });
            }
            return;
        }

        // Fallback: try checking recipient directly (legacy non-stealth payments)
        let recipientAddress = "";
        if (payload?.recipients?.[0]?.address) {
            recipientAddress = payload.recipients[0].address;
        } else if (payload?.transfer?.entries) {
            const receiving = payload.transfer.entries.find(
                (e: any) => BigInt(e.value || e.valueString || "0") > 0n
            );
            if (receiving) {
                recipientAddress = receiving.address;
            }
        } else if (payload?.intent?.recipients?.[0]?.address?.address) {
            recipientAddress = payload.intent.recipients[0].address.address;
        } else if (payload?.intent?.recipients?.[0]?.address) {
            recipientAddress = payload.intent.recipients[0].address;
        }

        if (!recipientAddress) {
            logWebhookDecision("unknown", "denied", "Could not extract recipient or winner from payload");
            res.status(200).json({
                approved: false,
                reason: "Could not identify payment recipient",
            });
            return;
        }

        const hasNFT = await checkReputationNFT(recipientAddress);
        if (hasNFT) {
            logWebhookDecision(recipientAddress, "approved", "Verified DarkEarn reputation credential");
            res.status(200).json({ approved: true });
        } else {
            logWebhookDecision(recipientAddress, "denied", "No verified DarkEarn reputation credential");
            res.status(200).json({
                approved: false,
                reason: "No verified DarkEarn reputation credential",
            });
        }
    } catch (err) {
        console.error("[Webhook] Error processing webhook:", err);
        logWebhookDecision("error", "denied", `Internal error: ${err}`);
        res.status(200).json({
            approved: false,
            reason: "Internal webhook server error",
        });
    }
});


app.post("/bitgo-transfer-notify", (req, res) => {
    const payload = req.body;
    console.log("[Webhook] Transfer notification:", JSON.stringify(payload, null, 2));

    logWebhookDecision(
        payload?.transfer?.entries?.[0]?.address || "unknown",
        "approved",
        "Transfer notification received",
        { type: "transfer-notification", hash: payload?.hash || "unknown" }
    );

    res.status(200).json({ ok: true });
});


app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "darkearn-webhook-server" });
});


export function startWebhookServer(port?: number): ReturnType<typeof app.listen> {
    const p = port || config.WEBHOOK_SERVER_PORT;
    const server = app.listen(p, () => {
        console.log(`[Webhook Server] Running on port ${p}`);
    });
    return server;
}

export { app, checkReputationNFT };