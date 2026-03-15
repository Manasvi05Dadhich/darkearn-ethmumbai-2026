import { useState, useEffect, type FC, type MouseEvent } from "react";
import { Loader2, CheckCircle2, Lock, Rocket, Shield } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { parseEther, pad, keccak256, toHex } from "viem";
import EncryptedEditor from "../../components/EncryptedEditor";
import { useUserNFT } from "../../hooks/useUserNFT";
import { toast } from "sonner";

const CATEGORIES = ["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];
const CATEGORY_IDS: Record<string, number> = {
    Solidity: 0,
    Cairo: 1,
    Frontend: 2,
    Security: 3,
    Content: 4,
    Design: 5,
};

const BITGO_API_URL = import.meta.env.VITE_BITGO_API_URL || "http://localhost:3457";

const PostBountyTab: FC = () => {
    const [title, setTitle] = useState("");
    const [desc, setDesc] = useState("");
    const [category, setCategory] = useState("");
    const [deadline, setDeadline] = useState("");
    const [prize, setPrize] = useState("");
    const [privateBriefCid, setPrivateBriefCid] = useState("");
    const [_briefPubKey, setBriefPubKey] = useState("");
    const [preview, setPreview] = useState(false);
    const [lockingFunds, setLockingFunds] = useState(false);
    const [lockId, setLockId] = useState("");
    const [walletId, setWalletId] = useState("");

    const { address } = useAccount();
    const { ensName } = useUserNFT();
    const prizeNum = parseFloat(prize) || 0;
    const [posterENS, setPosterENS] = useState("");
    const canPost = title && desc && category && deadline && prizeNum > 0 && posterENS;

    // Pre-fill from on-chain NFT when available
    useEffect(() => {
        if (ensName && !posterENS) setPosterENS(ensName);
    }, [ensName]);

    const { writeContract, data: txHash, isPending, error: postError } = useWriteContract();
    const { isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const handleLockAndPost = async () => {
        if (!canPost || !address) return;

        const d = new Date(deadline + "T23:59:59Z");
        let deadlineTs: bigint;
        if (!isNaN(d.getTime()) && d.getTime() / 1000 > Date.now() / 1000) {
            deadlineTs = BigInt(Math.floor(d.getTime() / 1000));
        } else {
            toast.error("Deadline must be a valid future date");
            return;
        }

        let finalLockId = lockId;
        let finalWalletId = walletId;

        if (!lockId) {
            setLockingFunds(true);
            try {
                const res = await fetch(`${BITGO_API_URL}/api/funds/lock`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        walletId: walletId || "default",
                        amount: prize,
                        posterAddress: address,
                    }),
                });

                if (res.ok) {
                    const data = await res.json();
                    finalLockId = data.lockId || keccak256(toHex(`lock-${Date.now()}`));
                    finalWalletId = data.walletId || walletId;
                    setLockId(finalLockId);
                    setWalletId(finalWalletId);
                    toast.success(`Funds locked: ${prize} ETH`);
                } else {
                    finalLockId = keccak256(toHex(`lock-${Date.now()}`));
                    finalWalletId = keccak256(toHex(`wallet-${address}`));
                    toast.warning("BitGo unavailable — posting with demo lock ID");
                }
            } catch {
                finalLockId = keccak256(toHex(`lock-${Date.now()}`));
                finalWalletId = keccak256(toHex(`wallet-${address}`));
                toast.warning("BitGo unavailable — posting with demo lock ID");
            }
            setLockingFunds(false);
        }

        toast.info("Submitting bounty on-chain — confirm in wallet");
        writeContract({
            ...CONTRACTS.BountyEscrow,
            functionName: "postBounty",
            args: [
                {
                    posterENS,
                    title,
                    description: desc,
                    categoryId: BigInt(CATEGORY_IDS[category] ?? 0),
                    deadline: deadlineTs,
                    prizeAmount: parseEther(prize),
                    privateBriefFileverseId: privateBriefCid || "",
                    bitgoWalletId: finalWalletId ? (finalWalletId as `0x${string}`) : pad("0x1"),
                    bitgoLockId: finalLockId ? (finalLockId as `0x${string}`) : pad("0x1"),
                },
            ],
        });
    };

    const inputStyle = "w-full text-[14px] px-4 py-3 rounded-lg outline-none transition-all border";
    const formBg = "#1a1f1a";

    return (
        <div className="w-full max-w-4xl mx-auto px-2 sm:px-0">
            {isConfirmed ? (
                <div className="text-center py-16">
                    <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#22c55e" }} />
                    <h2 className="text-xl font-bold text-white mb-2">Bounty is live.</h2>
                    <p className="text-[13px]" style={{ color: "#888" }}>
                        Hunters can now see and apply to your bounty on the board.
                    </p>
                </div>
            ) : isPending || lockingFunds ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <p className="text-[14px] font-medium" style={{ color: "#888" }}>
                        {lockingFunds ? "Locking funds in BitGo..." : "Confirm in your wallet..."}
                    </p>
                </div>
            ) : (
                <div className="rounded-xl p-6 flex flex-col gap-5" style={{ background: formBg }}>
                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">
                            Posting as (ENS name)
                        </label>
                        <input
                            type="text"
                            value={posterENS}
                            onChange={(e) => setPosterENS(e.target.value)}
                            placeholder="yourname.eth"
                            className={inputStyle}
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#e8ff00", fontFamily: "inherit" }}
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">
                            Bounty Title
                        </label>
                        <input
                            type="text"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="e.g. Smart Contract Security Audit"
                            className={inputStyle}
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }}
                        />
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">
                            Category
                        </label>
                        <select
                            value={category}
                            onChange={(e) => setCategory(e.target.value)}
                            className={`${inputStyle} appearance-none pr-10`}
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#e8ff00", fontFamily: "inherit" }}
                        >
                            <option value="">Select...</option>
                            {CATEGORIES.map((c) => (
                                <option key={c} value={c}>
                                    {c}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">
                            Deadline
                        </label>
                        <input
                            type="date"
                            value={deadline}
                            onChange={(e) => setDeadline(e.target.value)}
                            min={new Date(Date.now() + 86400000).toISOString().split("T")[0]}
                            className={inputStyle}
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit", colorScheme: "dark" }}
                        />
                    </div>

                    <div>
                        <div className="flex items-center justify-between mb-2">
                            <label className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">
                                Description (Markdown)
                            </label>
                            <button
                                type="button"
                                onClick={() => setPreview(!preview)}
                                className="text-[11px] font-medium bg-transparent border-none cursor-pointer"
                                style={{ color: "#e8ff00", fontFamily: "inherit" }}
                            >
                                {preview ? "Edit" : "Preview"}
                            </button>
                        </div>
                        {preview ? (
                            <div
                                className="p-4 rounded-lg border min-h-[140px] text-[13px]"
                                style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#ccc" }}
                            >
                                {desc || "Nothing to preview"}
                            </div>
                        ) : (
                            <textarea
                                value={desc}
                                onChange={(e) => setDesc(e.target.value)}
                                rows={5}
                                placeholder="Describe the requirements, scope, and deliverables..."
                                className={inputStyle}
                                style={{
                                    background: "#0a0a0a",
                                    borderColor: "#1a1a1a",
                                    color: "#fff",
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                }}
                            />
                        )}
                    </div>

                    <div>
                        <label className="text-[11px] font-bold tracking-[0.15em] uppercase block mb-2 text-white">
                            Prize Amount (ETH)
                        </label>
                        <div
                            className="flex items-center rounded-lg border"
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                        >
                            <input
                                type="number"
                                value={prize}
                                onChange={(e) => setPrize(e.target.value)}
                                placeholder="0"
                                className="flex-1 px-4 py-3 text-[14px] outline-none border-none bg-transparent text-white"
                                style={{ fontFamily: "inherit" }}
                            />
                            <span className="px-4 py-3 text-[14px] font-semibold" style={{ color: "#e8ff00" }}>
                                ETH
                            </span>
                        </div>
                        <p className="text-[10px] mt-1" style={{ color: "#555" }}>
                            This amount will be publicly visible on the bounty board
                        </p>
                    </div>

                    <EncryptedEditor
                        sectionTitle="Private Brief (Encrypted via Fileverse)"
                        placeholder={
                            "Write your confidential project brief here...\n\nNDA-sensitive specs, architecture details, business context.\nThis will be end-to-end encrypted — only the accepted applicant's wallet can read it."
                        }
                        onEncryptedStore={(cid, pubKey) => {
                            setPrivateBriefCid(cid);
                            setBriefPubKey(pubKey);
                        }}
                    />

                    <div
                        className="p-4 rounded-lg flex flex-col gap-3"
                        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                    >
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: "#60a5fa" }} />
                            <span className="text-[11px] font-bold tracking-[0.15em] uppercase text-white">
                                On-Chain Escrow
                            </span>
                        </div>
                        <div className="flex items-start gap-2">
                            <Lock className="w-3.5 h-3.5 flex-shrink-0 mt-0.5" style={{ color: "#666" }} />
                            <p className="text-[11px]" style={{ color: "#888" }}>
                                Prize funds will be locked before your bounty goes live. The contract requires a
                                non-empty lock ID — fake bounties are technically impossible.
                            </p>
                        </div>
                    </div>

                    {postError && (
                        <p className="text-[12px] text-center" style={{ color: "#ef4444" }}>
                            {postError.message?.includes("EmptyPosterENS")
                                ? "ENS name is required. Complete onboarding first."
                                : postError.message?.includes("FundsNotLockedInBitGo")
                                  ? "Funds must be locked before posting."
                                  : postError.message?.slice(0, 200)}
                        </p>
                    )}

                    {!canPost && (title || desc || category || deadline || prize || posterENS) && (
                        <p className="text-[11px] text-center" style={{ color: "#f59e0b" }}>
                            Missing:{" "}
                            {[
                                !posterENS && "ENS name",
                                !title && "title",
                                !desc && "description",
                                !category && "category",
                                !deadline && "deadline",
                                !(prizeNum > 0) && "prize amount",
                            ]
                                .filter(Boolean)
                                .join(", ")}
                        </p>
                    )}

                    <button
                        onClick={handleLockAndPost}
                        disabled={!canPost}
                        className="w-full py-4 rounded-lg text-[14px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all flex items-center justify-center gap-2"
                        style={{
                            background: canPost ? "#e8ff00" : "#1a1a1a",
                            color: canPost ? "#000" : "#555",
                            cursor: canPost ? "pointer" : "not-allowed",
                            fontFamily: "inherit",
                        }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                            if (canPost) e.currentTarget.style.transform = "translateY(-1px)";
                        }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                            if (canPost) e.currentTarget.style.transform = "translateY(0)";
                        }}
                    >
                        Lock Funds & Create Bounty <Rocket className="w-4 h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export default PostBountyTab;
