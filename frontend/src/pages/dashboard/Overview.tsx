import { useState, type FC, type MouseEvent } from "react";
import { Eye, EyeOff, ArrowRight } from "lucide-react";
import type { DashboardTab } from "./index";

const OverviewTab: FC<{ onNavigate: (tab: DashboardTab) => void }> = ({ onNavigate }) => {
    const [showEarnings, setShowEarnings] = useState(false);

    return (
        <div className="max-w-5xl">
            {/* Stat Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-8">
                {/* Card 1 — Reputation Band */}
                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>Reputation Band</p>
                    <h2 className="text-3xl font-extrabold mb-4" style={{ color: "#e8ff00" }}>Band 0</h2>
                    <div className="w-full h-2 rounded-full overflow-hidden mb-2" style={{ background: "#111" }}>
                        <div className="h-full rounded-full" style={{ width: "0%", background: "#e8ff00" }} />
                    </div>
                    <p className="text-[11px] mb-4" style={{ color: "#777" }}>Complete 3 bounties to reach Band 1</p>
                    <button onClick={() => onNavigate("reputation")}
                        className="text-[12px] font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "#e8ff00", fontFamily: "inherit" }}>
                        View Reputation Details <ArrowRight className="w-3 h-3" />
                    </button>
                </div>

                {/* Card 2 — Total Earned */}
                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <div className="flex items-center justify-between mb-4">
                        <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Total Earned</p>
                        <button onClick={() => setShowEarnings(!showEarnings)}
                            className="w-7 h-7 flex items-center justify-center rounded-md bg-transparent border cursor-pointer transition-colors"
                            style={{ borderColor: "#222" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#444"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#222"; }}>
                            {showEarnings ? <EyeOff className="w-3.5 h-3.5" style={{ color: "#888" }} /> : <Eye className="w-3.5 h-3.5" style={{ color: "#888" }} />}
                        </button>
                    </div>
                    <h2 className="text-3xl font-extrabold text-white mb-2">{showEarnings ? "0 ETH" : "••••••"}</h2>
                    <p className="text-[11px]" style={{ color: "#555" }}>Only you can see this</p>
                </div>

                {/* Card 3 — Active Applications */}
                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>Active Applications</p>
                    <h2 className="text-3xl font-extrabold text-white mb-2">0 Active</h2>
                    <p className="text-[12px] mb-4" style={{ color: "#777" }}>Apply to bounties to get started</p>
                    <button onClick={() => onNavigate("applications")}
                        className="text-[12px] font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "#e8ff00", fontFamily: "inherit" }}>
                        View Applications <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Recent Activity — empty */}
            <div className="rounded-xl border mb-8" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
                    <h3 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Recent Activity</h3>
                </div>
                <div className="px-6 py-8 text-center">
                    <p className="text-[13px]" style={{ color: "#555" }}>No activity yet. Browse bounties to get started.</p>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {[
                    { label: "Browse Bounties", tab: "bounties" as DashboardTab },
                    { label: "Post a Bounty", tab: "post-bounty" as DashboardTab },
                    { label: "Find Contributors", tab: "find-contributors" as DashboardTab },
                ].map((a) => (
                    <button key={a.tab} onClick={() => onNavigate(a.tab)}
                        className="py-4 rounded-lg text-[13px] font-bold uppercase tracking-wider border cursor-pointer transition-all bg-transparent"
                        style={{ borderColor: "#222", color: "#ccc", fontFamily: "inherit" }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.color = "#ccc"; }}>
                        {a.label}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default OverviewTab;
