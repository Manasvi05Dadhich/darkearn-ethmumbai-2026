import { useState, type FC } from "react";
import { Shield, Lock, Wallet, BadgeDollarSign, UserCircle2, BarChart3 } from "lucide-react";

const EARNINGS_DATA = [
    { category: "Cairo Security Audit", amount: "$1,200 USDC", date: "Oct 12, 2023", token: "Basescan", icon: Wallet },
    { category: "UI Design Sprint", amount: "$500 USDC", date: "Oct 03, 2023", token: "Basescan", icon: BadgeDollarSign },
    { category: "Solidity Middleware", amount: "$2,400 USDC", date: "Sep 29, 2023", token: "Basescan", icon: Wallet },
];

const EarningsTab: FC = () => {
    const [show, setShow] = useState(true);

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
                        <p className="text-[13px] font-bold text-white">alice.eth</p>
                        <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#e8ff00" }}>Band 3 Verified</p>
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
                        <p className="text-[12px]" style={{ color: "#7c8798" }}>Show earnings across the dashboard</p>
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
                <div className="px-5 py-4 flex items-center justify-center" style={{ background: "linear-gradient(90deg, rgba(232,255,0,0.08), rgba(232,255,0,0.02), rgba(232,255,0,0.08))" }}>
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.18)" }}>
                        <Lock className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                </div>
                <div className="px-5 py-4">
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-3" style={{ color: "#7b7b43" }}>Total Lifetime Earned</p>
                    <p className="text-[34px] leading-none font-extrabold text-white">{show ? "$14,500 USDC" : "••••••"}</p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: "#22c55e" }}>↗ +24.5% <span style={{ color: "#7c8798" }}>vs last year</span></p>
                </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <div className="rounded-xl border p-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7b7b43" }}>This Month</p>
                    <p className="text-[28px] font-extrabold text-white">{show ? "$3,200 USDC" : "••••"}</p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: "#22c55e" }}>↗ 12%</p>
                </div>
                <div className="rounded-xl border p-5" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                    <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: "#7b7b43" }}>Pending</p>
                    <p className="text-[28px] font-extrabold text-white">{show ? "$850 USDC" : "••••"}</p>
                    <p className="text-[11px] font-bold mt-2" style={{ color: "#e8ff00" }}>Processing</p>
                </div>
            </div>

            <div className="rounded-xl border p-5 mb-4" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                <p className="text-[11px] font-bold text-white mb-4">Earnings Breakdown (Last 6 Months)</p>
                <div className="h-28 rounded-lg flex items-center justify-center relative" style={{ background: "rgba(255,255,255,0.01)" }}>
                    <BarChart3 className="w-8 h-8" style={{ color: "#334155" }} />
                    <div className="absolute bottom-3 left-8 right-8 flex justify-between text-[9px] font-medium" style={{ color: "#7c8798" }}>
                        <span>Solidity</span>
                        <span>Cairo</span>
                        <span>Design</span>
                    </div>
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex items-center gap-4 text-[9px] font-medium" style={{ color: "#7c8798" }}>
                        <span><span style={{ color: "#e8ff00" }}>●</span> Core Tech</span>
                        <span><span style={{ color: "#64748b" }}>●</span> Ecosystem</span>
                    </div>
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
                        <button
                            type="button"
                            className="mt-3 text-[12px] font-bold border-none bg-transparent cursor-pointer p-0"
                            style={{ color: "#e8ff00", fontFamily: "inherit" }}
                        >
                            Learn about ZK-Privacy →
                        </button>
                    </div>
                </div>
            </div>
            )}

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-bold text-white">Recent Payments</h3>
                <button
                    type="button"
                    className="text-[12px] font-bold border-none bg-transparent cursor-pointer p-0"
                    style={{ color: "#e8ff00", fontFamily: "inherit" }}
                >
                    View All
                </button>
            </div>

            <div className="flex flex-col gap-3">
                {EARNINGS_DATA.map((entry, i) => {
                    const Icon = entry.icon;
                    return (
                        <div key={i} className="rounded-xl border px-4 py-3 flex items-center gap-3" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                            <div className="w-9 h-9 rounded-md flex items-center justify-center" style={{ background: "rgba(96,165,250,0.08)", border: "1px solid rgba(96,165,250,0.14)" }}>
                                <Icon className="w-4 h-4" style={{ color: "#7aa2ff" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-bold text-white truncate">{entry.category}</p>
                                <p className="text-[11px]" style={{ color: "#7c8798" }}>{entry.date} • {entry.token}</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>{show ? entry.amount : "••••"}</p>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default EarningsTab;
