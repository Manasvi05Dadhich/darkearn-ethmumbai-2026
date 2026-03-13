

import { config as dotenvConfig } from "dotenv";
import { readFileSync } from "fs";
import { dirname, join } from "path";
import { fileURLToPath } from "url";


dotenvConfig();


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT = __dirname;

interface ContractAddresses {
    [contractName: string]: string;
}

function loadAddresses(): ContractAddresses {
    try {
        const raw = readFileSync(join(ROOT, "addresses.json"), "utf-8");
        return JSON.parse(raw) as ContractAddresses;
    } catch {
        return {};
    }
}


function requireEnv(key: string): string {
    const value = process.env[key];
    if (!value) {
        throw new Error(`Missing required environment variable: ${key}`);
    }
    return value;
}

function optionalEnv(key: string, fallback: string = ""): string {
    return process.env[key] ?? fallback;
}

export const config = {

    chainId: parseInt(optionalEnv("CHAIN_ID", "84532"), 10),
    rpcUrl: optionalEnv("BASE_SEPOLIA_RPC_URL", "https://sepolia.base.org"),

    wallets: {
        deployer: optionalEnv("DEPLOYER_PRIVATE_KEY"),
        demoPoster: optionalEnv("DEMO_POSTER_PRIVATE_KEY"),
        demoHunter: optionalEnv("DEMO_HUNTER_PRIVATE_KEY"),
        demoHunter2: optionalEnv("DEMO_HUNTER_2_PRIVATE_KEY"),
    },

    // ENS
    ensRegistryAddress: optionalEnv("ENS_REGISTRY_ADDRESS"),

    // BitGo
    bitgo: {
        accessToken: optionalEnv("BITGO_ACCESS_TOKEN"),
        enterpriseId: optionalEnv("BITGO_ENTERPRISE_ID"),
        walletId: optionalEnv("BITGO_WALLET_ID"),
    },

    // IPFS / Decentralized Storage
    ipfs: {
        apiKey: optionalEnv("IPFS_API_KEY"),
        apiSecret: optionalEnv("IPFS_API_SECRET"),
        gatewayUrl: optionalEnv("IPFS_GATEWAY_URL"),
    },

    // Block Explorer
    basescanApiKey: optionalEnv("BASESCAN_API_KEY"),

    // Contract addresses (populated after deploy)
    contracts: loadAddresses(),
} as const;

// Re-export helpers for use in deploy scripts
export { requireEnv, optionalEnv, ROOT };
