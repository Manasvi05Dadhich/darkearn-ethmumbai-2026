import { useState, type FC, type MouseEvent } from "react";
import {
    Eye, EyeOff, ArrowRight, Shield, FileText, Star, Briefcase, TrendingUp,
    Search, PlusCircle, Clock, Lightbulb, User
} from "lucide-react";
import type { DashboardTab } from "./index";

/* ── Activity data (shown when user has history) ── */
const ACTIVITY = [
    { icon: <FileText className="w-4 h-4" />, text: 'Applied to "Solidity escrow audit" as Applicant #3', time: "2 hours ago", color: "#e8ff00" },
    { icon: <Star className="w-4 h-4" />, text: "Band upgraded to Band 1", time: "3 days ago", color: "#22c55e" },
    { icon: <Briefcase className="w-4 h-4" />, text: 'Accepted for "ZK identity module" bounty', time: "5 days ago", color: "#3b82f6" },
    { icon: <TrendingUp className="w-4 h-4" />, text: "Earned $500 USDC — payment claimed", time: "1 week ago", color: "#a78bfa" },
    { icon: <FileText className="w-4 h-4" />, text: 'Applied to "Cairo DEX contract" as Applicant #7', time: "1 week ago", color: "#e8ff00" },
    { icon: <Shield className="w-4 h-4" />, text: "Solidity skill badge earned (3+ completions)", time: "2 weeks ago", color: "#22c55e" },
    { icon: <FileText className="w-4 h-4" />, text: 'Work submitted for "Dashboard UI" bounty', time: "2 weeks ago", color: "#06b6d4" },
    { icon: <Briefcase className="w-4 h-4" />, text: 'Completed "Cross-chain bridge docs" bounty', time: "3 weeks ago", color: "#22c55e" },
];

/* ── Toggle: set to true to show "new user" empty state ── */
const IS_NEW_USER = true;

const OverviewTab: FC<{ onNavigate: (tab: DashboardTab) => void }> = ({ onNavigate }) => {
    const [showEarnings, setShowEarnings] = useState(false);

    /* ─────────────────── NEW USER VIEW ─────────────────── */
    if (IS_NEW_USER) {
        return (
            <div className="max-w-2xl mx-auto" style={{ paddingBottom: 48 }}>
                <style>{`
                    @keyframes pulseGlow { 0%, 100% { box-shadow: 0 0 0 0 rgba(232,255,0,0.08); } 50% { box-shadow: 0 0 24px 4px rgba(232,255,0,0.12); } }
                    @keyframes fadeSlideUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }
                    .nu-card { animation: fadeSlideUp 0.5s ease forwards; }
                    .nu-card-1 { animation-delay: 0s; }
                    .nu-card-2 { animation-delay: 0.08s; }
                    .nu-card-3 { animation-delay: 0.16s; }
                    .nu-btn-glow:hover { box-shadow: 0 0 20px rgba(232,255,0,0.25) !important; transform: translateY(-1px); }
                    .nu-btn-outline:hover { border-color: #e8ff00 !important; color: #e8ff00 !important; }
                `}</style>

                {/* ── User Greeting ── */}
                <div className="flex items-center gap-4 mb-8 nu-card nu-card-1" style={{ opacity: 0 }}>
                    <div
                        className="flex items-center justify-center flex-shrink-0"
                        style={{
                            width: 52, height: 52, borderRadius: 14,
                            background: "linear-gradient(135deg, rgba(232,255,0,0.15) 0%, rgba(232,255,0,0.05) 100%)",
                            border: "1.5px solid rgba(232,255,0,0.2)",
                            color: "#e8ff00",
                        }}
                    >
                        <User size={26} />
                    </div>
                    <div>
                        <h2 style={{ fontSize: 22, fontWeight: 800, color: "#fff", margin: "0 0 4px", letterSpacing: "-0.01em" }}>
                            New User
                        </h2>
                        <div className="flex items-center gap-2">
                            <span
                                style={{
                                    fontSize: 9, fontWeight: 800, letterSpacing: "0.14em",
                                    textTransform: "uppercase", padding: "3px 8px", borderRadius: 5,
                                    background: "rgba(232,255,0,0.1)", color: "#e8ff00",
                                    border: "1px solid rgba(232,255,0,0.15)",
                                }}
                            >
                                Band 0
                            </span>
                            <span style={{ fontSize: 11, fontWeight: 600, color: "#555" }}>
                                0 XP
                            </span>
                        </div>
                    </div>
                </div>

                {/* ── Stat Cards Row ── */}
                <div className="grid grid-cols-3 gap-3 mb-6 nu-card nu-card-2" style={{ opacity: 0 }}>
                    {[
                        { label: "Total Earned", value: "$0.00", accent: true },
                        { label: "Completed", value: "0", accent: false },
                        { label: "Active Tasks", value: "0", accent: false },
                    ].map((stat, i) => (
                        <div
                            key={i}
                            className="p-4 rounded-xl"
                            style={{
                                background: stat.accent
                                    ? "linear-gradient(160deg, rgba(232,255,0,0.08) 0%, rgba(232,255,0,0.02) 100%)"
                                    : "#0e0e08",
                                border: stat.accent ? "1px solid rgba(232,255,0,0.15)" : "1px solid #1a1a10",
                            }}
                        >
                            <p style={{ fontSize: 10, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "#6b6b4b", margin: "0 0 8px" }}>
                                {stat.label}
                            </p>
                            <h3 style={{
                                fontSize: 26, fontWeight: 800,
                                color: stat.accent ? "#e8ff00" : "#fff",
                                margin: 0, letterSpacing: "-0.02em",
                            }}>
                                {stat.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* ── CTA Buttons ── */}
                <div className="flex flex-col gap-3 mb-8 nu-card nu-card-3" style={{ opacity: 0 }}>
                    <button
                        onClick={() => onNavigate("bounties")}
                        className="nu-btn-glow"
                        style={{
                            width: "100%", padding: "15px 20px", borderRadius: 10,
                            background: "#e8ff00", color: "#0a0a0a",
                            border: "none", fontSize: 14, fontWeight: 800,
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.2s ease",
                        }}
                    >
                        <Search size={16} strokeWidth={3} />
                        Browse Bounties
                    </button>
                    <button
                        onClick={() => onNavigate("post-bounty")}
                        className="nu-btn-outline"
                        style={{
                            width: "100%", padding: "15px 20px", borderRadius: 10,
                            background: "transparent", color: "#ccc",
                            border: "1px solid #2a2a1a", fontSize: 14, fontWeight: 800,
                            letterSpacing: "0.06em", textTransform: "uppercase",
                            cursor: "pointer", fontFamily: "inherit",
                            display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                            transition: "all 0.25s ease",
                        }}
                    >
                        <PlusCircle size={16} />
                        Post a Bounty
                    </button>
                </div>

                {/* ── Activity Feed (Empty) ── */}
                <div className="mb-6">
                    <h3 style={{ fontSize: 14, fontWeight: 800, color: "#fff", margin: "0 0 16px", letterSpacing: "-0.01em" }}>
                        Activity Feed
                    </h3>
                    <div
                        className="rounded-xl"
                        style={{
                            background: "#0e0e08",
                            border: "1px solid #1a1a10",
                            padding: "40px 24px",
                            textAlign: "center",
                        }}
                    >
                        <div
                            style={{
                                width: 48, height: 48, borderRadius: 14,
                                background: "rgba(100,100,60,0.1)",
                                border: "1px solid rgba(100,100,60,0.15)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                margin: "0 auto 16px",
                                color: "#555",
                            }}
                        >
                            <Clock size={22} />
                        </div>
                        <p style={{ fontSize: 15, fontWeight: 800, color: "#fff", margin: "0 0 6px" }}>
                            No activity yet
                        </p>
                        <p style={{ fontSize: 12, color: "#6b6b5b", margin: 0, lineHeight: 1.6 }}>
                            Browse bounties and complete your<br />first task to get started.
                        </p>
                    </div>
                </div>

                {/* ── How It Works ── */}
                <div
                    className="rounded-xl"
                    style={{
                        background: "linear-gradient(160deg, rgba(232,255,0,0.06) 0%, rgba(232,255,0,0.015) 100%)",
                        border: "1px solid rgba(232,255,0,0.1)",
                        padding: "20px 22px",
                    }}
                >
                    <div className="flex items-start gap-3">
                        <div
                            style={{
                                width: 32, height: 32, borderRadius: 9,
                                background: "rgba(232,255,0,0.1)",
                                display: "flex", alignItems: "center", justifyContent: "center",
                                flexShrink: 0,
                                color: "#e8ff00",
                                marginTop: 1,
                            }}
                        >
                            <Lightbulb size={16} />
                        </div>
                        <div>
                            <p style={{ fontSize: 13, fontWeight: 800, color: "#e8ff00", margin: "0 0 6px" }}>
                                How It Works
                            </p>
                            <p style={{ fontSize: 12, color: "#9a9a7a", margin: 0, lineHeight: 1.7 }}>
                                Browse the bounty board for tasks that match your skills. Once you complete a task and it's verified, you'll earn rewards and XP to level up your Band.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    /* ─────────────────── EXISTING USER VIEW ─────────────────── */
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
                    <h2 className="text-3xl font-extrabold text-white mb-2">{showEarnings ? "$1,200 USDC" : "••••••"}</h2>
                    <p className="text-[11px]" style={{ color: "#555" }}>Only you can see this</p>
                </div>

                {/* Card 3 — Active Applications */}
                <div className="p-6 rounded-xl border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    <p className="text-[11px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>Active Applications</p>
                    <h2 className="text-3xl font-extrabold text-white mb-2">3 Active</h2>
                    <p className="text-[12px] mb-4" style={{ color: "#777" }}>2 Pending · 1 Accepted</p>
                    <button onClick={() => onNavigate("applications")}
                        className="text-[12px] font-semibold bg-transparent border-none cursor-pointer flex items-center gap-1 transition-opacity hover:opacity-80"
                        style={{ color: "#e8ff00", fontFamily: "inherit" }}>
                        View Applications <ArrowRight className="w-3 h-3" />
                    </button>
                </div>
            </div>

            {/* Recent Activity */}
            <div className="rounded-xl border mb-8" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <div className="px-6 py-4 border-b" style={{ borderColor: "#1a1a1a" }}>
                    <h3 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Recent Activity</h3>
                </div>
                <div className="divide-y" style={{ borderColor: "#111" }}>
                    {ACTIVITY.map((a, i) => (
                        <div key={i} className="px-6 py-4 flex items-center gap-4 transition-colors hover:bg-[#0d0d0d]" style={{ borderBottom: i < ACTIVITY.length - 1 ? "1px solid #111" : "none" }}>
                            <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: `${a.color}10`, color: a.color }}>{a.icon}</div>
                            <p className="flex-1 text-[13px] font-medium text-white">{a.text}</p>
                            <span className="text-[11px] font-medium flex-shrink-0" style={{ color: "#555" }}>{a.time}</span>
                        </div>
                    ))}
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
