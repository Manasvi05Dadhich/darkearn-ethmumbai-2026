import { useState, type FC } from "react";
import { Shield, Lock, BarChart3, UserCircle2, ExternalLink, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useEarnings } from "../../hooks/useEarnings";
import { formatEther } from "viem";

const EarningsTab: FC = () => {
    const { address } = useAccount();
    const [show, setShow] = useState(true);
    const { payments, totalEarnedFormatted, isLoading } = useEarnings();

    const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(232,255,0,0.12)", border: "1px solid rgba(232,255,0,0.18)" }}
                    >
                        <UserCircle2 className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-white">{shortAddr}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#e8ff00" }}>
                            DarkEarn User
                        </p>
                    </div>
                </div>
                <span
                    className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                    style={{ background: "rgba(232,255,0,0.12)", color: "#e8ff00" }}
                >
                    Privacy Active
                </span>
            </div>

            <div className="rounded-xl border p-5 mb-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-[15px] font-bold text-white mb-1">Visibility</h3>
                        <p className="text-[12px]" style={{ color: "#7c8798" }}>
                            Show earnings across the dashboard
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={() => setShow(!show)}
                        className="w-14 h-8 rounded-full relative border-none cursor-pointer"
                        style={{ background: show ? "#e8ff00" : "#334155" }}
                    >
                        <div
                            className="absolute top-1 w-6 h-6 rounded-full transition-all"
                            style={{ left: show ? 30 : 4, background: "#fff" }}
                        />
                    </button>
                </div>
            </div>

            <div className="rounded-xl border overflow-hidden mb-4" style={{ background: "#10140f", borderColor: "#2a2a12" }}>
                <div
                    className="px-5 py-4 flex items-center justify-center"
                    style={{
                        background:
                            "linear-gradient(90deg, rgba(232,255,0,0.08), rgba(232,255,0,0.02), rgba(232,255,0,0.08))",
                    }}
                >
                    <div
                        className="w-12 h-12 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.18)" }}
                    >
                        <Lock className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#7b7b43" }}>
                        Total Lifetime Earned
                    </p>
                    {isLoading ? (
                        <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#e8ff00" }} />
                    ) : (
                        <p className="text-[34px] leading-none font-extrabold text-white">
                            {show ? `${totalEarnedFormatted} ETH` : "••••••"}
                        </p>
                    )}
                    <p className="text-[11px] font-bold mt-2" style={{ color: "#888" }}>
                        {payments.length === 0
                            ? "No completed bounties yet"
                            : `${payments.length} payment${payments.length > 1 ? "s" : ""} received`}
                    </p>
                </div>
            </div>

            {!show && (
                <div className="rounded-xl border p-5 mb-6" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <div className="flex gap-4">
                        <div
                            className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0"
                            style={{ background: "rgba(232,255,0,0.12)" }}
                        >
                            <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-white mb-1">
                                Your earnings are completely private
                            </p>
                            <p className="text-[12px] leading-relaxed" style={{ color: "#8b93a1" }}>
                                Only you can see these numbers. Toggle visibility above to reveal or hide them.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-bold text-white">Recent Payments</h3>
            </div>

            {payments.length === 0 ? (
                <div className="text-center py-8">
                    <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "#333" }} />
                    <p className="text-[13px]" style={{ color: "#777" }}>
                        No payment history yet. Complete bounties to earn.
                    </p>
                </div>
            ) : (
                <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    {payments.map((p, i) => (
                        <div
                            key={p.txHash}
                            className="px-5 py-4 flex items-center justify-between"
                            style={{ borderBottom: i < payments.length - 1 ? "1px solid #111" : "none" }}
                        >
                            <div>
                                <p className="text-[13px] font-semibold text-white">
                                    Bounty #{p.bountyId}
                                </p>
                                <p className="text-[11px]" style={{ color: "#555" }}>
                                    To: {p.recipient.slice(0, 8)}...{p.recipient.slice(-6)}
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="text-[13px] font-bold" style={{ color: show ? "#e8ff00" : "#555" }}>
                                    {show ? `${formatEther(p.amount)} ETH` : "••••"}
                                </span>
                                <a
                                    href={`https://sepolia.basescan.org/tx/${p.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] flex items-center gap-1"
                                    style={{ color: "#60a5fa" }}
                                >
                                    <ExternalLink className="w-3 h-3" /> View
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default EarningsTab;
