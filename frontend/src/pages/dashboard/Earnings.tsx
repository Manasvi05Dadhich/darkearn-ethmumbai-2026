import { useState, type FC } from "react";
import { Shield, Lock, BarChart3, UserCircle2 } from "lucide-react";
import { useAccount } from "wagmi";

const EarningsTab: FC = () => {
    const { address } = useAccount();
    const [show, setShow] = useState(true);

    // No on-chain earnings data available yet — show empty state
    const totalEarned = "0.00";
    const thisMonth = "0.00";

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,255,0,0.12)", border: "1px solid rgba(232,255,0,0.18)" }}>
                        <UserCircle2 className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                    <div>
                        <p className="text-[13px] font-bold text-white">{address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected"}</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#e8ff00" }}>DarkEarn User</p>
                    </div>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider" style={{ background: "rgba(232,255,0,0.12)", color: "#e8ff00" }}>
                    Privacy Active
                </span>
            </div>

            <div className="rounded-xl border p-5 mb-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                <div className="flex items-center justify-between gap-4">
                    <div>
                        <h3 className="text-[15px] font-bold text-white mb-1">Visibility</h3>
                        <p className="text-[12px]" style={{ color: "#7c8798" }}>Show earnings across the dashboard</p>
                    </div>
                    <button type="button" onClick={() => setShow(!show)} className="w-14 h-8 rounded-full relative border-none cursor-pointer" style={{ background: show ? "#e8ff00" : "#334155" }}>
                        <div className="absolute top-1 w-6 h-6 rounded-full transition-all" style={{ left: show ? 30 : 4, background: "#fff" }} />
                    </button>
                </div>
            </div>

            <div className="rounded-xl border overflow-hidden mb-4" style={{ background: "#10140f", borderColor: "#2a2a12" }}>
                <div className="px-5 py-4 flex items-center justify-center" style={{ background: "linear-gradient(90deg, rgba(232,255,0,0.08), rgba(232,255,0,0.02), rgba(232,255,0,0.08))" }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.18)" }}>
                        <Lock className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#7b7b43" }}>Total Lifetime Earned</p>
                    <p className="text-[34px] leading-none font-extrabold text-white">{show ? `${totalEarned} ETH` : "••••••"}</p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: "#888" }}>No completed bounties yet</p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border p-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7b7b43" }}>This Month</p>
                    <p className="text-[28px] font-extrabold text-white">{show ? `${thisMonth} ETH` : "••••"}</p>
                </div>
                <div className="rounded-xl border p-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7b7b43" }}>Pending</p>
                    <p className="text-[28px] font-extrabold text-white">{show ? "0 ETH" : "••••"}</p>
                </div>
            </div>

            {!show && (
                <div className="rounded-xl border p-5 mb-6" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <div className="flex gap-4">
                        <div className="w-10 h-10 rounded-md flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,255,0,0.12)" }}>
                            <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                        </div>
                        <div>
                            <p className="text-[13px] font-bold text-white mb-1">Your earnings are completely private</p>
                            <p className="text-[12px] leading-relaxed" style={{ color: "#8b93a1" }}>
                                Only you can see these numbers. We use zero-knowledge encryption to ensure your financial privacy is maintained across the network.
                            </p>
                        </div>
                    </div>
                </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-bold text-white">Recent Payments</h3>
            </div>

            <div className="text-center py-8">
                <BarChart3 className="w-8 h-8 mx-auto mb-3" style={{ color: "#333" }} />
                <p className="text-[13px]" style={{ color: "#777" }}>No payment history yet. Complete bounties to earn.</p>
            </div>
        </div>
    );
};

export default EarningsTab;
