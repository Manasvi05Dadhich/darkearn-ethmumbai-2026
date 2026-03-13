import { useState } from "react";
import { useAccount } from "wagmi";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import BountyBoard from "./pages/BountyBoard";
import DashboardPage from "./pages/dashboard/index";
import { useReputationNFT } from "./hooks/useReputationNFT";

type PageType = "bounties" | "dashboard";

function App() {
    const { isConnected, address } = useAccount();
    const { hasNFT, band, isLoading } = useReputationNFT(address);
    const [currentPage, setCurrentPage] = useState<PageType>("bounties");

    // Not connected → show login
    if (!isConnected) {
        return <LoginPage />;
    }

    // Connected but loading NFT check
    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060606]">
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-[#e8ff00] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[#888] text-sm">Checking reputation...</p>
                </div>
            </div>
        );
    }

    // Connected but no NFT → onboarding
    if (!hasNFT) {
        return <OnboardingPage />;
    }

    // Connected + has NFT → main app
    return (
        <>
            {/* Dev Navigation Bar */}
            <div className="fixed bottom-4 right-4 z-[9999] flex gap-2 bg-zinc-900 border border-zinc-800 p-2 rounded-lg shadow-2xl">
                {(["bounties", "dashboard"] as PageType[]).map((page) => (
                    <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1.5 text-xs font-bold rounded cursor-pointer border-none ${currentPage === page ? 'bg-[#e8ff00] text-black' : 'text-white hover:bg-zinc-800'}`}
                        style={{ fontFamily: "inherit" }}
                    >
                        {page.charAt(0).toUpperCase() + page.slice(1)}
                    </button>
                ))}
            </div>

            {currentPage === "bounties" && <BountyBoard />}
            {currentPage === "dashboard" && <DashboardPage />}
        </>
    );
}

export default App;
