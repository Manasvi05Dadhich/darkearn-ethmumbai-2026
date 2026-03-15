import { useState, useEffect, type FC, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Info, ExternalLink, CheckCircle2, Shield, Loader2, Briefcase, Search, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../contracts";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { generateReputationProof, computeExpectedBand, MOCK_ZK } from "../lib/zkProver";
import { toast } from "sonner";
import { getStoredRole, getHunterDisplayName, setHunterDisplayName, generateHunterName, clearRoleStorage } from "../lib/roleStorage";
import { useReputationNFT } from "../hooks/useReputationNFT";

const OnboardingPage: FC = () => {
    const navigate = useNavigate();
    const { address } = useAccount();
    const { hasNFT, isLoading } = useReputationNFT(address);
    const role = getStoredRole();
    const isHunter = role === "hunter";

    const { writeContract, data: txHash, isPending: isMinting, error: mintError } = useWriteContract();
    const { isSuccess: mintTxSuccess } = useWaitForTransactionReceipt({ hash: txHash });
    const isMinted = mintTxSuccess;

    useEffect(() => {
        if (isLoading) return;
        if (hasNFT && !isMinted) {
            navigate("/", { replace: true });
            return;
        }
        if (!role) {
            navigate("/choose-role", { replace: true });
        }
    }, [hasNFT, isLoading, role, navigate, isMinted]);

    const [ensName, setEnsName] = useState("");
    const [hunterName, setHunterName] = useState(() => getHunterDisplayName() || generateHunterName());
    const [isVerifying, setIsVerifying] = useState(false);
    const [isVerified, setIsVerified] = useState(false);
    const [verifyError, setVerifyError] = useState("");
    const [mintMode, setMintMode] = useState<"zk" | "test">("zk");
    const [proving, setProving] = useState(false);
    const [proofReady, setProofReady] = useState(false);
    const [proofHex, setProofHex] = useState<`0x${string}` | null>(null);
    const [publicInputs, setPublicInputs] = useState<`0x${string}`[]>([]);

    const displayName = isHunter ? hunterName : ensName;
    const { data: existingTokenId } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "ensToTokenId",
        args: [displayName],
        query: { enabled: isVerifying && (isHunter ? !!hunterName : ensName.includes(".eth")) },
    });

    useEffect(() => {
        if (isHunter && hunterName) setHunterDisplayName(hunterName);
    }, [isHunter, hunterName]);

    useEffect(() => {
        if (!isVerifying) return;
        if (existingTokenId !== undefined) {
            setIsVerifying(false);
            if (existingTokenId && BigInt(existingTokenId as bigint) > 0n) {
                setVerifyError(isHunter ? "This username is already taken. Try regenerating." : "This ENS name is already registered on DarkEarn.");
                setIsVerified(false);
            } else {
                setIsVerified(true);
                setVerifyError("");
            }
        }
    }, [existingTokenId, isVerifying]);

    const handleVerify = () => {
        if (isHunter) {
            if (!hunterName) return;
            setVerifyError("");
            setIsVerifying(true);
            return;
        }
        if (!ensName.includes(".eth")) {
            setVerifyError("Must be a valid .eth name");
            return;
        }
        setVerifyError("");
        setIsVerifying(true);
    };

    const handleRegenerateHunterName = () => {
        const newName = generateHunterName();
        setHunterName(newName);
        setHunterDisplayName(newName);
        setIsVerified(false);
        setVerifyError("");
    };

    const handleGenerateProof = async () => {
        setProving(true);
        try {
            console.log("[ZK] Starting proof generation...");
            const result = await generateReputationProof({
                darkearn_completions: 0,
                darkearn_approval_rate: 0,
                darkearn_dispute_rate: 0,
                darkearn_account_age_days: 1,
            });
            console.log("[ZK] Proof generated successfully");
            setProofHex(result.proofHex);
            setPublicInputs(result.publicInputsBytes32);
            setProofReady(true);
            toast.success(`ZK proof generated — Band ${computeExpectedBand({ darkearn_completions: 0, darkearn_approval_rate: 0, darkearn_dispute_rate: 0, darkearn_account_age_days: 1 })}`);
        } catch (err: unknown) {
            const e = err as Error;
            const msg = e?.message || String(err);
            const stack = e?.stack || "";
            console.error("[ZK] Proof generation failed:", msg);
            console.error("[ZK] Stack:", stack);
            toast.error(`ZK failed: ${msg.slice(0, 120)}`);
            setMintMode("test");
        }
        setProving(false);
    };

    const handleMint = () => {
        if (!address) return;

        const band = publicInputs[0] ? BigInt(publicInputs[0]) : 0n;

        if (mintMode === "zk" && proofReady && proofHex && !MOCK_ZK) {
            writeContract({
                ...CONTRACTS.ReputationNFT,
                functionName: "mint",
                args: [proofHex, publicInputs, displayName],
            });
        } else {
            writeContract({
                ...CONTRACTS.ReputationNFT,
                functionName: "testMint",
                args: [address, displayName, band],
            });
        }
    };

    const canMint = isVerified && (mintMode === "test" || proofReady);

    if (isLoading || !role) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060606]">
                <div className="w-8 h-8 border-2 border-[#e8ff00] border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col items-center bg-[#060606] text-white font-sans overflow-x-hidden relative">
            <style>{`
               .bg-grid {
                 background-size: 40px 40px;
                 background-image: 
                   linear-gradient(to right, rgba(232, 255, 0, 0.04) 1px, transparent 1px),
                   linear-gradient(to bottom, rgba(232, 255, 0, 0.04) 1px, transparent 1px);
               }
               .onboarding-card { background: rgba(10, 10, 10, 0.97); border: 1px solid #1a1a1a; border-radius: 16px; backdrop-filter: blur(20px); }
               .ens-input:focus { border-color: rgba(232, 255, 0, 0.5) !important; box-shadow: 0 0 0 2px rgba(232, 255, 0, 0.08); }
               .verify-btn:hover:not(:disabled) { box-shadow: 0 0 30px rgba(232, 255, 0, 0.25); transform: translateY(-1px); }
               .info-box { border: 1.5px solid #f59e0b; background: rgba(245, 158, 11, 0.04); border-radius: 12px; }
               .info-box:hover { background: rgba(245, 158, 11, 0.07); }
               @keyframes fadeSlideIn { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
               .verified-msg { animation: fadeSlideIn 0.4s ease; }
               .progress-glow { box-shadow: 0 0 12px rgba(232, 255, 0, 0.3); }
            `}</style>

            <nav className="absolute top-0 left-0 right-0 z-50 border-b border-black/50 bg-[#060606]/95 backdrop-blur">
                <div className="w-full px-4 md:px-8 flex items-center justify-between" style={{ height: 56 }}>
                    <div className="flex items-center gap-2">
                        <img src={logo} alt="DarkEarn" className="h-8 w-auto" />
                    </div>
                    <div className="flex items-center gap-4">
                        <button
                            type="button"
                            onClick={() => { clearRoleStorage(); navigate("/choose-role"); }}
                            className="text-xs text-[#888] hover:text-[#e8ff00] transition-colors cursor-pointer bg-transparent border-none"
                            style={{ fontFamily: "inherit" }}
                        >
                            Change role
                        </button>
                        <ConnectButton accountStatus="avatar" chainStatus="icon" showBalance={false} />
                    </div>
                </div>
            </nav>

            <div className="absolute inset-0 bg-grid w-full h-full pointer-events-none z-0" />
            <div
                className="absolute inset-0 pointer-events-none z-0"
                style={{ background: "radial-gradient(circle at 50% 50%, transparent 0%, #060606 80%)" }}
            />

            <div className="relative z-10 w-full flex flex-col flex-1 items-center justify-center pt-28 pb-16 px-6">
                <div className="w-full max-w-3xl flex flex-col">

                    {isMinted ? (
                        <div className="verified-msg flex flex-col gap-6">
                            {/* Step 2: Success + Next steps */}
                            <div
                                className="flex flex-col border p-8 rounded-lg items-center"
                                style={{ background: "rgba(232,255,0,0.03)", borderColor: "#2a2a2a" }}
                            >
                                <div
                                    className="w-10 h-10 rounded-lg flex items-center justify-center mb-4"
                                    style={{ background: "rgba(232,255,0,0.1)" }}
                                >
                                    <CheckCircle2 className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                </div>
                                <h3 className="text-[15px] font-bold text-white mb-1">Profile created.</h3>
                                <p className="text-[13px] mb-2 text-center" style={{ color: "#e8ff00" }}>
                                    You are now <span className="font-bold">{displayName}</span> on DarkEarn.
                                </p>
                                {mintMode === "zk" && (
                                    <p className="text-[11px] mb-4 text-center" style={{ color: "#22c55e" }}>
                                        Minted with verified ZK proof — Band 0
                                    </p>
                                )}
                            </div>

                            {/* Step 2: What's next */}
                            <div
                                className="border p-6 rounded-lg"
                                style={{ background: "rgba(10,10,10,0.8)", borderColor: "#1a1a1a" }}
                            >
                                <h4 className="text-[12px] font-bold tracking-[0.15em] uppercase mb-4" style={{ color: "#ccc" }}>
                                    Step 2 — What&apos;s next?
                                </h4>
                                <div className="flex flex-col sm:flex-row gap-3">
                                    <button
                                        type="button"
                                        onClick={() => navigate("/")}
                                        className="flex-1 flex items-center gap-3 px-5 py-4 rounded-lg border transition-all cursor-pointer text-left"
                                        style={{ background: "transparent", borderColor: "#222", fontFamily: "inherit" }}
                                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                            e.currentTarget.style.borderColor = "#e8ff00";
                                            e.currentTarget.style.background = "rgba(232,255,0,0.05)";
                                        }}
                                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                            e.currentTarget.style.borderColor = "#222";
                                            e.currentTarget.style.background = "transparent";
                                        }}
                                    >
                                        <Search className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                        <div>
                                            <p className="text-[13px] font-bold text-white">Browse Bounties</p>
                                            <p className="text-[11px]" style={{ color: "#666" }}>Find and apply to open tasks</p>
                                        </div>
                                    </button>
                                    {!isHunter && (
                                        <button
                                            type="button"
                                            onClick={() => navigate("/dashboard?tab=post-bounty")}
                                            className="flex-1 flex items-center gap-3 px-5 py-4 rounded-lg border transition-all cursor-pointer text-left"
                                            style={{ background: "transparent", borderColor: "#222", fontFamily: "inherit" }}
                                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                                e.currentTarget.style.borderColor = "#e8ff00";
                                                e.currentTarget.style.background = "rgba(232,255,0,0.05)";
                                            }}
                                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                                e.currentTarget.style.borderColor = "#222";
                                                e.currentTarget.style.background = "transparent";
                                            }}
                                        >
                                            <Briefcase className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                            <div>
                                                <p className="text-[13px] font-bold text-white">Post a Bounty</p>
                                                <p className="text-[11px]" style={{ color: "#666" }}>Create a task and find talent</p>
                                            </div>
                                        </button>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => navigate("/")}
                                    className="w-full mt-4 py-4 rounded-lg font-bold text-[14px] uppercase tracking-wider flex items-center justify-center gap-2 cursor-pointer border-none"
                                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "translateY(-1px)"}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => e.currentTarget.style.transform = "translateY(0)"}
                                >
                                    Enter Dashboard <ArrowRight className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="mb-8">
                                <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight mb-4 leading-tight">
                                    Create Your <span style={{ color: "#e8ff00" }}>DarkEarn</span> Profile
                                </h1>
                                <p className="text-[14px] leading-relaxed font-medium max-w-md" style={{ color: "#999" }}>
                                    {isHunter
                                        ? "Your anonymous identity is ready. Generate a ZK proof and mint your soulbound reputation NFT."
                                        : "Link your ENS identity, generate a ZK proof, and mint your soulbound reputation NFT."}
                                </p>
                            </div>

                            {/* ── HUNTER: RANDOM NAME ── */}
                            {isHunter && (
                                <div className="mb-6 flex flex-col gap-3">
                                    <label className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#ccc" }}>
                                        1. YOUR ANONYMOUS IDENTITY
                                    </label>
                                    <div className="flex gap-2 items-center">
                                        <div
                                            className="flex-1 px-5 py-3.5 rounded-lg text-[14px] font-mono"
                                            style={{ background: "#060606", border: "1.5px solid #222", color: "#e8ff00" }}
                                        >
                                            {hunterName}
                                        </div>
                                        <button
                                            onClick={handleRegenerateHunterName}
                                            className="px-4 py-3.5 rounded-lg text-[12px] font-bold uppercase tracking-wider cursor-pointer shrink-0"
                                            style={{
                                                background: "transparent",
                                                border: "1.5px solid #333",
                                                color: "#888",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            Regenerate
                                        </button>
                                    </div>
                                    <p className="text-[12px]" style={{ color: "#666" }}>
                                        Fully anonymous. No ENS required.
                                    </p>
                                    <button
                                        onClick={handleVerify}
                                        disabled={isVerified || !hunterName || isVerifying}
                                        className="verify-btn px-5 py-3 rounded-lg font-bold text-[12px] uppercase tracking-wider transition-all border-none cursor-pointer w-fit"
                                        style={{
                                            background: isVerified ? "#22c55e" : "#e8ff00",
                                            color: isVerified ? "#fff" : "#000",
                                            cursor: isVerified || !hunterName || isVerifying ? "not-allowed" : "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {isVerifying ? "..." : isVerified ? "✓ Available" : "Check availability"}
                                    </button>
                                </div>
                            )}

                            {/* ── POSTER: ENS NAME ── */}
                            {!isHunter && (
                            <div className="mb-6 flex flex-col gap-3">
                                <label className="text-[11px] font-bold tracking-[0.2em] uppercase" style={{ color: "#ccc" }}>
                                    1. ENS NAME (REQUIRED)
                                </label>
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input
                                            type="text"
                                            placeholder="alice.eth"
                                            value={ensName}
                                            onChange={(e) => {
                                                setEnsName(e.target.value);
                                                setIsVerified(false);
                                                setVerifyError("");
                                            }}
                                            className="ens-input w-full bg-[#060606] text-white text-[14px] px-5 py-3.5 rounded-lg outline-none transition-all"
                                            style={{
                                                border: isVerified
                                                    ? "1.5px solid #22c55e"
                                                    : ensName
                                                      ? "1.5px solid rgba(232, 255, 0, 0.3)"
                                                      : "1.5px solid #222",
                                            }}
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center">
                                            {isVerifying ? (
                                                <Loader2 className="w-4 h-4 animate-spin text-zinc-500" />
                                            ) : isVerified ? (
                                                <CheckCircle2 className="w-4 h-4 text-green-500" />
                                            ) : null}
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleVerify}
                                        disabled={isVerified || !ensName || isVerifying}
                                        className="verify-btn px-5 py-3.5 rounded-lg font-bold text-[12px] uppercase tracking-wider transition-all border-none cursor-pointer shrink-0"
                                        style={{
                                            background: isVerified ? "#22c55e" : ensName ? "#e8ff00" : "#1a1a1a",
                                            color: isVerified ? "#fff" : ensName ? "#000" : "#555",
                                            cursor: isVerified || !ensName || isVerifying ? "not-allowed" : "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {isVerifying ? "..." : isVerified ? "✓" : "Verify"}
                                    </button>
                                </div>

                                {isVerified && (
                                    <div className="verified-msg flex items-center gap-2">
                                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                        <span className="text-[12px] font-semibold" style={{ color: "#22c55e" }}>
                                            {ensName} is available
                                        </span>
                                    </div>
                                )}
                                {verifyError && (
                                    <span className="text-[12px] font-semibold" style={{ color: "#ef4444" }}>
                                        {verifyError}
                                    </span>
                                )}

                                {!isVerified && !verifyError && (
                                    <div className="info-box p-4 transition-colors">
                                        <div className="flex gap-3">
                                            <Info className="w-4 h-4 shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                                            <div className="flex flex-col gap-1">
                                                <span className="text-[12px] leading-relaxed" style={{ color: "#a08a6a" }}>
                                                    Need an ENS name?{" "}
                                                    <a
                                                        href="https://app.ens.domains"
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex items-center gap-1 font-bold hover:opacity-80 transition-opacity"
                                                        style={{ color: "#f59e0b" }}
                                                    >
                                                        Get one here <ExternalLink className="w-3 h-3" />
                                                    </a>
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            )}

                            {/* ── MINT MODE ── */}
                            {isVerified && (
                                <div className="mb-6 verified-msg">
                                    <label className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3 block" style={{ color: "#ccc" }}>
                                        2. MINT MODE
                                    </label>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => setMintMode("zk")}
                                            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider cursor-pointer"
                                            style={{
                                                background: mintMode === "zk" ? "rgba(232,255,0,0.1)" : "transparent",
                                                border: `1.5px solid ${mintMode === "zk" ? "#e8ff00" : "#222"}`,
                                                color: mintMode === "zk" ? "#e8ff00" : "#666",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            ZK Proof Mint
                                        </button>
                                        <button
                                            onClick={() => setMintMode("test")}
                                            className="flex-1 px-4 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider cursor-pointer"
                                            style={{
                                                background: mintMode === "test" ? "rgba(232,255,0,0.1)" : "transparent",
                                                border: `1.5px solid ${mintMode === "test" ? "#e8ff00" : "#222"}`,
                                                color: mintMode === "test" ? "#e8ff00" : "#666",
                                                fontFamily: "inherit",
                                            }}
                                        >
                                            Test Mint
                                        </button>
                                    </div>
                                    {mintMode === "test" && (
                                        <p className="text-[11px] mt-2" style={{ color: "#f59e0b" }}>
                                            Only works if your wallet is the contract deployer.
                                        </p>
                                    )}
                                </div>
                            )}

                            {/* ── ZK PROOF GENERATION ── */}
                            {isVerified && mintMode === "zk" && !proofReady && (
                                <div className="mb-6 verified-msg">
                                    <label className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3 block" style={{ color: "#ccc" }}>
                                        3. GENERATE ZK PROOF
                                    </label>
                                    <p className="text-[12px] mb-3" style={{ color: "#666" }}>
                                        Your private reputation data never leaves the browser.
                                    </p>
                                    <button
                                        onClick={handleGenerateProof}
                                        disabled={proving}
                                        className="w-full px-6 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-2"
                                        style={{
                                            background: proving ? "#1a1a1a" : "#e8ff00",
                                            color: proving ? "#888" : "#000",
                                            cursor: proving ? "wait" : "pointer",
                                            fontFamily: "inherit",
                                        }}
                                    >
                                        {proving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Generating proof...
                                            </>
                                        ) : (
                                            <>
                                                <Shield className="w-4 h-4" /> Generate ZK Proof
                                            </>
                                        )}
                                    </button>
                                    {proving && (
                                        <p className="text-[11px] mt-2 text-center" style={{ color: "#555" }}>
                                            Running Barretenberg WASM — may take 10-30s
                                        </p>
                                    )}
                                </div>
                            )}

                            {isVerified && mintMode === "zk" && proofReady && (
                                <div
                                    className="verified-msg p-4 rounded-lg mb-6"
                                    style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
                                >
                                    <div className="flex items-center gap-2">
                                        <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                        <span className="text-[13px] font-bold" style={{ color: "#22c55e" }}>
                                            ZK Proof Ready — Band 0
                                        </span>
                                    </div>
                                    <p className="text-[11px] mt-1" style={{ color: "#888" }}>
                                        Proof generated locally. Click below to mint your soulbound NFT.
                                    </p>
                                </div>
                            )}

                            {/* ── MINT BUTTON ── */}
                            <button
                                onClick={handleMint}
                                disabled={!canMint || isMinting}
                                className="w-full font-bold text-[14px] py-4 rounded-lg transition-all flex items-center justify-center gap-3 uppercase tracking-wider outline-none border-none cursor-pointer"
                                style={{
                                    background: canMint && !isMinting ? "#e8ff00" : "#1a1a1a",
                                    color: canMint && !isMinting ? "#000" : "#555",
                                    cursor: canMint && !isMinting ? "pointer" : "not-allowed",
                                    fontFamily: "inherit",
                                }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                    if (canMint && !isMinting) e.currentTarget.style.transform = "translateY(-1px)";
                                }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                    e.currentTarget.style.transform = "translateY(0)";
                                }}
                            >
                                {isMinting ? (
                                    <>Confirm in Wallet... <Loader2 className="w-5 h-5 animate-spin" /></>
                                ) : !isVerified ? (
                                    "Verify ENS first"
                                ) : mintMode === "zk" && !proofReady ? (
                                    "Generate proof first"
                                ) : (
                                    mintMode === "zk" ? "Mint with ZK Proof" : "Mint Profile"
                                )}
                            </button>

                            {mintError && (
                                <p className="text-[12px] text-center mt-3" style={{ color: "#ef4444" }}>
                                    {mintError.message?.includes("NotContractOwner")
                                        ? "Only contract owner can testMint. Switch to ZK Proof mode."
                                        : mintError.message?.includes("InvalidProof")
                                          ? "ZK proof verification failed on-chain."
                                          : mintError.message?.slice(0, 100)}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default OnboardingPage;
