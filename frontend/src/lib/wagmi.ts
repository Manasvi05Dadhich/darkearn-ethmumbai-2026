import { http } from "wagmi";
import { baseSepolia } from "wagmi/chains";
import { getDefaultConfig } from "@rainbow-me/rainbowkit";

export const config = getDefaultConfig({
    appName: "DarkEarn",
    projectId: "74e7e957d871a334bbc483f8f71e7480",
    chains: [baseSepolia],
    transports: {
        [baseSepolia.id]: http("https://sepolia.base.org"),
    },
});
