import { useState, useEffect, type FC, type MouseEvent } from "react";
import { Loader2, CheckCircle2, Lock, Calendar, Rocket, Shield } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { parseEther, pad } from "viem";

const CATEGORIES = ["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];
const CATEGORY_IDS: Record<string, number> = { Solidity: 0, Cairo: 1, Frontend: 2, Security: 3, Content: 4, Design: 5 };

const PostBountyTab: FC = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [deadline, setDeadline] = useState("");
    const [prize, setPrize] = useState("");
    const [privateBrief, setPrivateBrief] = useState(false);
    const [briefText, setBriefText] = useState("");
    const [preview, setPreview] = useState(false);

    const { address } = useAccount();
    const prizeNum = parseFloat(prize) || 0;
    const canPost = title && desc && category && deadline && prizeNum > 0;

    // Contract write
    const { writeContract, data: txHash, isPending, error: postError } = useWriteContract();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const handlePost = () => {
        if (!canPost || !address) return;
        // Parse deadline (dd-mm-yyyy) to unix timestamp
        const parts = deadline.split("-");
        let deadlineTs: bigint;
        if (parts.length === 3) {
            const d = new Date(`${parts[2]}-${parts[1]}-${parts[0]}T23:59:59Z`);
            deadlineTs = BigInt(Math.floor(d.getTime() / 1000));
        } else {
            deadlineTs = BigInt(Math.floor(Date.now() / 1000) + 30 * 86400); // 30 days default
        }

        writeContract({
            ...CONTRACTS.BountyEscrow,
            functionName: "postBounty",
            args: [{
                posterENS: "",
                title,
                description: desc,
                categoryId: BigInt(CATEGORY_IDS[category] ?? 0),
                deadline: deadlineTs,
                prizeAmount: parseEther(prize),
                privateBriefFileverseId: privateBrief ? briefText : "",
                bitgoWalletId: pad("0x0"),
                bitgoLockId: pad("0x0"),
            }],
        });
    };

    const inputStyle = "w-full text-[14px] px-4 py-3 rounded-lg outline-none transition-all border";
    const formBg = "#1a1f1a";

    return (
        <div className="max-w-2xl mx-auto">
            {isConfirmed ? (
                <div className="text-center py-16">
                    <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#22c55e" }} />
                    <h2 className="text-xl font-bold text-white mb-2">Bounty is live.</h2>
                    <p className="text-[13px]" style={{ color: "#888" }}>Hunters can now see and apply to your bounty on the board.</p>
                </div>
            ) : isPending ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <p className="text-[14px] font-medium" style={{ color: "#888" }}>Confirm in your wallet...</p>
                </div>
            ) : (
                <div className="rounded-xl p-6 flex flex-col gap-5" style={{ background: formBg }}>
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Bounty Title</label>
                        <input type="text" value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Smart Contract Security Audit"
                            className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }} />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Category</label>
                        <select value={category} onChange={e => setCategory(e.target.value)} className={`${inputStyle} appearance-none pr-10`} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#e8ff00", fontFamily: "inherit" }}>
                            <option value="">Select...</option>
                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Deadline</label>
                        <div className="relative">
                            <input type="text" value={deadline} onChange={e => setDeadline(e.target.value)} placeholder="dd-mm-yyyy"
                                className={inputStyle} style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }} />
                            <Calendar className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#888", pointerEvents: "none" }} />
                        </div>
                    </div>

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

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">Prize Amount (ETH)</label>
                        <div className="flex items-center rounded-lg border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                            <input type="number" value={prize} onChange={e => setPrize(e.target.value)} placeholder="0"
                                className="flex-1 px-4 py-3 text-[14px] outline-none border-none bg-transparent text-white" style={{ fontFamily: "inherit" }} />
                            <span className="px-4 py-3 text-[14px] font-semibold" style={{ color: "#e8ff00" }}>ETH</span>
                        </div>
                    </div>

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

                    <div className="p-4 rounded-lg flex flex-col gap-3" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: "#60a5fa" }} />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">On-Chain Escrow</span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#666" }} />
                            <p className="text-[11px]" style={{ color: "#888" }}>Upon posting, the bounty is recorded on-chain via the <span style={{ color: "#e8ff00" }}>BountyEscrow</span> contract on Base Sepolia.</p>
                        </div>
                    </div>

                    {postError && (
                        <p className="text-[12px] text-center" style={{ color: "#ef4444" }}>{postError.message?.slice(0, 120)}</p>
                    )}

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
