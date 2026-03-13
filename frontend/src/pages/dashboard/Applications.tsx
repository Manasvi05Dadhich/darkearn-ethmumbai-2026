import { useState, type FC, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, Lock, Copy, Download, ExternalLink, FileText, Settings, Code, Shield } from "lucide-react";

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
    { id: 2, title: "Frontend UI Redesign", posterEns: "design.eth", prize: "$800 USDC", identityStatus: "anonymous", appStatus: "accepted", icon: "gear" },
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
    const [stage, setStage] = useState<"start" | "created" | "submitting" | "done">("start");
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="w-full max-w-md p-8 rounded-xl border" style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-white mb-1">Submit Your Work Privately</h2>
                <p className="text-[12px] mb-6" style={{ color: "#888" }}>Your work will be encrypted via Fileverse. Only the poster can open it.</p>
                {stage === "start" && (
                    <button onClick={() => setStage("created")} className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                        Create Work Document in Fileverse
                    </button>
                )}
                {stage === "created" && (
                    <div>
                        <div className="flex items-center gap-2 mb-4 p-3 rounded-lg" style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}>
                            <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} /><span className="text-[12px] font-medium" style={{ color: "#22c55e" }}>Document created and encrypted — ready to submit</span>
                        </div>
                        <button onClick={() => { setStage("submitting"); setTimeout(() => setStage("done"), 2000); }}
                            className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer" style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Submit</button>
                    </div>
                )}
                {stage === "submitting" && <div className="flex items-center justify-center gap-2 py-6"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} /><span className="text-[13px]" style={{ color: "#888" }}>Confirming in MetaMask...</span></div>}
                {stage === "done" && (
                    <div className="text-center py-4">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
                        <p className="text-[14px] font-bold text-white mb-1">Work submitted.</p>
                        <p className="text-[12px]" style={{ color: "#888" }}>Poster has been notified.</p>
                        <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent" style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>Close</button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Claim Payment Modal ── */
const ClaimPaymentModal: FC<{ prize: string; onClose: () => void }> = ({ prize, onClose }) => {
    const [stage, setStage] = useState<1 | 2 | 3 | 4 | 5>(1);
    const addr = "0x9f2b...4a1c"; const pk = "0x7d8e...c3f1a9b2";
    const startClaim = () => { setTimeout(() => setStage(2), 1000); };
    if (stage === 1) startClaim();
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="w-full max-w-md p-8 rounded-xl border" style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-white mb-1">Receive Your Payment Privately</h2>
                <p className="text-[12px] mb-6" style={{ color: "#888" }}>Payment goes to a brand new wallet address that cannot be linked to your ENS name.</p>
                {stage === 1 && <div className="flex items-center justify-center gap-2 py-6"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} /><span className="text-[12px]" style={{ color: "#888" }}>Generating your one-time payment address...</span></div>}
                {stage >= 2 && (
                    <div>
                        <div className="p-3 rounded-lg mb-3 flex items-center justify-between" style={{ background: "#111", border: "1px solid #1a1a1a" }}>
                            <code className="text-[13px] text-white font-mono">{addr}</code>
                            <button className="bg-transparent border-none cursor-pointer" style={{ color: "#888" }}><Copy className="w-4 h-4" /></button>
                        </div>
                        <div className="p-4 rounded-lg mb-4 border" style={{ background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.2)" }}>
                            <div className="flex gap-3"><Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                                <div>
                                    <p className="text-[12px] font-bold mb-1" style={{ color: "#f59e0b" }}>Save your private key now.</p>
                                    <p className="text-[11px]" style={{ color: "#a08a6a" }}>DarkEarn cannot recover it.</p>
                                    <div className="mt-2 p-2 rounded flex items-center justify-between" style={{ background: "#0a0a0a", border: "1px solid #222" }}>
                                        <code className="text-[11px] text-white font-mono">{pk}</code>
                                        <div className="flex gap-1"><button className="bg-transparent border-none cursor-pointer" style={{ color: "#888" }}><Copy className="w-3.5 h-3.5" /></button><button className="bg-transparent border-none cursor-pointer" style={{ color: "#888" }}><Download className="w-3.5 h-3.5" /></button></div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        {stage === 2 && <button onClick={() => { setStage(3); setTimeout(() => setStage(4), 2000); }}
                            className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer" style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Send My Payment Here</button>}
                        {stage === 3 && <div className="flex items-center justify-center gap-2 py-4"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} /><span className="text-[12px]" style={{ color: "#888" }}>MetaMask approval...</span></div>}
                        {stage >= 4 && (
                            <div className="text-center py-2">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
                                <p className="text-[14px] font-bold text-white mb-1">Payment of {prize} sent.</p>
                                <a href="#" className="text-[12px] font-medium flex items-center gap-1 justify-center" style={{ color: "#3b82f6" }}>View on Basescan <ExternalLink className="w-3 h-3" /></a>
                                <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent" style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>Close</button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Applications Tab ── */
const ApplicationsTab: FC = () => {
    const [expanded, setExpanded] = useState<number | null>(1);
    const [subTab, setSubTab] = useState<"active" | "completed" | "drafts">("active");
    const [modal, setModal] = useState<"submit" | "claim" | null>(null);
    const [claimPrize, setClaimPrize] = useState("");

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
                                        <button onClick={() => { setClaimPrize(app.prize); setModal("claim"); }}
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
            {modal === "claim" && <ClaimPaymentModal prize={claimPrize} onClose={() => setModal(null)} />}
        </div>
    );
};

export default ApplicationsTab;
