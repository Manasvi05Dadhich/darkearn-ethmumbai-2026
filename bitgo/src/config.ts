import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { readFileSync } from "fs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

dotenv.config({ path: path.resolve(__dirname, "../../.env") });
const addressesPath = path.resolve(__dirname, "../../addresses.json");
const addresses = JSON.parse(readFileSync(addressesPath, "utf-8"));

export const config = {
    BITGO_ACCESS_TOKEN: (process.env.BITGO_ACCESS_TOKEN || "").trim(),
    BITGO_ENTERPRISE_ID: (process.env.BITGO_ENTERPRISE_ID || "").trim(),
    BITGO_WALLET_PASSPHRASE: (process.env.BITGO_WALLET_PASSPHRASE || "darkearn-test-passphrase").trim(),
    BITGO_ENV: "test" as const,
    BITGO_COIN: "hteth",
    BASE_SEPOLIA_RPC_URL: process.env.BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
    BASE_SEPOLIA_WS_URL:
        process.env.BASE_SEPOLIA_WS_URL ||
        (process.env.BASE_SEPOLIA_RPC_URL
            ? process.env.BASE_SEPOLIA_RPC_URL.replace("https://", "wss://")
            : "wss://sepolia.base.org"),
    REPUTATION_NFT_ADDRESS: addresses.ReputationNFT as string,
    BOUNTY_ESCROW_ADDRESS: addresses.BountyEscrow as string,
    SKILL_REGISTRY_ADDRESS: addresses.SkillRegistry as string,
    HONK_VERIFIER_ADDRESS: addresses.HonkVerifier as string,
    WEBHOOK_SERVER_PORT: parseInt(process.env.WEBHOOK_SERVER_PORT || "3456"),
    API_SERVER_PORT: parseInt(process.env.API_SERVER_PORT || "3457"),
    WEBHOOK_URL: process.env.WEBHOOK_URL || "",
    PRIZES_JSON_PATH: path.resolve(__dirname, "../data/prizes.json"),
    WEBHOOK_LOG_PATH: path.resolve(__dirname, "../logs/webhook.log"),
};
