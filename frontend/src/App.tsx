import { useAccount, useDisconnect } from "wagmi";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import LoginPage from "./pages/LoginPage";
import OnboardingPage from "./pages/OnboardingPage";
import BountyBoard from "./pages/BountyBoard";
import PublicProfile from "./pages/PublicProfile";
import HowItWorks from "./pages/HowItWorks";
import { useReputationNFT } from "./hooks/useReputationNFT";

function AppContent() {
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const { hasNFT, isLoading } = useReputationNFT(address);

    const activePage =
        !isConnected ? "login" :
        isLoading ? "loading" :
        !hasNFT ? "onboarding" :
        "bounties";

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
            {activePage === "login" && <LoginPage />}
            {activePage === "onboarding" && <OnboardingPage />}
            {activePage === "bounties" && <BountyBoard />}
        </>
    );
}

function App() {
    return (
        <BrowserRouter>
            <Toaster
                theme="dark"
                position="bottom-right"
                toastOptions={{
                    style: {
                        background: "#0a0a0a",
                        border: "1px solid #1a1a1a",
                        color: "#fff",
                    },
                }}
            />
            <Routes>
                <Route path="/profile/:ensName" element={<PublicProfile />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="*" element={<AppContent />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
