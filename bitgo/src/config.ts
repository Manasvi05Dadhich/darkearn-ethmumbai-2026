import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load .env from project root (darkearn/)
dotenv.config({ path: path.resolve(__dirname, "../../.env") });

// Contract addresses from Phase 2 deployment
const addressesPath = path.resolve(__dirname, "../../addresses.json");
const addresses = JSON.parse(readFileSync(addressesPath, "utf-8"));

export const config = {
    // BitGo
    BITGO_ACCESS_TOKEN: process.env.BITGO_ACCESS_TOKEN || "",
    BITGO_ENTERPRISE_ID: process.env.BITGO_ENTERPRISE_ID || "",
    BITGO_WALLET_PASSPHRASE: process.env.BITGO_WALLET_PASSPHRASE || "darkearn-test-passphrase",
    BITGO_ENV: "test" as const,
    BITGO_COIN: "hteth", // Holesky testnet ETH

    // Base Sepolia RPC
    BASE_SEPOLIA_RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    BASE_SEPOLIA_WS_URL:
        process.env.BASE_SEPOLIA_WS_URL ||
        (process.env.BASE_SEPOLIA_RPC_URL
            ? process.env.BASE_SEPOLIA_RPC_URL.replace("https://", "wss://")
            : "wss://sepolia.base.org"),

    // Contract Addresses (from Phase 2)
    REPUTATION_NFT_ADDRESS: addresses.ReputationNFT as string,
    BOUNTY_ESCROW_ADDRESS: addresses.BountyEscrow as string,
    SKILL_REGISTRY_ADDRESS: addresses.SkillRegistry as string,
    HONK_VERIFIER_ADDRESS: addresses.HonkVerifier as string,

    // Server ports
    WEBHOOK_SERVER_PORT: parseInt(process.env.WEBHOOK_SERVER_PORT || "3456"),
    API_SERVER_PORT: parseInt(process.env.API_SERVER_PORT || "3457"),

    // Webhook URL (set after localtunnel starts)
    WEBHOOK_URL: process.env.WEBHOOK_URL || "",

    // Data paths
    PRIZES_JSON_PATH: path.resolve(__dirname, "../data/prizes.json"),
    WEBHOOK_LOG_PATH: path.resolve(__dirname, "../logs/webhook.log"),
};
