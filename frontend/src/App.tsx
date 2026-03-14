import { useState } from "react";
import { useAccount, useDisconnect } from "wagmi";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import BountyBoard from "./pages/BountyBoard";
import DashboardPage from "./pages/dashboard/index";
import { useReputationNFT } from "./hooks/useReputationNFT";

type PageType = "login" | "onboarding" | "bounties" | "dashboard";

function App() {
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const { hasNFT, isLoading } = useReputationNFT(address);
    const [currentPage, setCurrentPage] = useState<PageType | null>(null);

    // Auto-route based on wallet state (only if user hasn't manually navigated)
    const activePage = currentPage ?? (
        !isConnected ? "login" :
        isLoading ? "loading" :
        !hasNFT ? "onboarding" :
        "bounties"
    );

    if (activePage === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060606]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#e8ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#888] text-sm mb-4">Checking reputation...</p>
                    <button
                        onClick={() => disconnect()}
                        className="text-xs text-[#555] underline cursor-pointer bg-transparent border-none"
                        style={{ fontFamily: "inherit" }}
                    >
                        Disconnect wallet
                    </button>
                </div>
            </div>
        );
    }

    return (
        <>
            {/* Dev Navigation Bar — always visible */}
            <div className="fixed bottom-4 right-4 z-[9999] flex gap-1.5 bg-zinc-900/95 border border-zinc-800 p-2 rounded-lg shadow-2xl backdrop-blur">
                {(["login", "onboarding", "bounties", "dashboard"] as PageType[]).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-[10px] font-bold rounded cursor-pointer border-none uppercase tracking-wider ${activePage === page ? 'bg-[#e8ff00] text-black' : 'text-[#888] hover:text-white hover:bg-zinc-800'}`}
                        style={{ fontFamily: "inherit" }}
                    >
                        {page}
                    </button>
                ))}
                {isConnected && (
                    <button
                        onClick={() => { disconnect(); setCurrentPage("login"); }}
                        className="px-3 py-1.5 text-[10px] font-bold rounded cursor-pointer border-none text-red-400 hover:bg-zinc-800 uppercase tracking-wider"
                        style={{ fontFamily: "inherit" }}
                    >
                        ✕
                    </button>
                )}
            </div>

            {activePage === "login" && <LoginPage />}
            {activePage === "onboarding" && <OnboardingPage />}
            {activePage === "bounties" && <BountyBoard />}
            {activePage === "dashboard" && <DashboardPage />}
        </>
    );
}

export default App;
