import { useState, type FC, type MouseEvent } from "react";
import { Loader2, CheckCircle2, Lock, Calendar, Rocket, Shield } from "lucide-react";

const CATEGORIES = ["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];

const PostBountyTab: FC = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [deadline, setDeadline] = useState("");
    const [prize, setPrize] = useState("");
    const [privateBrief, setPrivateBrief] = useState(false);
    const [briefText, setBriefText] = useState("");
    const [preview, setPreview] = useState(false);
    const [posting, setPosting] = useState<"idle" | "locking" | "confirm" | "metamask" | "done">("idle");

    const walletBalance = 12450;
    const prizeNum = parseFloat(prize) || 0;
    const canPost = title && desc && category && deadline && prizeNum > 0 && prizeNum <= walletBalance;

    const handlePost = () => {
        if (prizeNum > walletBalance) return;
        setPosting("locking");
        setTimeout(() => setPosting("confirm"), 1500);
    };

    const handleConfirm = () => { setPosting("metamask"); setTimeout(() => setPosting("done"), 2000); };

    const inputStyle = "w-full text-[14px] px-4 py-3 rounded-lg outline-none transition-all border";
    const formBg = "#1a1f1a";

    return (
        <div className="max-w-2xl mx-auto">
            {posting === "done" ? (
                <div className="text-center py-16">
                    <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#22c55e" }} />
                    <h2 className="text-xl font-bold text-white mb-2">Bounty is live.</h2>
                    <p className="text-[13px]" style={{ color: "#888" }}>Hunters see your Funds Verified badge.</p>
                </div>
            ) : posting === "confirm" ? (
                <div className="text-center py-12">
                    <div className="p-6 rounded-xl border inline-block" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <CheckCircle2 className="w-6 h-6 mx-auto mb-3" style={{ color: "#22c55e" }} />
                        <p className="text-[14px] font-bold text-white mb-1">${prizeNum} locked</p>
                        <p className="text-[12px] mb-6" style={{ color: "#888" }}>This guarantees hunters the prize is real.</p>
                        <div className="flex gap-3 justify-center">
                            <button onClick={() => setPosting("idle")} className="px-5 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent" style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>Cancel</button>
                            <button onClick={handleConfirm} className="px-5 py-2.5 rounded-lg text-[12px] font-bold border-none cursor-pointer" style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Confirm</button>
                        </div>
                    </div>
                </div>
            ) : posting === "metamask" || posting === "locking" ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <p className="text-[14px] font-medium" style={{ color: "#888" }}>{posting === "locking" ? `Locking $${prizeNum} in escrow...` : "Awaiting MetaMask approval..."}</p>
                </div>
            ) : (
                <div className="rounded-xl p-6 flex flex-col gap-5" style={{ background: formBg }}>
                    {/* Bounty Title */}
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Bounty Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Smart Contract Security Audit"
                            className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }} />
                    </div>

                    {/* Category */}
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputStyle} appearance-none pr-10`} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#e8ff00", fontFamily: "inherit" }}>
                            <option value="">Select...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    {/* Deadline */}
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Deadline</label>
                        <div className="relative">
                            <input type="text" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="dd-mm-yyyy"
                                className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }} />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#888", pointerEvents: "none" }} />
                        </div>
                    </div>

                    {/* Description (Markdown) */}
                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">Description (Markdown)</label>
                            <button type="button" onClick={() => setPreview(!preview)} className="text-[11px] font-medium bg-transparent border-none cursor-pointer" style={{ color: "#e8ff00", fontFamily: "inherit" }}>
                                {preview ? "Edit" : "Preview"}
                            </button>
                        </div>
                        {preview ? (
                            <div className="p-4 rounded-lg border min-h-[140px] text-[13px]" style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#ccc" }}>{desc || "Nothing to preview"}</div>
                        ) : (
                            <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe the requirements, scope, and deliverables..."
                                className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", resize: "vertical", fontFamily: "inherit" }} />
                        )}
                    </div>

                    {/* Prize Amount */}
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Prize Amount</label>
                        <div className="flex items-center rounded-lg border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                            <input type="number" value={prize} onChange={e => setPrize(e.target.value)} placeholder="0"
                                className="flex-1 px-4 py-3 text-[14px] outline-none border-none bg-transparent text-white" style={{ fontFamily: "inherit" }} />
                            <span className="px-4 py-3 text-[14px] font-semibold" style={{ color: "#e8ff00" }}>USDT</span>
                        </div>
                    </div>

                    {/* Confidential project brief */}
                    <div className="flex items-center justify-between py-2">
                        <div>
                            <p className="text-[13px] font-medium text-white">Confidential project brief</p>
                            <p className="text-[11px] mt-0.5" style={{ color: "#888" }}>Only visible to approved hunters</p>
                        </div>
                        <button type="button" onClick={() => setPrivateBrief(!privateBrief)} className="w-12 h-6 rounded-full relative cursor-pointer flex-shrink-0"
                            style={{ background: privateBrief ? "#e8ff00" : "#333" }}>
                            <div className="absolute top-0.5 w-5 h-5 rounded-full transition-all" style={{ background: "#fff", left: privateBrief ? 26 : 2, boxShadow: "0 1px 2px rgba(0,0,0,0.2)" }} />
                        </button>
                    </div>
                    {privateBrief && (
                        <div>
                            <textarea value={briefText} onChange={e => setBriefText(e.target.value)} rows={4} placeholder="Write sensitive project details here..."
                                className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", resize: "vertical", fontFamily: "inherit" }} />
                        </div>
                    )}

                    {/* Balance section */}
                    <div className="p-4 rounded-lg flex flex-col gap-3" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: "#60a5fa" }} />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">Secured by BitGo</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-[11px] font-bold tracking-[0.15em] uppercase" style={{ color: "#888" }}>Available Balance</p>
                                <p className="text-xl font-bold text-white mt-1">{walletBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })} <span style={{ color: "#e8ff00" }}>USDT</span></p>
                            </div>
                            <button className="px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer" style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>Deposit</button>
                        </div>
                        <div className="flex items-start gap-2 pt-2" style={{ borderTop: "1px solid #1a1a1a" }}>
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#666" }} />
                            <p className="text-[11px]" style={{ color: "#888" }}>Upon posting, prize funds will be <span style={{ color: "#e8ff00" }}>locked in escrow</span> until the bounty is completed or expires.</p>
                        </div>
                        {prizeNum > walletBalance && prizeNum > 0 && <span className="text-[12px] font-bold" style={{ color: "#ef4444" }}>Insufficient balance</span>}
                    </div>

                    {/* CREATE BOUNTY button */}
                    <button onClick={handlePost} disabled={!canPost}
                        className="w-full py-4 rounded-lg text-[14px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all flex items-center justify-center gap-2"
                        style={{ background: canPost ? "#e8ff00" : "#1a1a1a", color: canPost ? "#000" : "#555", cursor: canPost ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (canPost) e.currentTarget.style.transform = "translateY(-1px)"; }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (canPost) e.currentTarget.style.transform = "translateY(0)"; }}>
                        Create Bounty <Rocket className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostBountyTab;
