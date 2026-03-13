import type { FC } from "react";
import { Copy, Shield, Wallet, Landmark, BadgeCheck, UserCircle2 } from "lucide-react";

const PAYMENTS = [
    { bounty: "Smart Contract Audit", amount: "+1,200 USDC", status: "Verified", date: "Oct 24, 2023", icon: Wallet },
    { bounty: "Bug Bounty #402", amount: "+850 USDC", status: "Verified", date: "Oct 21, 2023", icon: Shield },
    { bounty: "Frontend Fixes", amount: "+400 USDC", status: "Verified", date: "Oct 18, 2023", icon: BadgeCheck },
];

const PaymentsTab: FC = () => (
    <div className="max-w-2xl mx-auto">
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                    style={{ background: "rgba(232,255,0,0.12)", border: "1px solid rgba(232,255,0,0.18)" }}
                >
                    <UserCircle2 className="w-6 h-6" style={{ color: "#e8ff00" }} />
                </div>
                <div>
                    <p className="text-[20px] font-extrabold text-white leading-none">DarkEarn</p>
                    <p className="text-[12px]" style={{ color: "#e8ff00" }}>alice.eth</p>
                </div>
            </div>
            <span
                className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider"
                style={{ background: "rgba(232,255,0,0.12)", color: "#e8ff00" }}
            >
                Band 3
            </span>
        </div>

        <div className="rounded-xl border p-4 mb-4" style={{ background: "#121208", borderColor: "#2a2a12" }}>
            <div
                className="rounded-xl border px-4 py-8 mb-4 flex items-center justify-center"
                style={{ background: "linear-gradient(180deg, rgba(232,255,0,0.05), rgba(232,255,0,0.01))", borderColor: "#2f2b12" }}
            >
                <div className="w-14 h-14 rounded-lg flex items-center justify-center" style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.16)" }}>
                    <Wallet className="w-7 h-7" style={{ color: "#e8ff00" }} />
                </div>
            </div>

            <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "#9b9b63" }}>BitGo Wallet Balance</p>
            <p className="text-[48px] font-extrabold leading-none mb-3" style={{ color: "#e8ff00" }}>
                2,450.00 <span className="text-[28px] text-white">USDC</span>
            </p>
            <div className="flex items-center gap-2 mb-5">
                <Shield className="w-3.5 h-3.5" style={{ color: "#e8ff00" }} />
                <p className="text-[12px] font-medium" style={{ color: "#e8ff00" }}>Protected by MPC Technology</p>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <button
                    className="py-3 rounded-lg text-[14px] font-bold border-none cursor-pointer flex items-center justify-center gap-2"
                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                >
                    <Wallet className="w-4 h-4" /> Fund Wallet
                </button>
                <button
                    className="py-3 rounded-lg text-[14px] font-bold border cursor-pointer flex items-center justify-center gap-2"
                    style={{ background: "#1d2f52", borderColor: "#2f436f", color: "#fff", fontFamily: "inherit" }}
                >
                    <Landmark className="w-4 h-4" /> Withdraw
                </button>
            </div>
        </div>

        <div className="mb-4">
            <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "#9b9b63" }}>Your Private Payment Address</p>
            <div className="rounded-xl border px-4 py-4 flex items-center justify-between" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                <p className="text-[14px] font-bold" style={{ color: "#e8ff00" }}>0x71C...492E</p>
                <button className="border-none bg-transparent cursor-pointer" style={{ color: "#e8ff00" }}>
                    <Copy className="w-4 h-4" />
                </button>
            </div>
        </div>

        <div className="flex items-center justify-between mb-3">
            <h3 className="text-[18px] font-bold text-white">Payment History</h3>
            <button
                type="button"
                className="text-[12px] font-bold border-none bg-transparent cursor-pointer p-0"
                style={{ color: "#e8ff00", fontFamily: "inherit" }}
            >
                View All
            </button>
        </div>

        <div className="flex flex-col gap-3">
            {PAYMENTS.map((p, i) => {
                const Icon = p.icon;
                return (
                    <div key={i} className="rounded-xl border px-4 py-3 flex items-center gap-3" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                        <div className="w-10 h-10 rounded-md flex items-center justify-center" style={{ background: "rgba(232,255,0,0.1)", border: "1px solid rgba(232,255,0,0.14)" }}>
                            <Icon className="w-4 h-4" style={{ color: "#e8ff00" }} />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-[14px] font-bold text-white truncate">{p.bounty}</p>
                            <p className="text-[11px]" style={{ color: "#7c8798" }}>{p.date}</p>
                        </div>
                        <div className="text-right">
                            <p className="text-[14px] font-bold" style={{ color: "#e8ff00" }}>{p.amount}</p>
                            <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: "#22c55e" }}>{p.status}</p>
                        </div>
                    </div>
                );
            })}
        </div>
    </div>
);

export default PaymentsTab;
