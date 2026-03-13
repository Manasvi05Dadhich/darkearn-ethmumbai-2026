import { useState, type FC, type MouseEvent } from "react";
import { CheckCircle2, Loader2, ExternalLink } from "lucide-react";

const BANDS = [
    { band: 0, label: "Band 0", req: "Exists, 1+ days", completions: 0, approval: 0, days: 1 },
    { band: 1, label: "Band 1", req: "3+ completions, 70%+ approval, 7+ days", completions: 3, approval: 70, days: 7 },
    { band: 2, label: "Band 2", req: "8+ completions, 80%+ approval, 14+ days", completions: 8, approval: 80, days: 14 },
    { band: 3, label: "Band 3", req: "15+ completions, 85%+ approval, 30+ days", completions: 15, approval: 85, days: 30 },
    { band: 4, label: "Band 4", req: "25+ completions, 92%+ approval, 60+ days", completions: 25, approval: 92, days: 60 },
];

const ReputationTab: FC = () => {
    const currentBand = 0;
    const [upgrading, setUpgrading] = useState(false);
    const [upgraded, setUpgraded] = useState(false);

    return (
        <div className="max-w-4xl">
            {/* Circular Viz */}
            <div className="flex flex-col items-center mb-10">
                <div className="relative w-40 h-40 mb-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e8ff00" strokeWidth="6"
                            strokeDasharray={`${0 * 2.64} 264`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <span className="text-3xl font-extrabold" style={{ color: "#e8ff00" }}>B0</span>
                        <span className="text-[10px] uppercase tracking-widest" style={{ color: "#777" }}>Current</span>
                    </div>
                </div>
            </div>

            {/* Live Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                    { label: "Completions", value: "0" }, { label: "Approval Rate", value: "—" },
                    { label: "Dispute Rate", value: "0%" }, { label: "Days on DarkEarn", value: "5" },
                ].map(s => (
                    <div key={s.label} className="p-4 rounded-lg border text-center" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <p className="text-[10px] font-bold tracking-widest uppercase mb-2" style={{ color: "#888" }}>{s.label}</p>
                        <p className="text-xl font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Band Ladder */}
            <div className="rounded-xl border p-6 mb-8" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-[12px] font-bold tracking-widest uppercase mb-5" style={{ color: "#888" }}>Band Ladder</h3>
                <div className="flex flex-col gap-4">
                    {BANDS.map(b => (
                        <div key={b.band} className="flex items-center gap-4 px-4 py-3 rounded-lg" style={{ background: b.band === currentBand ? "rgba(232,255,0,0.05)" : "transparent", border: b.band === currentBand ? "1px solid rgba(232,255,0,0.15)" : "1px solid transparent" }}>
                            <span className="text-[14px] font-bold w-16" style={{ color: b.band === currentBand ? "#e8ff00" : "#666" }}>{b.label}</span>
                            <span className="flex-1 text-[12px]" style={{ color: "#777" }}>{b.req}</span>
                            {b.band === currentBand && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}>Current</span>}
                        </div>
                    ))}
                </div>
            </div>

            {/* NFT Details */}
            <div className="rounded-xl border p-6" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>NFT Details</h3>
                <div className="grid grid-cols-2 gap-3 text-[13px]">
                    {[["Token ID", "#00421"], ["ENS Name", "alice.eth"], ["Current Band", "Band 0"], ["Date Minted", "Mar 2025"]].map(([l, v]) => (
                        <div key={l}><span style={{ color: "#555" }}>{l}: </span><span className="font-semibold text-white">{v}</span></div>
                    ))}
                </div>
                <div className="flex gap-4 mt-4">
                    <a href="#" className="text-[12px] font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>View on Basescan <ExternalLink className="w-3 h-3" /></a>
                    <a href="#" className="text-[12px] font-medium flex items-center gap-1" style={{ color: "#3b82f6" }}>View Public Profile <ExternalLink className="w-3 h-3" /></a>
                </div>
            </div>
        </div>
    );
};

export default ReputationTab;
