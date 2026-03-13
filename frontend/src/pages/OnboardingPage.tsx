import { useState, type FC, type MouseEvent } from "react";
import { Info, ExternalLink, ArrowRight, CheckCircle2, Shield, Loader2 } from "lucide-react";

// Navbar layout inside onboarding (so it looks like part of the site)
const OnboardingNavbar: FC<{ step: 1 | 2; onBack?: () => void }> = ({ step, onBack }) => (
    <nav className="absolute top-0 left-0 right-0 z-50 border-b border-black/50 bg-[#060606]/95 backdrop-blur">
        <div className="w-full px-4 md:px-8 flex items-center justify-between" style={{ height: 56 }}>
            {step === 2 ? (
                <>
                    <button
                        onClick={onBack}
                        className="w-8 h-8 flex items-center justify-center rounded-lg bg-transparent border-none cursor-pointer"
                        style={{ color: "#fff", fontFamily: "inherit" }}
                    >
                        <ArrowRight className="w-4 h-4" style={{ transform: "rotate(180deg)" }} />
                    </button>
                    <span className="font-bold text-white text-[14px]">Onboarding</span>
                    <div className="w-8 h-8" />
                </>
            ) : (
                <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                    <span className="font-bold text-white tracking-widest text-[16px] uppercase font-sans">DARKEARN</span>
                </div>
            )}
        </div>
    </nav>
);

const OnboardingPage: FC = () => {
    const [step, setStep] = useState<1 | 2>(1);
    const [ensName, setEnsName] = useState("");
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [isMinting, setIsMinting] = useState(false);
    const [isMinted, setIsMinted] = useState(false);

    const handleVerify = () => {
        if (!ensName.includes('.eth') && ensName.length > 0) {
            return;
        }
        if (ensName) {
            setIsVerifying(true);
            setTimeout(() => {
                setIsVerifying(false);
                setIsVerified(true);
            }, 1500);
        }
    };

    const handleMint = () => {
        setIsMinting(true);
        setTimeout(() => {
            setIsMinting(false);
            setIsMinted(true);
        }, 2000);
    };

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#060606] text-white font-sans overflow-x-hidden relative">
            <style>{`
               .bg-grid {
                 background-size: 40px 40px;
                 background-image: 
                   linear-gradient(to right, rgba(232, 255, 0, 0.04) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(232, 255, 0, 0.04) 1px, transparent 1px);
               }
               .onboarding-card {
                 background: rgba(10, 10, 10, 0.97);
                 border: 1px solid #1a1a1a;
                 border-radius: 16px;
                 backdrop-filter: blur(20px);
               }
               .ens-input:focus {
                 border-color: rgba(232, 255, 0, 0.5) !important;
                 box-shadow: 0 0 0 2px rgba(232, 255, 0, 0.08);
               }
               .verify-btn:hover:not(:disabled) {
                 box-shadow: 0 0 30px rgba(232, 255, 0, 0.25);
                 transform: translateY(-1px);
               }
               .next-btn:hover:not(:disabled) {
                 box-shadow: 0 0 20px rgba(232, 255, 0, 0.2);
                 transform: translateY(-1px);
               }
               .info-box {
                 border: 1.5px solid #f59e0b;
                 background: rgba(245, 158, 11, 0.04);
                 border-radius: 12px;
               }
               .info-box:hover {
                 background: rgba(245, 158, 11, 0.07);
               }
               @keyframes fadeSlideIn {
                 from { opacity: 0; transform: translateY(6px); }
                 to { opacity: 1; transform: translateY(0); }
               }
               .verified-msg {
                 animation: fadeSlideIn 0.4s ease;
               }
               .progress-glow {
                 box-shadow: 0 0 12px rgba(232, 255, 0, 0.3);
               }
            `}</style>

            <OnboardingNavbar step={step} onBack={() => setStep(1)} />

            {/* Background identical to login */}
            <div className="absolute inset-0 bg-grid w-full h-full pointer-events-none z-0" />
            <div className="absolute inset-0 pointer-events-none z-0"
                style={{ background: "radial-gradient(circle at 50% 50%, transparent 0%, #060606 80%)" }} />

            <div className="relative z-10 w-full flex flex-col flex-1 items-center justify-center pt-28 pb-16 px-6">
                {/* Centered single-column content area */}
                <div className={`w-full ${step === 2 ? "max-w-6xl" : "max-w-xl"} flex flex-col`}>

                    {/* Progress Bar Section */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-3">
                            <span className="font-bold tracking-widest text-[12px] uppercase" style={{ color: "#e8ff00" }}>STEP {step} OF 2</span>
                            <span className="text-[12px] font-medium uppercase tracking-wider" style={{ color: "#888" }}>{step === 1 ? '50%' : '100%'} Complete</span>
                        </div>
                        <div className="w-full h-[6px] rounded-full overflow-hidden flex" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
                            <div className="h-full transition-all duration-700 ease-in-out rounded-full progress-glow" style={{ width: step === 1 ? "50%" : "100%", background: "#e8ff00" }} />
                        </div>
                    </div>

                    {step === 1 ? (
                        <div className="flex flex-col">
                            {/* Title & Subtitle */}
                            <div className="mb-10">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                                    Your Identity on <span style={{ color: "#e8ff00" }}>DarkEarn</span>
                                </h1>
                                <p className="text-[14px] md:text-[15px] leading-relaxed font-medium max-w-md" style={{ color: "#999" }}>
                                    Connect your decentralized identity to begin your journey into the dark yield ecosystem.
                                </p>
                            </div>

                            {/* ENS Input Section */}
                            <div className="mb-5 flex flex-col gap-3">
                                <label className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#ccc" }}>ENS NAME</label>
                                <div className="relative">
                                    <input
                                        type="text"
                                        placeholder="Enter your ENS name e.g. alice.eth"
                                        value={ensName}
                                        onChange={(e) => { setEnsName(e.target.value); setIsVerified(false); }}
                                        className="ens-input w-full bg-[#060606] text-white text-[14px] px-5 py-4 rounded-lg outline-none transition-all"
                                        style={{ border: isVerified ? "1.5px solid #22c55e" : ensName ? "1.5px solid rgba(232, 255, 0, 0.3)" : "1.5px solid #222" }}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                        {isVerifying ? (
                                            <Loader2 className="w-5 h-5 animate-spin text-zinc-500" />
                                        ) : isVerified ? (
                                            <CheckCircle2 className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Shield className="w-5 h-5" style={{ color: "#555" }} />
                                        )}
                                    </div>
                                </div>
                                {/* Verified confirmation */}
                                {isVerified && (
                                    <div className="verified-msg flex items-center gap-2 mt-2">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                        <span className="text-[13px] font-semibold" style={{ color: "#22c55e" }}>{ensName} verified.</span>
                                    </div>
                                )}
                            </div>

                            {/* Verify Button */}
                            <button
                                onClick={handleVerify}
                                disabled={isVerified || !ensName || isVerifying}
                                className="verify-btn w-full font-bold text-[14px] py-4 rounded-lg uppercase tracking-wider mb-6 transition-all border-none cursor-pointer"
                                style={{
                                    background: isVerified ? "#22c55e" : (ensName ? "#e8ff00" : "#1a1a1a"),
                                    color: isVerified ? "#fff" : (ensName ? "#000" : "#555"),
                                    cursor: isVerified || !ensName || isVerifying ? "not-allowed" : "pointer",
                                    boxShadow: ensName && !isVerified ? "0 0 15px rgba(232, 255, 0, 0.15)" : "none"
                                }}
                            >
                                {isVerifying ? "Checking ENS Registry..." : isVerified ? "Verified ✓" : "Verify"}
                            </button>

                            {/* Info Box - Amber ENS Info */}
                            {!isVerified && (
                                <div className="info-box p-5 mb-8 transition-colors">
                                    <div className="flex gap-4">
                                        <Info className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                                        <div className="flex flex-col gap-1.5">
                                            <h4 className="font-bold text-[13px] text-white">Don't have an ENS name?</h4>
                                            <p className="text-[12px] leading-relaxed" style={{ color: "#a08a6a" }}>
                                                You need an ENS name to use DarkEarn. ENS names cost ~$5/year and take 2 minutes.
                                            </p>
                                            <a
                                                href="https://app.ens.domains"
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 font-bold text-[12px] uppercase tracking-widest mt-2 hover:opacity-80 transition-opacity cursor-pointer"
                                                style={{ color: "#f59e0b" }}
                                            >
                                                Get an ENS Name <ExternalLink className="w-3.5 h-3.5" />
                                            </a>
                                            <p className="text-[11px] mt-1" style={{ color: "#777" }}>
                                                Already got one? Enter it above.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Spacer to push Next Step to bottom */}
                            <div className="flex-1" />

                            {/* Next Step Button */}
                            <button
                                onClick={() => setStep(2)}
                                disabled={!isVerified}
                                className="next-btn w-full font-bold text-[14px] py-4 rounded-lg transition-all flex items-center justify-center gap-2 uppercase tracking-wide border-none"
                                style={{
                                    background: isVerified ? "#e8ff00" : "#111",
                                    color: isVerified ? "#000" : "#444",
                                    cursor: isVerified ? "pointer" : "not-allowed"
                                }}
                            >
                                Next Step <ArrowRight className="w-4 h-4" />
                            </button>

                            <p className="text-center mt-4 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#555" }}>
                                SECURE DECENTRALIZED VERIFICATION
                            </p>
                        </div>
                    ) : (
                        <div className="flex flex-col">
                            <div className="mb-6">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-[12px] font-bold text-white">Profile Creation</span>
                                    <span className="text-[12px] font-bold text-white">Step 2 of 2</span>
                                </div>
                                <div className="w-full h-[4px] rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                                    <div className="h-full w-full" style={{ background: "#e8ff00" }} />
                                </div>
                            </div>

                            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-10 text-center">
                                Create Your Profile
                            </h1>

                            <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-10 items-start min-h-[260px] mb-10">
                                <div className="flex flex-col gap-6">
                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: "#e8ff00", boxShadow: "0 0 16px rgba(232,255,0,0.35)" }}>
                                                <div className="w-3 h-3 rounded-full border-2" style={{ borderColor: "#060606" }} />
                                            </div>
                                            <div className="w-px flex-1 mt-2" style={{ background: "#333", minHeight: 28 }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[16px]" style={{ color: "#e8ff00" }}>Band 0 (Current)</h3>
                                            <p className="text-[12px] mt-1 font-medium" style={{ color: "#e8ff00" }}>Initial entry point for all new agents.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#555" }}>
                                                <div className="w-3 h-3 rounded-full border" style={{ borderColor: "#555" }} />
                                            </div>
                                            <div className="w-px flex-1 mt-2" style={{ background: "#333", minHeight: 28 }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-white">Band 1</h3>
                                            <p className="text-[12px] mt-1 font-medium" style={{ color: "#64748b" }}>Unlock with 10 completed bounties.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#555" }}>
                                                <div className="w-3 h-3 rounded-full border" style={{ borderColor: "#555" }} />
                                            </div>
                                            <div className="w-px flex-1 mt-2" style={{ background: "#333", minHeight: 28 }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-white">Band 2</h3>
                                            <p className="text-[12px] mt-1 font-medium" style={{ color: "#64748b" }}>Requires 50 verified bounty proofs.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="relative flex flex-col items-center">
                                            <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#555" }}>
                                                <div className="w-3 h-3 rounded-full border" style={{ borderColor: "#555" }} />
                                            </div>
                                            <div className="w-px flex-1 mt-2" style={{ background: "#333", minHeight: 28 }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-white">Band 3</h3>
                                            <p className="text-[12px] mt-1 font-medium" style={{ color: "#64748b" }}>Elite status. 100+ bounty threshold.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-4">
                                        <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#555" }}>
                                            <div className="w-3 h-3 rounded-full border" style={{ borderColor: "#555" }} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-white">Band 4 (Apex)</h3>
                                            <p className="text-[12px] mt-1 font-medium" style={{ color: "#64748b" }}>Master level. 500+ successful operations.</p>
                                        </div>
                                    </div>
                                </div>

                                <div />
                            </div>

                            {!isMinted ? (
                                <button
                                    onClick={handleMint}
                                    disabled={isMinting}
                                    className="w-full font-bold text-[14px] py-4 rounded-md transition-all flex items-center justify-center gap-3 uppercase tracking-wider outline-none border-none cursor-pointer mb-4"
                                    style={{
                                        background: "#e8ff00",
                                        color: "#000",
                                        cursor: isMinting ? "not-allowed" : "pointer",
                                        boxShadow: "0 0 20px rgba(232,255,0,0.15)",
                                        fontFamily: "inherit"
                                    }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!isMinting) { e.currentTarget.style.transform = "translateY(-1px)"; } }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(0)"; }}
                                >
                                    {isMinting ? "Generating ZK Proof..." : "Mint My Profile"}
                                    {isMinting && <Loader2 className="w-5 h-5 animate-spin" />}
                                </button>
                            ) : null}

                            {isMinted && (
                                <div className="verified-msg flex flex-col border p-8 rounded-lg items-center mt-2" style={{ background: "rgba(232,255,0,0.03)", borderColor: "#2a2a2a" }}>
                                    <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ background: "rgba(232,255,0,0.1)" }}>
                                        <CheckCircle2 className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                    </div>
                                    <h3 className="text-[15px] font-bold text-white mb-1">Profile created.</h3>
                                    <p className="text-[13px] mb-8 text-center" style={{ color: "#e8ff00" }}>
                                        You are now <span className="font-bold">{ensName || "alice.eth"}</span> on DarkEarn.
                                    </p>

                                    <div className="flex flex-col gap-3 w-full">
                                        <button
                                            className="w-full font-bold text-[13px] py-3 rounded-sm uppercase tracking-wider transition-all cursor-pointer border-none"
                                            style={{ background: "#2a2a00", color: "#e8ff00", border: "1px solid #4a4a00", fontFamily: "inherit" }}
                                        >
                                            Browse Bounties
                                        </button>
                                        <button
                                            className="w-full font-bold text-[13px] py-3 rounded-sm uppercase tracking-wider transition-all cursor-pointer"
                                            style={{ background: "transparent", color: "#60a5fa", border: "1px solid #1f2937", fontFamily: "inherit" }}
                                        >
                                            Post a Bounty
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
