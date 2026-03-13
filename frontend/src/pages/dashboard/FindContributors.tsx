import { useState, type FC, type MouseEvent } from "react";
import { Send, Loader2, CheckCircle2 } from "lucide-react";

const CONTRIBUTORS = [
    { id: 4721, band: 3, skills: ["Solidity", "Security"], lastActive: "3 days ago", completions: 18 },
    { id: 1893, band: 2, skills: ["Frontend", "Design"], lastActive: "1 day ago", completions: 9 },
    { id: 6204, band: 4, skills: ["Solidity", "Cairo"], lastActive: "5 hours ago", completions: 32 },
    { id: 3517, band: 2, skills: ["Content"], lastActive: "2 days ago", completions: 11 },
    { id: 8829, band: 3, skills: ["Security", "Solidity"], lastActive: "1 week ago", completions: 21 },
    { id: 2045, band: 2, skills: ["Design", "Frontend"], lastActive: "4 days ago", completions: 8 },
];

const FindContributorsTab: FC = () => {
    const [bidModal, setBidModal] = useState<number | null>(null);
    const [bidSending, setBidSending] = useState(false);
    const [bidSent, setBidSent] = useState(false);
    const [filterBand, setFilterBand] = useState("all");
    const [filterSkill, setFilterSkill] = useState("all");

    const filtered = CONTRIBUTORS.filter(c => {
        if (filterBand !== "all" && c.band !== parseInt(filterBand)) return false;
        if (filterSkill !== "all" && !c.skills.includes(filterSkill)) return false;
        return true;
    });

    const handleSend = () => { setBidSending(true); setTimeout(() => { setBidSending(false); setBidSent(true); }, 2000); };

    return (
        <div className="max-w-5xl">
            {/* Filters */}
            <div className="flex items-center gap-4 mb-6 flex-wrap">
                <select value={filterBand} onChange={e => setFilterBand(e.target.value)}
                    className="bg-[#0a0a0a] text-white text-[13px] px-4 py-2.5 rounded-lg border outline-none" style={{ borderColor: "#1a1a1a" }}>
                    <option value="all">All Bands</option>
                    {[2, 3, 4].map(b => <option key={b} value={b}>Band {b}</option>)}
                </select>
                <select value={filterSkill} onChange={e => setFilterSkill(e.target.value)}
                    className="bg-[#0a0a0a] text-white text-[13px] px-4 py-2.5 rounded-lg border outline-none" style={{ borderColor: "#1a1a1a" }}>
                    <option value="all">All Skills</option>
                    {["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"].map(s => <option key={s} value={s}>{s}</option>)}
                </select>
            </div>

            {/* Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {filtered.map(c => (
                    <div key={c.id} className="p-6 rounded-xl border transition-colors" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        {/* Abstract Avatar */}
                        <div className="w-12 h-12 rounded-full mb-4 flex items-center justify-center" style={{
                            background: `linear-gradient(135deg, hsl(${c.id % 360}, 60%, 30%), hsl(${(c.id * 7) % 360}, 50%, 20%))`,
                            border: "2px solid #222"
                        }}>
                            <div className="w-4 h-4 rounded-sm" style={{ background: `hsl(${(c.id * 3) % 360}, 40%, 50%)`, transform: `rotate(${c.id % 90}deg)` }} />
                        </div>
                        <h3 className="text-[14px] font-bold text-white mb-2">Contributor #{c.id}</h3>
                        <div className="flex items-center gap-2 mb-3 flex-wrap">
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded" style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}>B{c.band}</span>
                            {c.skills.map(s => <span key={s} className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ background: "#111", color: "#777" }}>{s}</span>)}
                        </div>
                        <p className="text-[11px] mb-1" style={{ color: "#555" }}>Active {c.lastActive}</p>
                        <p className="text-[11px] mb-4" style={{ color: "#555" }}>{c.completions} completions</p>
                        <button onClick={() => { setBidModal(c.id); setBidSent(false); }}
                            className="w-full py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border cursor-pointer bg-transparent transition-colors flex items-center justify-center gap-2"
                            style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#ccc"; }}>
                            <Send className="w-3.5 h-3.5" /> Send Private Bid
                        </button>
                    </div>
                ))}
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
                                <h2 className="text-lg font-bold text-white mb-1">Send Private Bid</h2>
                                <p className="text-[12px] mb-5" style={{ color: "#888" }}>This bid will be encrypted. Only they can read it.</p>
                                <div className="flex flex-col gap-4">
                                    <textarea rows={4} placeholder="Scope of work..." className="w-full bg-[#060606] text-white text-[13px] px-4 py-3 rounded-lg border outline-none" style={{ borderColor: "#1a1a1a", resize: "vertical" }} />
                                    <div className="grid grid-cols-2 gap-3">
                                        <input type="number" placeholder="Prize (USDC)" className="bg-[#060606] text-white text-[13px] px-4 py-3 rounded-lg border outline-none" style={{ borderColor: "#1a1a1a" }} />
                                        <input type="date" className="bg-[#060606] text-white text-[13px] px-4 py-3 rounded-lg border outline-none" style={{ borderColor: "#1a1a1a" }} />
                                    </div>
                                    <button onClick={handleSend} disabled={bidSending}
                                        className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-2"
                                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                        {bidSending ? <><Loader2 className="w-4 h-4 animate-spin" /> Encrypting...</> : "Send Encrypted Bid"}
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
