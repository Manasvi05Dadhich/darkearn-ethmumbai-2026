import express from "express";
import { ethers } from "ethers";
import { config } from "./config.js";
import {
    createWallet,
    lockFunds,
    unlockFunds,
    getWalletBalance,
} from "./walletService.js";

const app = express();
app.use(express.json());

// --- POST /api/wallet/create ---
app.post("/api/wallet/create", async (req, res) => {
    try {
        const { label } = req.body;
        if (!label) {
            res.status(400).json({ error: "label is required" });
            return;
        }

        const result = await createWallet(label);
        res.json(result);
    } catch (err: any) {
        console.error("[API] Error creating wallet:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- POST /api/funds/lock ---
app.post("/api/funds/lock", async (req, res) => {
    try {
        const { walletId, bountyId, prizeAmount, posterAddress, signature } = req.body;

        if (!walletId || bountyId === undefined || !prizeAmount || !posterAddress) {
            res.status(400).json({ error: "walletId, bountyId, prizeAmount, posterAddress are required" });
            return;
        }

        // Verify signature: poster signs "I am posting bounty [bountyId] with prize [amount] from wallet [walletId]"
        if (signature) {
            const message = `I am posting bounty ${bountyId} with prize ${prizeAmount} from wallet ${walletId}`;
            const recoveredAddress = ethers.verifyMessage(message, signature);
            if (recoveredAddress.toLowerCase() !== posterAddress.toLowerCase()) {
                res.status(403).json({ error: "Signature verification failed" });
                return;
            }
        }

        const lockId = await lockFunds(walletId, bountyId, prizeAmount, posterAddress);
        res.json({ lockId });
    } catch (err: any) {
        console.error("[API] Error locking funds:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- POST /api/funds/unlock ---
app.post("/api/funds/unlock", async (req, res) => {
    try {
        const { walletId, lockId } = req.body;

        if (!walletId || !lockId) {
            res.status(400).json({ error: "walletId and lockId are required" });
            return;
        }

        await unlockFunds(walletId, lockId);
        res.json({ success: true });
    } catch (err: any) {
        console.error("[API] Error unlocking funds:", err);
        res.status(400).json({ error: err.message });
    }
});

// --- GET /api/wallet/:walletId/balance ---
app.get("/api/wallet/:walletId/balance", async (req, res) => {
    try {
        const { walletId } = req.params;
        const balance = await getWalletBalance(walletId);
        res.json({ walletId, balance });
    } catch (err: any) {
        console.error("[API] Error getting balance:", err);
        res.status(500).json({ error: err.message });
    }
});

// --- Health ---
app.get("/health", (_req, res) => {
    res.json({ status: "ok", service: "darkearn-api-server" });
});

// --- Start Server ---
export function startApiServer(port?: number): ReturnType<typeof app.listen> {
    const p = port || config.API_SERVER_PORT;
    const server = app.listen(p, () => {
        console.log(`[API Server] Running on port ${p}`);
    });
    return server;
}

export { app };
