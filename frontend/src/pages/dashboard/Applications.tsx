import { useState, type FC, type MouseEvent } from "react";
import { ChevronDown, Loader2, CheckCircle2, Lock, Copy, Download, ExternalLink } from "lucide-react";

type AppStatus = "anonymous" | "revealed" | "accepted" | "rejected" | "work-submitted" | "completed" | "payment-claimed";

interface Application {
    id: number; title: string; posterEns: string; prize: string; status: AppStatus;
    dateApplied: string; applicantNum: number; revealedEns?: string;
}

const STATUS_COLORS: Record<AppStatus, { bg: string; color: string; label: string }> = {
    "anonymous": { bg: "#33333330", color: "#999", label: "Anonymous" },
    "revealed": { bg: "#3b82f620", color: "#60a5fa", label: "Revealed" },
    "accepted": { bg: "#22c55e20", color: "#22c55e", label: "Accepted" },
    "rejected": { bg: "#ef444420", color: "#ef4444", label: "Rejected" },
    "work-submitted": { bg: "#1e40af20", color: "#93c5fd", label: "Work Submitted" },
    "completed": { bg: "#22c55e20", color: "#22c55e", label: "Completed" },
    "payment-claimed": { bg: "#a78bfa20", color: "#a78bfa", label: "Payment Claimed" },
};

const APPS: Application[] = [
    { id: 1, title: "Audit Solidity escrow contract", posterEns: "shadowed.eth", prize: "$5,000 USDC", status: "accepted", dateApplied: "Mar 5, 2026", applicantNum: 3, revealedEns: "shadowed.eth" },
    { id: 2, title: "Build ZK identity module for ENS", posterEns: "vitalik.eth", prize: "$2,400 USDC", status: "anonymous", dateApplied: "Mar 8, 2026", applicantNum: 7 },
    { id: 3, title: "Frontend integration for reputation NFT", posterEns: "builder.eth", prize: "$1,200 USDC", status: "completed", dateApplied: "Feb 20, 2026", applicantNum: 4, revealedEns: "builder.eth" },
    { id: 4, title: "Write technical docs for bridge SDK", posterEns: "0xwriter.eth", prize: "$900 USDC", status: "rejected", dateApplied: "Feb 15, 2026", applicantNum: 2 },
    { id: 5, title: "Design privacy dashboard UI", posterEns: "anon42.eth", prize: "$1,800 USDC", status: "revealed", dateApplied: "Mar 9, 2026", applicantNum: 11 },
];

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
                {stage === 1 && <div className="flex items-center gap-2 py-6 justify-center"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} /><span className="text-[12px]" style={{ color: "#888" }}>Generating your one-time payment address...</span></div>}
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
                        {stage === 3 && <div className="flex items-center gap-2 py-4 justify-center"><Loader2 className="w-5 h-5 animate-spin" style={{ color: "#e8ff00" }} /><span className="text-[12px]" style={{ color: "#888" }}>MetaMask approval...</span></div>}
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
    const [expanded, setExpanded] = useState<number | null>(null);
    const [modal, setModal] = useState<"submit" | "claim" | null>(null);
    const [claimPrize, setClaimPrize] = useState("");

    return (
        <div className="max-w-5xl">
            <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                {APPS.map((app) => {
                    const s = STATUS_COLORS[app.status];
                    const isExpanded = expanded === app.id;
                    return (
                        <div key={app.id} className="border-b" style={{ borderColor: "#111" }}>
                            <button onClick={() => setExpanded(isExpanded ? null : app.id)}
                                className="w-full flex items-center gap-4 px-6 py-4 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-[#0d0d0d]"
                                style={{ fontFamily: "inherit" }}>
                                <span className="flex-1 text-[14px] font-semibold text-white">{app.title}</span>
                                <span className="text-[12px] font-medium hidden sm:block" style={{ color: "#777" }}>{app.posterEns}</span>
                                <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>{app.prize}</span>
                                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-full" style={{ background: s.bg, color: s.color }}>{s.label}</span>
                                <span className="text-[11px] hidden md:block" style={{ color: "#555" }}>{app.dateApplied}</span>
                                <ChevronDown className="w-4 h-4" style={{ color: "#555", transform: isExpanded ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                            </button>
                            {isExpanded && (
                                <div className="px-6 pb-5 pt-1" style={{ borderTop: "1px solid #111" }}>
                                    <p className="text-[13px] mb-3" style={{ color: "#888" }}>
                                        You applied as Applicant #{app.applicantNum} — your identity was anonymous until the poster revealed you.
                                    </p>
                                    {app.revealedEns && <p className="text-[13px] mb-3" style={{ color: "#60a5fa" }}>Poster: <span className="font-semibold text-white">{app.revealedEns}</span></p>}
                                    <div className="flex gap-3 mt-3">
                                        {app.status === "accepted" && (
                                            <button onClick={() => setModal("submit")}
                                                className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                                style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Submit Work</button>
                                        )}
                                        {app.status === "completed" && (
                                            <button onClick={() => { setClaimPrize(app.prize); setModal("claim"); }}
                                                className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                                style={{ background: "#22c55e", color: "#fff", fontFamily: "inherit" }}>Claim Payment</button>
                                        )}
                                    </div>
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
