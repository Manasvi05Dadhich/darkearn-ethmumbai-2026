import { useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAccount } from "wagmi";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { Megaphone, Search } from "lucide-react";
import {
    setStoredRole,
    setHunterDisplayName,
    generateHunterName,
} from "../../lib/roleStorage";
import { useReputationNFT } from "../../hooks/useReputationNFT";
import { theme } from "../../theme";
import logo from "../../assets/logo.png";

const t = theme;

export default function ChooseRole() {
    const navigate = useNavigate();
    const { isConnected, address } = useAccount();
    const { hasNFT, isLoading } = useReputationNFT(address);

    useEffect(() => {
        if (isLoading) return;
        if (isConnected && hasNFT) {
            navigate("/", { replace: true });
        }
    }, [isConnected, hasNFT, isLoading, navigate]);

    const handlePoster = () => {
        setStoredRole("poster");
        navigate("/onboarding", { replace: true });
    };

    const handleHunter = () => {
        const name = generateHunterName();
        setStoredRole("hunter");
        setHunterDisplayName(name);
        navigate("/onboarding", { replace: true });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-black text-white">
                <div className="w-8 h-8 border-2 rounded-full animate-spin" style={{ borderColor: t.color.accent, borderTopColor: "transparent" }} />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-black text-white relative overflow-hidden">
            {/* Dotted grid background */}
            <div
                className="absolute inset-0 opacity-30"
                style={{
                    backgroundSize: "24px 24px",
                    backgroundImage: "radial-gradient(circle, #333 1px, transparent 1px)",
                }}
            />

            {/* Nav */}
            <nav className="absolute top-0 left-0 right-0 z-20 border-b border-white/10 py-4 px-6">
                <div className="max-w-6xl mx-auto flex items-center justify-between">
                    <Link to="/" className="flex items-center gap-2 no-underline">
                        <img src={logo} alt="DarkEarn" className="h-8 w-auto" />
                    </Link>
                    <div className="flex items-center gap-6">
                        <Link to="/how-it-works" className="text-sm font-medium no-underline transition-colors hover:opacity-80" style={{ color: "rgba(255,255,255,0.8)" }}>
                            How It Works
                        </Link>
                        <Link to="/" className="text-sm font-bold uppercase tracking-wider no-underline" style={{ color: t.color.accent }}>
                            Browse Bounties
                        </Link>
                    </div>
                </div>
            </nav>

            <div className="relative z-10 w-full max-w-6xl px-6 py-12 flex flex-col items-center">
                {!isConnected ? (
                    <div className="text-center">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                            Connect to choose your role
                        </h1>
                        <p className="text-gray-400 mb-8 text-lg">
                            Connect your wallet to continue as Poster or Hunter.
                        </p>
                        <ConnectButton.Custom>
                            {({ openConnectModal }) => (
                                <button
                                    onClick={openConnectModal}
                                    className="px-8 py-4 rounded-lg font-bold transition-colors"
                                    style={{ background: t.color.accent, color: "#000" }}
                                >
                                    Connect Wallet
                                </button>
                            )}
                        </ConnectButton.Custom>
                    </div>
                ) : (
                    <>
                        {/* Header */}
                        <header className="text-center mb-16">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                                How will you use <span style={{ color: t.color.accent }}>DarkEarn</span>?
                            </h1>
                            <p className="text-white/80 text-lg">
                                Select your primary role to continue to the dashboard.
                            </p>
                        </header>

                        {/* Cards */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-5xl">
                            {/* Poster Card */}
                            <section
                                className="p-10 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(232,255,0,0.15)]"
                                style={{
                                    background: "#1A1A1A",
                                    border: "1px solid #2a2a2a",
                                }}
                            >
                                <div
                                    className="mb-6 w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: t.color.accentSubtle }}
                                >
                                    <Megaphone className="w-10 h-10" style={{ color: t.color.accent }} strokeWidth={2} />
                                </div>

                                <h2 className="text-3xl font-bold mb-4 text-white">Poster</h2>

                                <p className="text-white/90 mb-2 leading-relaxed">
                                    I want to post jobs and find talent.
                                </p>
                                <p className="text-white/60 text-sm mb-8">
                                    Requires ENS identity for verification.
                                </p>

                                <button
                                    onClick={handlePoster}
                                    className="w-full py-4 bg-white text-black font-bold rounded-lg hover:opacity-90 transition-opacity"
                                >
                                    Continue as Poster
                                </button>
                            </section>

                            {/* Hunter Card */}
                            <section
                                className="p-10 rounded-2xl flex flex-col items-center text-center transition-all duration-300 hover:shadow-[0_0_20px_rgba(232,255,0,0.15)]"
                                style={{
                                    background: "#1A1A1A",
                                    border: "1px solid #2a2a2a",
                                }}
                            >
                                <div
                                    className="mb-6 w-20 h-20 rounded-full flex items-center justify-center"
                                    style={{ background: t.color.accentSubtle }}
                                >
                                    <Search className="w-10 h-10" style={{ color: t.color.accent }} strokeWidth={2} />
                                </div>

                                <h2 className="text-3xl font-bold mb-4 text-white">Hunter</h2>

                                <p className="text-white/90 mb-2 leading-relaxed">
                                    I want to earn privately and complete tasks.
                                </p>
                                <p className="text-white/60 text-sm mb-8">
                                    Fully anonymous with random username.
                                </p>

                                <button
                                    onClick={handleHunter}
                                    className="w-full py-4 font-bold rounded-lg hover:brightness-110 transition-all"
                                    style={{ background: t.color.accent, color: "#000" }}
                                >
                                    Continue as Hunter
                                </button>
                            </section>
                        </div>

                        {/* Footer */}
                        <footer className="mt-12 text-center">
                            <p className="text-gray-500 text-sm">
                                You can switch between roles later in your profile settings.
                            </p>
                        </footer>
                    </>
                )}
            </div>
        </div>
    );
}
