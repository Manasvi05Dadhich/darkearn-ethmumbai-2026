import type { FC, ReactNode } from "react";
import { WagmiProvider } from "wagmi";
import { RainbowKitProvider, darkTheme } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { config } from "../lib/wagmi";

import "@rainbow-me/rainbowkit/styles.css";

const queryClient = new QueryClient();

export const WalletProvider: FC<{ children: ReactNode }> = ({ children }) => (
    <WagmiProvider config={config}>
        <QueryClientProvider client={queryClient}>
            <RainbowKitProvider
                theme={darkTheme({
                    accentColor: "#e8ff00",
                    accentColorForeground: "#000",
                    borderRadius: "small",
                    fontStack: "system",
                })}
            >
                {children}
            </RainbowKitProvider>
        </QueryClientProvider>
    </WagmiProvider>
);
