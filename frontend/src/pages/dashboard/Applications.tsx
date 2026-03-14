import { useState, type FC, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, FileText, Settings, Code, Shield } from "lucide-react";

type IdentityStatus = "anonymous" | "revealed";
type AppStatus = "under-review" | "accepted" | "pending" | "rejected";

interface Application {
    id: number;
    title: string;
    posterEns: string;
    prize: string;
    identityStatus: IdentityStatus;
    appStatus: AppStatus;
    applicantNum?: number;
    expandMessage?: string;
    icon: "document" | "gear" | "braces" | "shield";
}

const APPS: Application[] = [
    { id: 1, title: "Smart Contract Audit", posterEns: "poster.eth", prize: "$1,200 USDC", identityStatus: "revealed", appStatus: "under-review", applicantNum: 7, expandMessage: "You applied as Applicant #7 — your identity was anonymous until the poster revealed you.", icon: "document" },
    { id: 2, title: "Frontend UI Redesign", posterEns: "design.eth", prize: "$800 USDC", identityStatus: "anonymous", appStatus: "accepted", expandMessage: "Your application has been accepted! You can now submit your work or claim your payment.", icon: "gear" },
    { id: 3, title: "Indexing Subgraph for DAO", posterEns: "grapher.eth", prize: "$2,500 USDC", identityStatus: "anonymous", appStatus: "pending", icon: "braces" },
    { id: 4, title: "Vulnerability Report", posterEns: "shield.eth", prize: "$400 USDC", identityStatus: "revealed", appStatus: "rejected", icon: "shield" },
];

const ICON_MAP = {
    document: FileText,
    gear: Settings,
    braces: Code,
    shield: Shield,
};

const STATUS_STYLES: Record<AppStatus, { bg: string; color: string }> = {
    "under-review": { bg: "rgba(59, 130, 246, 0.5)", color: "#fff" },
    "accepted": { bg: "#22c55e", color: "#fff" },
    "pending": { bg: "rgba(88, 80, 236, 0.7)", color: "#fff" },
    "rejected": { bg: "#ef4444", color: "#fff" },
};

const IDENTITY_STYLE = { bg: "rgba(51, 65, 85, 0.6)", color: "#fff" };

/* ── Submit Work Modal ── */
const SubmitWorkModal: FC<{ onClose: () => void }> = ({ onClose }) => {
    const [stage, setStage] = useState<"start" | "secure" | "created" | "submitting" | "done">("start");
    const slideIndex = stage === "start" ? 0 : stage === "secure" ? 1 : -1;
    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }} onClick={onClose}>
            <style>{`
                @keyframes swm-slide { from { opacity: 0; transform: translateY(30px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes swm-fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
                @keyframes swm-pulse { 0%, 100% { opacity: 0.6; } 50% { opacity: 1; } }
                @keyframes swm-float { 0%, 100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
                .swm-card { animation: swm-slide 0.35s ease forwards; }
                .swm-slide-content { animation: swm-fadeIn 0.35s ease forwards; }
                .swm-cta:hover { box-shadow: 0 0 28px rgba(232,255,0,0.3) !important; transform: translateY(-1px) !important; }
            `}</style>
            <div
                className="w-full max-w-md rounded-t-2xl sm:rounded-2xl border swm-card"
                style={{
                    background: "linear-gradient(180deg, #111108 0%, #0a0a06 100%)",
                    borderColor: "rgba(232,255,0,0.08)",
                    boxShadow: "0 -8px 60px rgba(0,0,0,0.5), 0 0 80px rgba(232,255,0,0.04)",
                    overflow: "hidden",
                }}
                onClick={e => e.stopPropagation()}
            >
                {/* Drag handle */}
                <div style={{ display: "flex", justifyContent: "center", padding: "14px 0 6px" }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: "#2a2a1a" }} />
                </div>

                {/* Progress dots (slide 1 & 2 only) */}
                {slideIndex >= 0 && (
                    <div style={{ display: "flex", justifyContent: "center", gap: 8, paddingBottom: 8 }}>
                        {[0, 1].map(i => (
                            <div key={i} style={{
                                width: 28, height: 4, borderRadius: 2,
                                background: i <= slideIndex ? "#e8ff00" : "#2a2a1a",
                                transition: "background 0.3s ease",
                            }} />
                        ))}
                    </div>
                )}

                <div style={{ padding: "8px 28px 28px" }}>

                    {/* ── SLIDE 1: Intro ── */}
                    {stage === "start" && (
                        <div className="swm-slide-content" key="slide1">
                            {/* Lock icon */}
                            <div style={{ display: "flex", justifyContent: "center", marginBottom: 18 }}>
                                <div style={{
                                    width: 52, height: 52, borderRadius: 14,
                                    background: "rgba(232,255,0,0.08)",
                                    border: "1.5px solid rgba(232,255,0,0.15)",
                                    display: "flex", alignItems: "center", justifyContent: "center",
                                    color: "#e8ff00",
                                }}>
                                    <svg width="22" height="24" viewBox="0 0 22 24" fill="none">
                                        <rect x="2" y="10" width="18" height="12" rx="3" stroke="currentColor" strokeWidth="2" />
                                        <path d="M6 10V7a5 5 0 0 1 10 0v3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                        <circle cx="11" cy="16" r="2" fill="currentColor" />
                                    </svg>
                                </div>
                            </div>

                            {/* Title */}
                            <h2 style={{ fontSize: 20, fontWeight: 800, color: "#fff", textAlign: "center", margin: "0 0 6px", letterSpacing: "-0.01em" }}>
                                Submit Your Work Privately
                            </h2>
                            <p style={{ fontSize: 13, color: "#7a7a6a", textAlign: "center", margin: "0 0 28px", lineHeight: 1.6 }}>
                                Your work will be encrypted via Fileverse.<br />Only the poster can open it.
                            </p>

                            {/* Info bullets */}
                            <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 28 }}>
                                {[
                                    { icon: <Shield size={16} />, text: "End-to-end encrypted document" },
                                    { icon: <FileText size={16} />, text: "Only the bounty poster can decrypt" },
                                    { icon: <CheckCircle2 size={16} />, text: "Verified on-chain submission proof" },
                                ].map((item, i) => (
                                    <div key={i} style={{ display: "flex", alignItems: "center", gap: 12 }}>
                                        <div style={{
                                            width: 36, height: 36, borderRadius: 10,
                                            background: "rgba(232,255,0,0.06)",
                                            border: "1px solid rgba(232,255,0,0.1)",
                                            display: "flex", alignItems: "center", justifyContent: "center",
                                            color: "#e8ff00", flexShrink: 0,
                                        }}>
                                            {item.icon}
                                        </div>
                                        <span style={{ fontSize: 13, color: "#b0b090", fontWeight: 500 }}>{item.text}</span>
                                    </div>
                                ))}
                            </div>

                            {/* Continue button */}
                            <button
                                onClick={() => setStage("secure")}
                                className="swm-cta"
                                style={{
                                    width: "100%", padding: "16px 20px", borderRadius: 10,
                                    background: "#e8ff00", color: "#0a0a0a",
                                    border: "none", fontSize: 14, fontWeight: 800,
                                    letterSpacing: "0.04em", textTransform: "uppercase",
                                    cursor: "pointer", fontFamily: "inherit",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Continue
                                <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
                                    <path d="M5 3l4 4-4 4" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                                </svg>
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={onClose}
                                style={{
                                    width: "100%", padding: "12px 0", marginTop: 8,
                                    background: "transparent", border: "none",
                                    fontSize: 12, fontWeight: 600, color: "#6b6b5b",
                                    cursor: "pointer", fontFamily: "inherit",
                                    textDecoration: "underline", textUnderlineOffset: 3,
                                    transition: "color 0.2s",
                                }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#aaa"; }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#6b6b5b"; }}
                            >
                                Cancel and return
                            </button>
                        </div>
                    )}

                    {/* ── SLIDE 2: Secure Channel + Create Document ── */}
                    {stage === "secure" && (
                        <div className="swm-slide-content" key="slide2">
                            {/* Illustration — encrypted document cards */}
                            <div style={{
                                background: "linear-gradient(160deg, rgba(232,255,0,0.06) 0%, rgba(232,255,0,0.015) 100%)",
                                border: "1px solid rgba(232,255,0,0.08)",
                                borderRadius: 14,
                                padding: "28px 20px 24px",
                                marginBottom: 20,
                                display: "flex",
                                flexDirection: "column",
                                alignItems: "center",
                            }}>
                                {/* Doc cards row */}
                                <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "center", gap: 6, marginBottom: 18, position: "relative" }}>
                                    {/* Left doc */}
                                    <div style={{
                                        width: 56, height: 72, borderRadius: 8,
                                        background: "rgba(232,255,0,0.12)",
                                        border: "1px solid rgba(232,255,0,0.15)",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                                    }}>
                                        <div style={{ width: 28, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.3)" }} />
                                        <div style={{ width: 20, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.2)" }} />
                                        <div style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.25)" }} />
                                    </div>
                                    {/* Center shield */}
                                    <div style={{
                                        width: 64, height: 80, borderRadius: 10,
                                        background: "rgba(232,255,0,0.15)",
                                        border: "1.5px solid rgba(232,255,0,0.25)",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                                        position: "relative", zIndex: 2,
                                        animation: "swm-float 3s ease-in-out infinite",
                                    }}>
                                        <Shield size={22} style={{ color: "#e8ff00", marginBottom: 4 }} />
                                        <div style={{ display: "flex", gap: 3 }}>
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(232,255,0,0.5)" }} />
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(232,255,0,0.4)" }} />
                                            <div style={{ width: 6, height: 6, borderRadius: "50%", background: "rgba(232,255,0,0.3)" }} />
                                        </div>
                                    </div>
                                    {/* Right doc */}
                                    <div style={{
                                        width: 56, height: 72, borderRadius: 8,
                                        background: "rgba(232,255,0,0.12)",
                                        border: "1px solid rgba(232,255,0,0.15)",
                                        display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 4,
                                    }}>
                                        <div style={{ width: 28, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.3)" }} />
                                        <div style={{ width: 20, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.2)" }} />
                                        <div style={{ width: 24, height: 3, borderRadius: 2, background: "rgba(232,255,0,0.25)" }} />
                                    </div>
                                </div>

                                {/* Secure Channel indicator */}
                                <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                                    <Shield size={14} style={{ color: "#e8ff00" }} />
                                    <span style={{ fontSize: 13, fontWeight: 800, color: "#fff", letterSpacing: "-0.01em" }}>Secure Channel</span>
                                </div>
                                <div style={{ display: "flex", alignItems: "center", gap: 5, marginTop: 4 }}>
                                    <div style={{
                                        width: 7, height: 7, borderRadius: "50%",
                                        background: "#22c55e",
                                        boxShadow: "0 0 6px rgba(34,197,94,0.5)",
                                        animation: "swm-pulse 2s ease-in-out infinite",
                                    }} />
                                    <span style={{ fontSize: 11, color: "#6b6b5b", letterSpacing: "0.02em" }}>End-to-end encryption active</span>
                                </div>
                            </div>

                            {/* CTA */}
                            <button
                                onClick={() => setStage("created")}
                                className="swm-cta"
                                style={{
                                    width: "100%", padding: "16px 20px", borderRadius: 10,
                                    background: "#e8ff00", color: "#0a0a0a",
                                    border: "none", fontSize: 14, fontWeight: 800,
                                    letterSpacing: "0.04em", textTransform: "uppercase",
                                    cursor: "pointer", fontFamily: "inherit",
                                    display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                                    transition: "all 0.2s ease",
                                }}
                            >
                                <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                    <path d="M8 1v6m0 0l2.5-2.5M8 7L5.5 4.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                    <path d="M2 10v2a2 2 0 002 2h8a2 2 0 002-2v-2" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                                </svg>
                                Create Work Document in Fileverse
                            </button>

                            {/* Back + Cancel */}
                            <div style={{ display: "flex", justifyContent: "center", gap: 16, marginTop: 12 }}>
                                <button
                                    onClick={() => setStage("start")}
                                    style={{
                                        background: "transparent", border: "none",
                                        fontSize: 12, fontWeight: 600, color: "#6b6b5b",
                                        cursor: "pointer", fontFamily: "inherit",
                                        textDecoration: "underline", textUnderlineOffset: 3,
                                        transition: "color 0.2s",
                                    }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#aaa"; }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#6b6b5b"; }}
                                >
                                    ← Back
                                </button>
                                <button
                                    onClick={onClose}
                                    style={{
                                        background: "transparent", border: "none",
                                        fontSize: 12, fontWeight: 600, color: "#6b6b5b",
                                        cursor: "pointer", fontFamily: "inherit",
                                        textDecoration: "underline", textUnderlineOffset: 3,
                                        transition: "color 0.2s",
                                    }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#aaa"; }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#6b6b5b"; }}
                                >
                                    Cancel and return
                                </button>
                            </div>
                        </div>
                    )}

                    {stage === "created" && (
                        <div>
                            <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                                <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                <span className="text-[12px] font-medium" style={{ color: "#22c55e" }}>Document created and encrypted — ready to submit</span>
                            </div>
                            <button
                                onClick={() => { setStage("submitting"); setTimeout(() => setStage("done"), 2000); }}
                                className="swm-cta"
                                style={{
                                    width: "100%", padding: "16px 0", borderRadius: 10,
                                    background: "#e8ff00", color: "#0a0a0a",
                                    border: "none", fontSize: 14, fontWeight: 800,
                                    letterSpacing: "0.04em", textTransform: "uppercase",
                                    cursor: "pointer", fontFamily: "inherit",
                                    transition: "all 0.2s ease",
                                }}
                            >
                                Submit
                            </button>
                            <button onClick={onClose}
                                style={{
                                    width: "100%", padding: "12px 0", marginTop: 8,
                                    background: "transparent", border: "none",
                                    fontSize: 12, fontWeight: 600, color: "#6b6b5b",
                                    cursor: "pointer", fontFamily: "inherit", textDecoration: "underline", textUnderlineOffset: 3,
                                }}
                            >
                                Cancel and return
                            </button>
                        </div>
                    )}

                    {stage === "submitting" && (
                        <div className="flex items-center justify-center gap-2 py-10">
                            <Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} />
                            <span className="text-[13px]" style={{ color: "#888" }}>Confirming in MetaMask...</span>
                        </div>
                    )}

                    {stage === "done" && (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-4" style={{ color: "#22c55e" }} />
                            <p className="text-[16px] font-bold text-white mb-1">Work submitted.</p>
                            <p className="text-[12px] mb-5" style={{ color: "#888" }}>Poster has been notified.</p>
                            <button onClick={onClose}
                                style={{
                                    padding: "12px 32px", borderRadius: 10, fontSize: 13, fontWeight: 700,
                                    border: "1px solid #2a2a1a", background: "transparent", color: "#ccc",
                                    cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s ease",
                                }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#2a2a1a"; e.currentTarget.style.color = "#ccc"; }}
                            >
                                Close
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/* ── Applications Tab ── */
interface ApplicationsTabProps {
    onOpenClaimPayment?: (prize: string) => void;
}

const ApplicationsTab: FC<ApplicationsTabProps> = ({ onOpenClaimPayment }) => {
    const [expanded, setExpanded] = useState<number | null>(1);
    const [subTab, setSubTab] = useState<"active" | "completed" | "drafts">("active");
    const [modal, setModal] = useState<"submit" | null>(null);

    return (
        <div className="max-w-2xl mx-auto">
            {/* Secondary Tabs */}
            <div className="flex gap-6 mb-6 border-b" style={{ borderColor: "#222" }}>
                {(["active", "completed", "drafts"] as const).map((t) => (
                    <button
                        key={t}
                        onClick={() => setSubTab(t)}
                        className="pb-2 text-[13px] font-medium capitalize border-b-2 -mb-px transition-colors"
                        style={{
                            color: subTab === t ? "#e8ff00" : "#94a3b8",
                            borderColor: subTab === t ? "#e8ff00" : "transparent",
                            fontFamily: "inherit",
                        }}
                    >
                        {t}
                    </button>
                ))}
            </div>

            {/* Application List */}
            <div className="space-y-1">
                {APPS.map((app) => {
                    const IconC = ICON_MAP[app.icon];
                    const appStyle = STATUS_STYLES[app.appStatus];
                    const isExpanded = expanded === app.id;
                    return (
                        <div key={app.id} className="rounded-lg overflow-hidden" style={{ background: "#0a0a0a" }}>
                            <button
                                onClick={() => setExpanded(isExpanded ? null : app.id)}
                                className="w-full flex items-start gap-4 px-4 py-4 bg-transparent border-none cursor-pointer text-left"
                                style={{ fontFamily: "inherit" }}
                            >
                                <div className="w-10 h-10 rounded flex items-center justify-center flex-shrink-0" style={{ background: "rgba(232,255,0,0.15)" }}>
                                    <IconC className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold text-white">{app.title}</p>
                                    <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>{app.posterEns} • {app.prize}</p>
                                    <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={IDENTITY_STYLE}>
                                            {app.identityStatus === "revealed" ? "REVEALED" : "ANONYMOUS"}
                                        </span>
                                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={appStyle}>
                                            {app.appStatus === "under-review" ? "UNDER REVIEW" : app.appStatus.toUpperCase()}
                                        </span>
                                    </div>
                                </div>
                                {isExpanded ? (
                                    <ChevronUp className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: "#e8ff00" }} />
                                ) : (
                                    <ChevronDown className="w-5 h-5 flex-shrink-0 mt-1" style={{ color: "#94a3b8" }} />
                                )}
                            </button>
                            {isExpanded && app.expandMessage && (
                                <div className="px-4 pb-4 pt-0">
                                    <div className="px-3 py-2 rounded" style={{ background: "#e8ff00" }}>
                                        <p className="text-[12px] font-medium" style={{ color: "#0a0a0a" }}>{app.expandMessage}</p>
                                    </div>
                                    {(app.appStatus === "accepted" || app.appStatus === "under-review") && (
                                        <button onClick={() => setModal("submit")}
                                            className="mt-3 px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                            style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Submit Work</button>
                                    )}
                                    {app.appStatus === "accepted" && (
                                        <button onClick={() => onOpenClaimPayment?.(app.prize)}
                                            className="mt-3 ml-2 px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                            style={{ background: "#22c55e", color: "#fff", fontFamily: "inherit" }}>Claim Payment</button>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {modal === "submit" && <SubmitWorkModal onClose={() => setModal(null)} />}
        </div>
    );
};

export default ApplicationsTab;
