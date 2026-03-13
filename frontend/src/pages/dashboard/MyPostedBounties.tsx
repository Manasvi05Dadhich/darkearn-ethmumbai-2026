import { useState, type FC, type MouseEvent } from "react";
import { ChevronDown, Eye, CheckCircle2, Loader2, Shield } from "lucide-react";

interface Applicant { id: number; band: number; skills: string[]; message: string; revealed: boolean; ensName?: string; accepted: boolean; }
interface PostedBounty { id: number; title: string; prize: string; status: string; applicants: Applicant[]; deadline: string; }

const POSTED: PostedBounty[] = [
    {
        id: 1, title: "Build privacy-preserving analytics", prize: "$3,000 USDC", status: "Open", deadline: "Apr 5, 2026", applicants: [
            { id: 1, band: 2, skills: ["Frontend", "Solidity"], message: "I have 5 years of experience building DeFi dashboards. My recent work includes...", revealed: false, accepted: false },
            { id: 2, band: 1, skills: ["Frontend"], message: "Interested in this bounty. I specialize in React and data visualization.", revealed: false, accepted: false },
            { id: 3, band: 3, skills: ["Frontend", "Security"], message: "Senior developer with privacy protocol experience. Happy to discuss scope.", revealed: false, accepted: false },
        ]
    },
    {
        id: 2, title: "Audit cross-chain bridge contract", prize: "$4,500 USDC", status: "In Progress", deadline: "Mar 30, 2026", applicants: [
            { id: 4, band: 2, skills: ["Security", "Solidity"], message: "Certified auditor. Completed 50+ audits.", revealed: true, ensName: "auditor.eth", accepted: true },
        ]
    },
];

const MyPostedBountiesTab: FC = () => {
    const [expanded, setExpanded] = useState<number | null>(null);
    const [applicants, setApplicants] = useState<Record<number, Applicant[]>>(() => {
        const m: Record<number, Applicant[]> = {};
        POSTED.forEach(b => { m[b.id] = [...b.applicants]; });
        return m;
    });
    const [revealingId, setRevealingId] = useState<number | null>(null);

    const handleReveal = (bountyId: number, appId: number) => {
        setRevealingId(appId);
        setTimeout(() => {
            setApplicants(prev => ({
                ...prev,
                [bountyId]: prev[bountyId].map(a => a.id === appId ? { ...a, revealed: true, ensName: `contributor${appId}.eth` } : a)
            }));
            setRevealingId(null);
        }, 1500);
    };

    const handleAccept = (bountyId: number, appId: number) => {
        setApplicants(prev => ({
            ...prev,
            [bountyId]: prev[bountyId].map(a => a.id === appId ? { ...a, accepted: true } : a)
        }));
    };

    return (
        <div className="max-w-5xl">
            <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                {POSTED.map(bounty => {
                    const isExpanded = expanded === bounty.id;
                    const apps = applicants[bounty.id] || [];
                    return (
                        <div key={bounty.id} style={{ borderBottom: "1px solid #111" }}>
                            <button onClick={() => setExpanded(isExpanded ? null : bounty.id)}
                                className="w-full flex items-center gap-4 px-6 py-4 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-[#0d0d0d]"
                                style={{ fontFamily: "inherit" }}>
                                <span className="flex-1 text-[14px] font-semibold text-white">{bounty.title}</span>
                                <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>{bounty.prize}</span>
                                <span className="text-[11px] font-bold uppercase px-2 py-1 rounded" style={{ background: bounty.status === "Open" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)", color: bounty.status === "Open" ? "#22c55e" : "#60a5fa" }}>{bounty.status}</span>
                                <span className="text-[11px]" style={{ color: "#555" }}>{apps.length} applicants</span>
                                <span className="text-[11px] hidden md:block" style={{ color: "#555" }}>{bounty.deadline}</span>
                                <ChevronDown className="w-4 h-4" style={{ color: "#555", transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                            </button>
                            {isExpanded && (
                                <div className="px-6 pb-5 flex flex-col gap-4" style={{ borderTop: "1px solid #111" }}>
                                    {apps.map(app => (
                                        <div key={app.id} className="p-4 rounded-lg border" style={{ background: "#060606", borderColor: "#1a1a1a" }}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[14px] font-bold text-white">{app.revealed ? app.ensName : `Applicant #${app.id}`}</span>
                                                <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}>B{app.band}</span>
                                                {app.skills.map(s => <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#111", color: "#777" }}>{s}</span>)}
                                            </div>
                                            <p className="text-[13px] mb-3" style={{ color: "#888" }}>{app.message}</p>
                                            <div className="flex gap-3">
                                                {!app.revealed && !app.accepted && (
                                                    <button onClick={() => handleReveal(bounty.id, app.id)} disabled={revealingId === app.id}
                                                        className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center gap-2"
                                                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                                        {revealingId === app.id ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Revealing...</> : <><Eye className="w-3.5 h-3.5" /> Reveal Identity</>}
                                                    </button>
                                                )}
                                                {app.revealed && !app.accepted && (
                                                    <button onClick={() => handleAccept(bounty.id, app.id)}
                                                        className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                                        style={{ background: "#22c55e", color: "#fff", fontFamily: "inherit" }}>Accept</button>
                                                )}
                                                {app.accepted && (
                                                    <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: "#22c55e" }}><CheckCircle2 className="w-4 h-4" /> Accepted</span>
                                                )}
                                                {!app.accepted && (
                                                    <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                                        style={{ background: "#222", color: "#888", fontFamily: "inherit" }}>Reject</button>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default MyPostedBountiesTab;
