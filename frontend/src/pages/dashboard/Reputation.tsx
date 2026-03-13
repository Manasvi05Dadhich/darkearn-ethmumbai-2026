import { type FC } from "react";
import { CheckCircle2, Lock, Shield } from "lucide-react";

const BANDS = [
    { band: 4, label: "B4 Elite Operative", locked: true },
    { band: 3, label: "B3 Senior Agent", locked: true },
    { band: 2, label: "B2 Field Specialist", locked: true },
    { band: 1, label: "B1 Verified Contributor", locked: true, next: true },
    { band: 0, label: "B0 Initiate", locked: false, current: true },
];

const ReputationTab: FC = () => {
    const progressPercent = 15;
    const completions = 0;
    const approval = 0;
    const days = 1;
    const tasksToNext = 5;

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <h2 className="text-2xl font-bold text-white text-center mb-8">Reputation</h2>

            {/* Circular Gauge */}
            <div className="flex flex-col items-center mb-8">
                <div className="relative w-48 h-48 mb-5">
                    <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#1a1a1a" strokeWidth="6" />
                        <circle cx="50" cy="50" r="42" fill="none" stroke="#e8ff00" strokeWidth="6"
                            strokeDasharray={`${progressPercent * 2.64} 264`} strokeLinecap="round" />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#888" }}>Current Level</span>
                        <span className="text-4xl font-extrabold" style={{ color: "#e8ff00" }}>0</span>
                        <span className="text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#888" }}>Band</span>
                    </div>
                </div>
                {/* Horizontal progress bar */}
                <div className="w-full max-w-xs mb-2">
                    <div className="h-2 rounded-full overflow-hidden" style={{ background: "#1a1a1a" }}>
                        <div
                            className="h-full rounded-full"
                            style={{ width: `${progressPercent}%`, background: "#e8ff00" }}
                        />
                    </div>
                    <p className="text-[12px] font-semibold mt-1 text-center" style={{ color: "#e8ff00" }}>{progressPercent}% Progress</p>
                </div>
                <p className="text-[13px] text-center max-w-sm" style={{ color: "#999" }}>
                    Complete {tasksToNext} more tasks with high accuracy to reach Band 1.
                </p>
            </div>

            {/* KPIs */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                {[
                    { label: "Completions", value: completions.toString() },
                    { label: "Approval", value: `${approval}%` },
                    { label: "Days", value: days.toString() },
                ].map(s => (
                    <div key={s.label} className="p-4 rounded-lg border text-center" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <p className="text-[10px] font-bold tracking-[0.15em] uppercase mb-2" style={{ color: "#888" }}>{s.label}</p>
                        <p className="text-xl font-bold text-white">{s.value}</p>
                    </div>
                ))}
            </div>

            {/* Reputation Ladder */}
            <div className="rounded-xl border p-6" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-[12px] font-bold tracking-[0.15em] uppercase mb-5 flex items-center gap-2" style={{ color: "#888" }}>
                    <Shield className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    Reputation Ladder
                </h3>
                <div className="flex flex-col gap-2">
                    {BANDS.map(b => (
                        <div
                            key={b.band}
                            className="flex items-center justify-between gap-4 px-4 py-3 rounded-lg"
                            style={{
                                background: b.current ? "#e8ff00" : "transparent",
                                border: b.current ? "1px solid rgba(232,255,0,0.6)" : "1px solid transparent",
                            }}
                        >
                            <span
                                className="text-[14px] font-bold"
                                style={{ color: b.current ? "#0a0a0a" : "#999" }}
                            >
                                {b.label}
                            </span>
                            <div className="flex items-center gap-2">
                                {b.next && <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(232,255,0,0.25)", color: "#0a0a0a" }}>Next</span>}
                                {b.locked && <Lock className="w-4 h-4" style={{ color: b.current ? "#0a0a0a" : "#666" }} />}
                                {b.current && <CheckCircle2 className="w-5 h-5" style={{ color: "#0a0a0a" }} />}
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default ReputationTab;
