import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
    appName: "DarkEarn",
    projectId: "darkearn-local-dev", // Replace with WalletConnect project ID for production
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http("https://sepolia.base.org"),
    },
});
