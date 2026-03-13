import { useState, type FC, type MouseEvent } from "react";
import { Loader2, CheckCircle2, Lock, Eye } from "lucide-react";

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

    const walletBalance = 2500;
    const prizeNum = parseFloat(prize) || 0;
    const canPost = title && desc && category && deadline && prizeNum > 0 && prizeNum <= walletBalance;

    const handlePost = () => {
        if (prizeNum > walletBalance) return;
        setPosting("locking");
        setTimeout(() => setPosting("confirm"), 1500);
    };

    const handleConfirm = () => { setPosting("metamask"); setTimeout(() => setPosting("done"), 2000); };

    const inputStyle = "w-full bg-[#060606] text-white text-[14px] px-4 py-3 rounded-lg outline-none transition-all border";

    return (
        <div className="max-w-2xl">
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
                <>
                    <div className="flex flex-col gap-5">
                        <div>
                            <label className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: "#888" }}>Title</label>
                            <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Build ZK identity module"
                                className={inputStyle} style={{ borderColor: "#1a1a1a" }} />
                        </div>
                        <div>
                            <div className="flex items-center justify-between mb-2">
                                <label className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Description</label>
                                <button onClick={() => setPreview(!preview)} className="text-[11px] font-medium bg-transparent border-none cursor-pointer flex items-center gap-1"
                                    style={{ color: "#e8ff00", fontFamily: "inherit" }}><Eye className="w-3 h-3" /> {preview ? "Edit" : "Preview"}</button>
                            </div>
                            {preview ? <div className="p-4 rounded-lg border min-h-[120px] text-[13px]" style={{ background: "#060606", borderColor: "#1a1a1a", color: "#ccc" }}>{desc || "Nothing to preview"}</div>
                                : <textarea value={desc} onChange={e => setDesc(e.target.value)} rows={5} placeholder="Describe the bounty in detail. Markdown supported."
                                    className={inputStyle} style={{ borderColor: "#1a1a1a", resize: "vertical" }} />}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: "#888" }}>Category</label>
                                <select value={category} onChange={e => setCategory(e.target.value)} className={inputStyle} style={{ borderColor: "#1a1a1a" }}>
                                    <option value="">Select...</option>
                                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: "#888" }}>Deadline</label>
                                <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className={inputStyle} style={{ borderColor: "#1a1a1a" }} />
                            </div>
                        </div>
                        <div>
                            <label className="text-[11px] font-bold tracking-widest uppercase block mb-2" style={{ color: "#888" }}>Prize Amount (USDC)</label>
                            <input type="number" value={prize} onChange={e => setPrize(e.target.value)} placeholder="e.g. 500" className={inputStyle} style={{ borderColor: "#1a1a1a" }} />
                            <p className="text-[11px] mt-1" style={{ color: "#555" }}>This amount will be publicly visible on the bounty board</p>
                        </div>

                        {/* Private Brief */}
                        <div className="p-4 rounded-lg border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                            <label className="flex items-center justify-between cursor-pointer">
                                <div className="flex items-center gap-2"><Lock className="w-4 h-4" style={{ color: "#f59e0b" }} /><span className="text-[13px] font-medium text-white">Add confidential project brief</span></div>
                                <div className="w-10 h-5 rounded-full relative cursor-pointer" style={{ background: privateBrief ? "#e8ff00" : "#333" }} onClick={() => setPrivateBrief(!privateBrief)}>
                                    <div className="absolute top-0.5 w-4 h-4 rounded-full transition-all" style={{ background: "#fff", left: privateBrief ? 22 : 2 }} />
                                </div>
                            </label>
                            {privateBrief && (
                                <div className="mt-3">
                                    <textarea value={briefText} onChange={e => setBriefText(e.target.value)} rows={4} placeholder="Write sensitive project details here..."
                                        className={inputStyle} style={{ borderColor: "#1a1a1a", resize: "vertical" }} />
                                    <p className="text-[11px] mt-1" style={{ color: "#a08a6a" }}>Encrypted by Fileverse — only accepted applicants can read this</p>
                                </div>
                            )}
                        </div>

                        {/* Wallet Balance */}
                        <div className="p-4 rounded-lg border flex items-center justify-between" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                            <div><p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>BitGo Wallet Balance</p><p className="text-[16px] font-bold text-white mt-1">${walletBalance.toLocaleString()} USDC</p></div>
                            {prizeNum > walletBalance && <span className="text-[12px] font-bold" style={{ color: "#ef4444" }}>Insufficient balance</span>}
                        </div>

                        <button onClick={handlePost} disabled={!canPost}
                            className="w-full py-4 rounded-lg text-[14px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                            style={{ background: canPost ? "#e8ff00" : "#1a1a1a", color: canPost ? "#000" : "#555", cursor: canPost ? "pointer" : "not-allowed", fontFamily: "inherit" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (canPost) e.currentTarget.style.transform = "translateY(-1px)"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (canPost) e.currentTarget.style.transform = "translateY(0)"; }}>
                            Post Bounty
                        </button>
                    </div>
                </>
            )}
        </div>
    );
};

export default PostBountyTab;
