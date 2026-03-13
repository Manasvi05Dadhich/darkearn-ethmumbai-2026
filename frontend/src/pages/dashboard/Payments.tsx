import type { FC } from "react";
import { ExternalLink, Shield, CreditCard } from "lucide-react";

const PAYMENTS = [
    { bounty: "Security Audit", amount: "$500 USDC", status: "Completed", date: "Mar 5, 2026" },
    { bounty: "Frontend Build", amount: "$400 USDC", status: "Completed", date: "Feb 28, 2026" },
    { bounty: "Technical Docs", amount: "$300 USDC", status: "Pending", date: "Feb 20, 2026" },
];

const PaymentsTab: FC = () => (
    <div className="max-w-4xl">
        {/* Balance Card */}
        <div className="p-6 rounded-xl border mb-6 flex items-center justify-between" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
            <div>
                <p className="text-[11px] font-bold tracking-widest uppercase mb-1" style={{ color: "#888" }}>BitGo Wallet Balance</p>
                <p className="text-2xl font-bold text-white">$2,500 USDC</p>
            </div>
            <button className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Fund Wallet</button>
        </div>

        {/* Payment History */}
        <div className="rounded-xl border overflow-hidden mb-6" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
            <div className="px-6 py-3 flex items-center border-b text-[11px] font-bold tracking-widest uppercase" style={{ color: "#555", borderColor: "#111" }}>
                <span className="flex-1">Bounty</span><span className="w-28">Amount</span><span className="w-24">Status</span><span className="w-28">Date</span><span className="w-20">Tx</span>
            </div>
            {PAYMENTS.map((p, i) => (
                <div key={i} className="px-6 py-4 flex items-center text-[13px]" style={{ borderBottom: "1px solid #111" }}>
                    <span className="flex-1 text-white font-medium">{p.bounty}</span>
                    <span className="w-28 font-bold" style={{ color: "#e8ff00" }}>{p.amount}</span>
                    <span className="w-24 text-[11px] font-bold uppercase" style={{ color: p.status === "Completed" ? "#22c55e" : "#f59e0b" }}>{p.status}</span>
                    <span className="w-28" style={{ color: "#777" }}>{p.date}</span>
                    <a href="#" className="w-20 flex items-center gap-1" style={{ color: "#3b82f6", fontSize: 12 }}>View <ExternalLink className="w-3 h-3" /></a>
                </div>
            ))}
        </div>

        {/* Status Card */}
        <div className="p-5 rounded-lg border flex items-center gap-3" style={{ background: "rgba(232,255,0,0.02)", borderColor: "rgba(232,255,0,0.1)" }}>
            <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
            <p className="text-[12px] font-medium" style={{ color: "#999" }}>All payments verified by ZK reputation check. Powered by BitGo MPC.</p>
        </div>
    </div>
);

export default PaymentsTab;
