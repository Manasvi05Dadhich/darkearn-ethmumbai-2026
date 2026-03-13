import { BitGoAPI } from "@bitgo/sdk-api";
import { Hteth } from "@bitgo/sdk-coin-eth";
import { config } from "./config.js";

let bitgoInstance: BitGoAPI | null = null;

/**
 * Get or create the singleton BitGo SDK instance.
 */
export function getBitgo(): BitGoAPI {
    if (!bitgoInstance) {
        if (!config.BITGO_ACCESS_TOKEN) {
            throw new Error("BITGO_ACCESS_TOKEN is not set in .env");
        }

        bitgoInstance = new BitGoAPI({
            accessToken: config.BITGO_ACCESS_TOKEN,
            env: config.BITGO_ENV,
        });

        // Register the Holesky testnet ETH coin
        bitgoInstance.register(config.BITGO_COIN, Hteth.createInstance);
    }

    return bitgoInstance;
}

/**
 * Get the coin instance for hteth.
 */
export function getCoin() {
    return getBitgo().coin(config.BITGO_COIN);
}

/**
 * Get a wallet by its ID.
 */
export async function getWallet(walletId: string) {
    const coin = getCoin();
    return coin.wallets().get({ id: walletId });
}
