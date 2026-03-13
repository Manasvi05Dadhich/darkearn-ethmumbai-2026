import { useState, type FC } from "react";
import { Send, Loader2, CheckCircle2, Box, Network, Cpu, Diamond, SlidersHorizontal, ChevronDown, ArrowLeft, Info, CalendarDays, Shield, Lock, Wallet } from "lucide-react";

const CONTRIBUTORS = [
    { id: 4721, band: 3, skills: ["Solidity", "Cairo"], lastActive: "3 days ago", completions: 45, icon: Box },
    { id: 8832, band: 2, skills: ["Rust", "Go"], lastActive: "1 day ago", completions: 122, icon: Network },
    { id: 1054, band: 4, skills: ["Python", "Vyper"], lastActive: "5 hours ago", completions: 89, icon: Cpu },
    { id: 2967, band: 1, skills: ["TypeScript"], lastActive: "1 week ago", completions: 12, icon: Diamond },
];

const FindContributorsTab: FC = () => {
    const [bidModal, setBidModal] = useState<number | null>(null);
    const [bidSending, setBidSending] = useState(false);
    const [bidSent, setBidSent] = useState(false);
    const [filterBand, setFilterBand] = useState("all");
    const [filterSkill, setFilterSkill] = useState("all");
    const [filterLastActive, setFilterLastActive] = useState("all");

    const filtered = CONTRIBUTORS.filter(c => {
        if (filterBand !== "all" && c.band !== parseInt(filterBand)) return false;
        if (filterSkill !== "all" && !c.skills.includes(filterSkill)) return false;
        if (filterLastActive === "today" && !(c.lastActive.includes("hours") || c.lastActive.includes("day"))) return false;
        if (filterLastActive === "week" && !c.lastActive.includes("week")) return false;
        return true;
    });

    const handleSend = () => { setBidSending(true); setTimeout(() => { setBidSending(false); setBidSent(true); }, 2000); };

    return (
        <div className="max-w-6xl">
            <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-md flex items-center justify-center" style={{ background: "#e8ff00", color: "#0a0a0a" }}>
                        <Send className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-extrabold italic text-white">DARKEARN</h2>
                </div>
                <div className="w-8 h-8 rounded-full border flex items-center justify-center" style={{ borderColor: "#665f00", color: "#e8ff00" }}>
                    <Send className="w-3.5 h-3.5" />
                </div>
            </div>

            {/* Filters */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="relative">
                    <select value={filterBand} onChange={e => setFilterBand(e.target.value)}
                        className="appearance-none bg-[#3a3915] text-white text-[12px] font-bold uppercase px-4 pr-9 py-3 rounded border outline-none"
                        style={{ borderColor: "#57531e", fontFamily: "inherit" }}>
                        <option value="all">Band</option>
                        {[1, 2, 3, 4].map(b => <option key={b} value={b}>Band {b}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#d4d4aa" }} />
                </div>
                <div className="relative">
                    <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
                        className="appearance-none bg-[#3a3915] text-white text-[12px] font-bold uppercase px-4 pr-9 py-3 rounded border outline-none"
                        style={{ borderColor: "#57531e", fontFamily: "inherit" }}>
                        <option value="all">Skills</option>
                        {["Solidity", "Cairo", "Rust", "Go", "Python", "Vyper", "TypeScript"].map(s => <option key={s} value={s}>{s}</option>)}
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#d4d4aa" }} />
                </div>
                <div className="relative">
                    <select value={filterLastActive} onChange={e => setFilterLastActive(e.target.value)}
                        className="appearance-none bg-[#3a3915] text-white text-[12px] font-bold uppercase px-4 pr-9 py-3 rounded border outline-none"
                        style={{ borderColor: "#57531e", fontFamily: "inherit" }}>
                        <option value="all">Last Active</option>
                        <option value="today">Today</option>
                        <option value="week">This Week</option>
                    </select>
                    <ChevronDown className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: "#d4d4aa" }} />
                </div>
                <button
                    type="button"
                    className="w-10 h-10 rounded border-none flex items-center justify-center cursor-pointer"
                    style={{ background: "#e8ff00", color: "#0a0a0a", fontFamily: "inherit" }}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
            </div>

            {/* Directory list */}
            <div className="flex flex-col gap-4">
                {filtered.map(c => {
                    const Icon = c.icon;
                    return (
                        <div key={c.id} className="rounded border px-5 py-4 flex items-start justify-between gap-6" style={{ background: "#171707", borderColor: "#2e2b11" }}>
                            <div className="flex items-start gap-4">
                                <div className="w-14 h-14 rounded flex items-center justify-center" style={{ background: "linear-gradient(135deg, #7f7a14, #3c3a0f)" }}>
                                    <Icon className="w-7 h-7" style={{ color: "#e8ff00" }} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-extrabold text-white mb-1">Contributor #{c.id}</h3>
                                    <div className="flex items-center gap-2 flex-wrap mb-2">
                                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "#e8ff00", color: "#0a0a0a" }}>BAND {c.band}</span>
                                        <span className="text-[11px]" style={{ color: "#7c8798" }}>{c.completions} Completions</span>
                                    </div>
                                    <div className="flex items-center gap-2 flex-wrap mb-4">
                                        {c.skills.map(s => (
                                            <span key={s} className="text-[10px] px-2 py-0.5 rounded-full border" style={{ borderColor: "#7b730f", color: "#e8ff00" }}>
                                                {s}
                                            </span>
                                        ))}
                                    </div>
                                    <p className="text-[12px] italic" style={{ color: "#7c8798" }}>
                                        <span style={{ color: "#22c55e" }}>●</span> Active {c.lastActive}
                                    </p>
                                </div>
                            </div>
                            <button onClick={() => { setBidModal(c.id); setBidSent(false); }}
                                className="mt-2 px-5 py-3 rounded text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer whitespace-nowrap"
                                style={{ background: "#e8ff00", color: "#0a0a0a", fontFamily: "inherit" }}>
                                Send Private Bid
                            </button>
                        </div>
                    );
                })}
            </div>

            {/* Bid Modal */}
            {bidModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={() => setBidModal(null)}>
                    <div className="w-full max-w-md p-8 rounded-xl border" style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }} onClick={e => e.stopPropagation()}>
                        {bidSent ? (
                            <div className="text-center py-4">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
                                <p className="text-[14px] font-bold text-white mb-1">Encrypted bid sent.</p>
                                <p className="text-[12px]" style={{ color: "#888" }}>Only they can read it.</p>
                                <button onClick={() => setBidModal(null)} className="mt-4 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent" style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>Close</button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setBidModal(null)}
                                            className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center"
                                            style={{ color: "#fff", fontFamily: "inherit" }}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <h2 className="text-[22px] font-extrabold text-white">Send Private Bid</h2>
                                    </div>
                                    <Info className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                </div>

                                <div className="mb-6">
                                    <span
                                        className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-4"
                                        style={{ background: "rgba(232,255,0,0.12)", color: "#e8ff00" }}
                                    >
                                        <span className="w-2 h-2 rounded-full" style={{ background: "#e8ff00" }} />
                                        Secure Channel
                                    </span>
                                    <h3 className="text-[16px] font-extrabold text-white mb-2">Send Private Bid to Contributor #{bidModal}</h3>
                                    <p className="text-[13px]" style={{ color: "#e8ff00" }}>Direct peer-to-peer encrypted communication.</p>
                                </div>

                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Scope of Work</label>
                                        <textarea
                                            rows={5}
                                            placeholder="Describe the specific tasks, milestones, and deliverables for this private assignment..."
                                            className="w-full bg-[#121208] text-white text-[14px] px-4 py-4 rounded border outline-none"
                                            style={{ borderColor: "#4a4816", resize: "vertical", fontFamily: "inherit" }}
                                        />
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Prize Amount</label>
                                        <div className="flex items-center rounded border overflow-hidden" style={{ borderColor: "#4a4816", background: "#121208" }}>
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                className="flex-1 bg-transparent text-white text-[14px] px-4 py-3 outline-none border-none"
                                                style={{ fontFamily: "inherit" }}
                                            />
                                            <div className="px-4 py-3 flex items-center gap-2 border-l" style={{ borderColor: "#4a4816", color: "#e8ff00" }}>
                                                <span className="text-[12px] font-bold uppercase">USDT</span>
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">Deadline</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="dd-mm-yyyy"
                                                className="w-full bg-[#121208] text-white text-[14px] px-4 py-3 rounded border outline-none"
                                                style={{ borderColor: "#4a4816", fontFamily: "inherit" }}
                                            />
                                            <CalendarDays className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2" style={{ color: "#e8ff00" }} />
                                        </div>
                                    </div>

                                    <div className="rounded border p-4" style={{ background: "rgba(232,255,0,0.04)", borderColor: "#4a4816" }}>
                                        <div className="flex gap-3">
                                            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#e8ff00" }} />
                                            <p className="text-[12px] leading-relaxed" style={{ color: "#e8ff00" }}>
                                                <span className="font-bold">Security Notice:</span> This bid will be encrypted with the contributor&apos;s public key.
                                                Only they can decrypt and read the contents of this proposal. Your privacy is cryptographically guaranteed.
                                            </p>
                                        </div>
                                    </div>

                                    <button onClick={handleSend} disabled={bidSending}
                                        className="w-full py-4 rounded-lg text-[14px] font-bold border-none cursor-pointer flex items-center justify-center gap-2"
                                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                        {bidSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting...</> : <><Shield className="w-4 h-4" /> Send Encrypted Bid</>}
                                    </button>

                                    <button
                                        onClick={() => setBidModal(null)}
                                        className="w-full py-2 text-[13px] font-medium border-none bg-transparent cursor-pointer"
                                        style={{ color: "#a3a3a3", fontFamily: "inherit" }}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default FindContributorsTab;
