import { useAccount, useDisconnect } from "wagmi";
import { BrowserRouter, Routes, Route, useNavigate, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { Toaster } from "sonner";
import { theme } from "./theme";

const t = theme;
import LoginPage from "./pages/LoginPage";
import ChooseRole from "./pages/Onboarding/chooseRole";
import OnboardingPage from "./pages/OnboardingPage";
import BountyBoard from "./pages/BountyBoard";
import DashboardPage from "./pages/dashboard/index";
import PublicProfile from "./pages/PublicProfile";
import HowItWorks from "./pages/HowItWorks";
import { useReputationNFT } from "./hooks/useReputationNFT";

function AppContent() {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();
    const { hasNFT, isLoading } = useReputationNFT(address);

    useEffect(() => {
        if (!isLoading && isConnected && !hasNFT) {
            navigate("/choose-role", { replace: true });
            // navigate("/create-skill", { replace: true});
        }
        // }
    }, [isLoading, isConnected, hasNFT, navigate]);

    const activePage =
        !isConnected ? "login" :
        isLoading ? "loading" :
        !hasNFT ? "loading" :
        "bounties";

    if (activePage === "loading") {
        return (
            <div className="min-h-screen flex items-center justify-center" style={{ background: t.color.background.primary }}>
                <div className="text-center">
                    <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: t.color.accent }} />
                    <p className="text-sm mb-4" style={{ color: t.color.text.secondary }}>Checking reputation...</p>
                    <button
                        onClick={() => disconnect()}
                        className="text-xs underline cursor-pointer bg-transparent border-none"
                        style={{ color: t.color.text.muted, fontFamily: "inherit" }}
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
                        background: t.color.surface.card,
                        border: `1px solid ${t.color.border.default}`,
                        color: t.color.text.primary,
                    },
                }}
            />
            <Routes>
                <Route path="/profile/:ensName" element={<PublicProfile />} />
                <Route path="/how-it-works" element={<HowItWorks />} />
                <Route path="/dashboard" element={<DashboardPage />} />
                <Route path="/choose-role" element={<ChooseRole />} />
                <Route path="/chooseRoles" element={<Navigate to="/choose-role" replace />} />
                <Route path="/create-skill" element={<Navigate to="/choose-role" replace />} />
                <Route path="/onboarding" element={<OnboardingPage />} />
                <Route path="*" element={<AppContent />} />
            </Routes>
        </BrowserRouter>
    );
}

export default App;
