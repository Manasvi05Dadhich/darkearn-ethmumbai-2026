import { useState, type FC } from "react";
import { CheckCircle2, Lock, Shield, Loader2, ArrowUp } from "lucide-react";
import { useUserNFT } from "../../hooks/useUserNFT";
import { useSkills } from "../../hooks/useSkills";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { generateReputationProof } from "../../lib/zkProver";
import { toast } from "sonner";

const BAND_REQUIREMENTS = [
    { band: 0, label: "B0 Initiate", completions: 0, approval: 0, days: 1 },
    { band: 1, label: "B1 Verified Contributor", completions: 3, approval: 70, days: 7 },
    { band: 2, label: "B2 Field Specialist", completions: 8, approval: 80, days: 14 },
    { band: 3, label: "B3 Senior Agent", completions: 15, approval: 85, days: 30 },
    { band: 4, label: "B4 Elite Operative", completions: 25, approval: 92, days: 60 },
];

const ReputationTab: FC = () => {
    const { band, ensName, memberSince, tokenId, isLoading } = useUserNFT();
    const { address } = useAccount();
    const { skills } = useSkills(address);
    const [upgrading, setUpgrading] = useState(false);

    const { writeContract, data: upgradeTx, isPending: upgradePending } = useWriteContract();
    const { isSuccess: upgradeConfirmed } = useWaitForTransactionReceipt({ hash: upgradeTx });

    const handleUpgradeBand = async () => {
        if (tokenId === null) return;
        setUpgrading(true);
        try {
            const totalCompletionsNow = skills.reduce((sum, s) => sum + s.completions, 0);
            const daysNow = memberSince ? Math.floor((Date.now() / 1000 - memberSince) / 86400) : 1;
            const result = await generateReputationProof({
                darkearn_completions: totalCompletionsNow,
                darkearn_approval_rate: totalCompletionsNow > 0 ? 100 : 0,
                darkearn_dispute_rate: 0,
                darkearn_account_age_days: Math.max(1, daysNow),
            });
            writeContract({
                ...CONTRACTS.ReputationNFT,
                functionName: "upgradeBand",
                args: [tokenId, result.proofHex, result.publicInputsBytes32],
            });
            toast.success(`ZK proof generated — upgrading to Band ${result.publicInputs[0]}`);
        } catch (err) {
            console.error("Upgrade proof failed:", err);
            toast.error("ZK proof generation failed");
        }
        setUpgrading(false);
    };

    if (isLoading) {
        return (
            <div className="max-w-4xl mx-auto text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading reputation from chain...</p>
            </div>
        );
    }

    const currentBand = band ?? 0;
    const totalCompletions = skills.reduce((sum, s) => sum + s.completions, 0);
    const daysSinceMember = memberSince
        ? Math.floor((Date.now() / 1000 - memberSince) / 86400)
        : 0;

    const nextBand = BAND_REQUIREMENTS[currentBand + 1];
    const progressPercent = nextBand
        ? Math.min(100, Math.round((totalCompletions / nextBand.completions) * 100))
        : 100;
    const tasksToNext = nextBand ? Math.max(0, nextBand.completions - totalCompletions) : 0;

    return (
        <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-white text-center mb-8">Reputation</h2>

            <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 mb-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                        <circle
                            cx="50"
                            cy="50"
                            r="42"
                            fill="none"
                            stroke="#e8ff00"
                            strokeWidth="6"
                            strokeDasharray={`${progressPercent * 2.64} 264`}
                            strokeLinecap="round"
                        />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span
                            className="text-[10px] font-bold tracking-[0.2em] uppercase"
                            style={{ color: "#888" }}
                        >
                            Current Level
                        </span>
                        <span className="text-4xl font-extrabold" style={{ color: "#e8ff00" }}>
                            {currentBand}
                        </span>
                        <span
                            className="text-[10px] font-bold tracking-[0.2em] uppercase"
                            style={{ color: "#888" }}
                        >
                            Band
                        </span>
                    </div>
                </div>
                <div className="w-full max-w-xs mb-2">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${progressPercent}%`, background: "#e8ff00" }}
                        />
                    </div>
                    <p className="text-[12px] font-semibold mt-1 text-center" style={{ color: "#e8ff00" }}>
                        {progressPercent}% Progress
                    </p>
                </div>
                <p className="text-[13px] text-center max-w-sm" style={{ color: "#999" }}>
                    {nextBand
                        ? `Complete ${tasksToNext} more tasks to reach Band ${nextBand.band}.`
                        : "Maximum band reached."}
                </p>

                {nextBand && tasksToNext <= 0 && tokenId !== null && (
                    <button
                        onClick={handleUpgradeBand}
                        disabled={upgrading || upgradePending}
                        className="mt-4 px-6 py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center gap-2"
                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                    >
                        {upgrading || upgradePending ? (
                            <><Loader2 className="w-4 h-4 animate-spin" /> Generating ZK Proof...</>
                        ) : (
                            <><ArrowUp className="w-4 h-4" /> Upgrade to Band {nextBand.band}</>
                        )}
                    </button>
                )}
                {upgradeConfirmed && (
                    <p className="mt-3 text-[13px] font-bold" style={{ color: "#22c55e" }}>
                        Band upgraded successfully!
                    </p>
                )}
            </div>

            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Completions", value: totalCompletions.toString() },
                    { label: "Days on DarkEarn", value: daysSinceMember.toString() },
                    { label: "ENS", value: ensName || "—" },
                ].map((s) => (
                    <div
                        key={s.label}
                        className="p-4 rounded-lg border text-center"
                        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                    >
                        <p
                            className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2"
                            style={{ color: "#888" }}
                        >
                            {s.label}
                        </p>
                        <p className="text-xl font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            <div className="rounded-xl border p-6" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3
                    className="text-[12px] font-bold tracking-[0.15em] uppercase mb-5 flex items-center gap-2"
                    style={{ color: "#888" }}
                >
                    <Shield className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    Reputation Ladder
                </h3>
                <div className="flex flex-col gap-2">
                    {[...BAND_REQUIREMENTS].reverse().map((b) => {
                        const isCurrent = b.band === currentBand;
                        const isNext = b.band === currentBand + 1;
                        const isLocked = b.band > currentBand;
                        return (
                            <div
                                key={b.band}
                                className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg"
                                style={{
                                    background: isCurrent ? "#e8ff00" : "transparent",
                                    border: isCurrent
                                        ? "1px solid rgba(232,255,0,0.6)"
                                        : "1px solid transparent",
                                }}
                            >
                                <div>
                                    <span
                                        className="text-[14px] font-bold"
                                        style={{ color: isCurrent ? "#0a0a0a" : "#999" }}
                                    >
                                        {b.label}
                                    </span>
                                    {b.band > 0 && (
                                        <p
                                            className="text-[10px] mt-0.5"
                                            style={{ color: isCurrent ? "#333" : "#555" }}
                                        >
                                            {b.completions}+ completions · {b.approval}%+ approval · {b.days}+
                                            days
                                        </p>
                                    )}
                                </div>
                                <div className="flex items-center gap-2">
                                    {isNext && (
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                            style={{
                                                background: "rgba(232,255,0,0.25)",
                                                color: "#0a0a0a",
                                            }}
                                        >
                                            Next
                                        </span>
                                    )}
                                    {isLocked && (
                                        <Lock
                                            className="w-4 h-4"
                                            style={{ color: isCurrent ? "#0a0a0a" : "#666" }}
                                        />
                                    )}
                                    {isCurrent && (
                                        <CheckCircle2 className="w-5 h-5" style={{ color: "#0a0a0a" }} />
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default ReputationTab;
