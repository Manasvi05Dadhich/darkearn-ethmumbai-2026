import { startWebhookServer } from "./webhookServer.js";
import { startApiServer } from "./apiServer.js";
import { startEventListener } from "./eventListener.js";
import { config } from "./config.js";

console.log("=== DarkEarn BitGo Service ===");
console.log(`ReputationNFT: ${config.REPUTATION_NFT_ADDRESS}`);
console.log(`BountyEscrow:  ${config.BOUNTY_ESCROW_ADDRESS}`);
console.log(`Base Sepolia:  ${config.BASE_SEPOLIA_RPC_URL}`);
console.log("");

// 1. Start webhook server (receives BitGo policy callbacks)
const webhookServer = startWebhookServer();

// 2. Start API server (frontend calls these endpoints)
const apiServer = startApiServer();

// 3. Start event listener (watches BountyEscrow on-chain events)
startEventListener();

// Graceful shutdown
process.on("SIGINT", () => {
    console.log("\nShutting down...");
    webhookServer.close();
    apiServer.close();
    process.exit(0);
});

process.on("SIGTERM", () => {
    console.log("\nShutting down...");
    webhookServer.close();
    apiServer.close();
    process.exit(0);
});
