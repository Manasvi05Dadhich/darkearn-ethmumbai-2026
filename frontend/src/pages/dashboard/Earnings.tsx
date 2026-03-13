import { useState, type FC, type MouseEvent } from "react";
import { Eye, EyeOff, ExternalLink, EyeOff as EyeOffIcon, Shield } from "lucide-react";

const EARNINGS_DATA = [
    { category: "Security Audit", amount: "$500 USDC", date: "Mar 5, 2026" },
    { category: "Frontend Build", amount: "$400 USDC", date: "Feb 28, 2026" },
    { category: "Technical Writing", amount: "$300 USDC", date: "Feb 20, 2026" },
];

const EarningsTab: FC = () => {
    const [show, setShow] = useState(false);

    return (
        <div className="max-w-4xl">
            {/* Toggle */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Earnings</h3>
                <button onClick={() => setShow(!show)}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg border bg-transparent cursor-pointer text-[12px] font-bold uppercase tracking-wider transition-colors"
                    style={{ borderColor: show ? "rgba(232,255,0,0.3)" : "#222", color: show ? "#e8ff00" : "#888", fontFamily: "inherit" }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#444"; }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = show ? "rgba(232,255,0,0.3)" : "#222"; }}>
                    {show ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />} {show ? "Hide" : "Show"} Earnings
                </button>
            </div>

            {!show && (
                <div className="p-6 rounded-xl border text-center mb-6" style={{ background: "rgba(232,255,0,0.02)", borderColor: "rgba(232,255,0,0.1)" }}>
                    <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: "#e8ff00" }} />
                    <p className="text-[13px] font-medium" style={{ color: "#999" }}>Your earnings are completely private. Only you can see these numbers.</p>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[{ label: "Total Lifetime", value: show ? "$1,200 USDC" : "••••••" }, { label: "This Month", value: show ? "$500 USDC" : "••••••" }, { label: "Last Month", value: show ? "$400 USDC" : "••••••" }].map(s => (
                    <div key={s.label} className="p-5 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "#888" }}>{s.label}</p>
                        <p className="text-xl font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Table */}
            <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "#1a1a1a", filter: show ? "none" : "blur(6px)", pointerEvents: show ? "auto" : "none" }}>
                <div className="px-6 py-3 flex items-center border-b text-[11px] font-bold tracking-widest uppercase" style={{ color: "#555", borderColor: "#111" }}>
                    <span className="flex-1">Category</span><span className="w-32">Amount</span><span className="w-32">Date</span><span className="w-24">Tx</span>
                </div>
                {EARNINGS_DATA.map((e, i) => (
                    <div key={i} className="px-6 py-4 flex items-center text-[13px]" style={{ borderBottom: "1px solid #111" }}>
                        <span className="flex-1 text-white font-medium">{e.category}</span>
                        <span className="w-32 font-bold" style={{ color: "#e8ff00" }}>{e.amount}</span>
                        <span className="w-32" style={{ color: "#777" }}>{e.date}</span>
                        <a href="#" className="w-24 flex items-center gap-1" style={{ color: "#3b82f6", fontSize: 12 }}>Basescan <ExternalLink className="w-3 h-3" /></a>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default EarningsTab;
