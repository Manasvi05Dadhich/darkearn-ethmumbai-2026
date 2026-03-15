import { useState, useMemo, type FC } from "react";
import {
    Send,
    Loader2,
    CheckCircle2,
    Box,
    SlidersHorizontal,
    ChevronDown,
    ArrowLeft,
    Info,
    CalendarDays,
    Lock,
    Wallet,
} from "lucide-react";
import { useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { toHex } from "viem";
import { toast } from "sonner";

const FindContributorsTab: FC = () => {
    const [bidModal, setBidModal] = useState<{ id: number; address?: string } | null>(null);
    const [filterBand, setFilterBand] = useState("all");
    const [bidScope, setBidScope] = useState("");
    const [bidPrize, setBidPrize] = useState("");
    const [bidDeadline, setBidDeadline] = useState("");

    // Scan a fixed range of token IDs (1-50), filtering out non-existent ones via ownerOf errors
    const tokenCount = 50;
    const tokenIds = Array.from({ length: tokenCount }, (_, i) => BigInt(i + 1));

    const { data: ownerResults, isLoading: ownersLoading } = useReadContracts({
        contracts: tokenIds.map((id) => ({
            ...CONTRACTS.ReputationNFT,
            functionName: "ownerOf" as const,
            args: [id],
        })),
    });

    const { data: bandResults } = useReadContracts({
        contracts: tokenIds.map((id) => ({
            ...CONTRACTS.ReputationNFT,
            functionName: "tokenIdToBand" as const,
            args: [id],
        })),
    });

    const { data: ensResults } = useReadContracts({
        contracts: tokenIds.map((id) => ({
            ...CONTRACTS.ReputationNFT,
            functionName: "tokenIdToEns" as const,
            args: [id],
        })),
    });

    const contributors = useMemo(() => {
        if (!ownerResults) return [];
        return tokenIds
            .map((id, i) => {
                const owner = ownerResults[i]?.result as string | undefined;
                if (!owner || ownerResults[i]?.error) return null;
                const band = bandResults?.[i]?.result !== undefined ? Number(bandResults[i].result as bigint) : 0;
                const ens = (ensResults?.[i]?.result as string) || "";
                return { tokenId: Number(id), owner, band, ens };
            })
            .filter(Boolean) as { tokenId: number; owner: string; band: number; ens: string }[];
    }, [ownerResults, bandResults, ensResults, tokenIds]);

    const filtered = contributors.filter((c) => {
        if (filterBand !== "all" && c.band < Number(filterBand)) return false;
        return true;
    });

    const { writeContract, data: bidTx, isPending: bidSending } = useWriteContract();
    const { isSuccess: bidSent } = useWaitForTransactionReceipt({ hash: bidTx });

    const handleSend = () => {
        if (!bidModal?.address || !bidScope.trim()) return;

        const bidPayload = JSON.stringify({
            scope: bidScope,
            prize: bidPrize,
            deadline: bidDeadline,
            timestamp: new Date().toISOString(),
        });

        writeContract(
            {
                ...CONTRACTS.BountyEscrow,
                functionName: "sendPrivateBid",
                args: [bidModal.address as `0x${string}`, toHex(bidPayload)],
            },
            {
                onSuccess: () => toast.success("Private bid sent on-chain"),
                onError: (err) => toast.error(err.message?.slice(0, 80) || "Failed to send bid"),
            }
        );
    };

    return (
        <div className="w-full max-w-6xl min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
                <div className="flex items-center gap-3">
                    <div
                        className="w-8 h-8 rounded-md flex items-center justify-center"
                        style={{ background: "#e8ff00", color: "#0a0a0a" }}
                    >
                        <Send className="w-4 h-4" />
                    </div>
                    <h2 className="text-xl font-extrabold italic text-white">Find Contributors</h2>
                </div>
            </div>
            <div className="flex items-center gap-3 mb-6 flex-wrap">
                <div className="relative">
                    <select
                        value={filterBand}
                        onChange={(e) => setFilterBand(e.target.value)}
                        className="appearance-none bg-[#3a3915] text-white text-[12px] font-bold uppercase px-4 pr-9 py-3 rounded border outline-none"
                        style={{ borderColor: "#57531e", fontFamily: "inherit" }}
                    >
                        <option value="all">All Bands</option>
                        {[2, 3, 4].map((b) => (
                            <option key={b} value={b}>
                                Band {b}+
                            </option>
                        ))}
                    </select>
                    <ChevronDown
                        className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none"
                        style={{ color: "#d4d4aa" }}
                    />
                </div>
                <button
                    type="button"
                    className="w-10 h-10 rounded border-none flex items-center justify-center cursor-pointer"
                    style={{ background: "#e8ff00", color: "#0a0a0a", fontFamily: "inherit" }}
                >
                    <SlidersHorizontal className="w-4 h-4" />
                </button>
            </div>

            <div
                className="p-3 rounded-lg border mb-6"
                style={{ background: "rgba(232,255,0,0.03)", borderColor: "rgba(232,255,0,0.1)" }}
            >
                <p className="text-[11px]" style={{ color: "#888" }}>
                    Appearing here requires Band 2 or above and opting in via Settings. All profiles are anonymous —
                    no ENS names, no wallet addresses.
                </p>
            </div>

            {ownersLoading ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <p className="text-[13px]" style={{ color: "#888" }}>Loading contributors from ReputationNFT...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <Box className="w-10 h-10 mx-auto mb-4" style={{ color: "#333" }} />
                    <h3 className="text-[16px] font-bold text-white mb-2">No contributors found</h3>
                    <p className="text-[13px]" style={{ color: "#777" }}>
                        No ReputationNFT holders match this filter.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-4">
                    {filtered.map((c) => (
                        <div
                            key={c.tokenId}
                            className="rounded border px-5 py-4 flex items-start justify-between gap-6"
                            style={{ background: "#171707", borderColor: "#2e2b11" }}
                        >
                            <div className="flex items-start gap-4">
                                <div
                                    className="w-14 h-14 rounded flex items-center justify-center"
                                    style={{ background: "linear-gradient(135deg, #7f7a14, #3c3a0f)" }}
                                >
                                    <Box className="w-7 h-7" style={{ color: "#e8ff00" }} />
                                </div>
                                <div>
                                    <h3 className="text-[15px] font-extrabold text-white mb-1">
                                        Contributor #{c.tokenId}
                                    </h3>
                                    <span
                                        className="text-[10px] font-bold px-2 py-0.5 rounded"
                                        style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}
                                    >
                                        Band {c.band}
                                    </span>
                                </div>
                            </div>
                            <button
                                onClick={() => setBidModal({ id: c.tokenId, address: c.owner })}
                                className="mt-2 px-5 py-3 rounded text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer whitespace-nowrap"
                                style={{ background: "#e8ff00", color: "#0a0a0a", fontFamily: "inherit" }}
                            >
                                Send Private Bid
                            </button>
                        </div>
                    ))}
                </div>
            )}

            {bidModal && (
                <div
                    className="fixed inset-0 z-50 flex items-center justify-center p-6"
                    style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }}
                    onClick={() => setBidModal(null)}
                >
                    <div
                        className="w-full max-w-md p-8 rounded-xl border"
                        style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }}
                        onClick={(e) => e.stopPropagation()}
                    >
                        {bidSent ? (
                            <div className="text-center py-4">
                                <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
                                <p className="text-[14px] font-bold text-white mb-1">Bid sent on-chain.</p>
                                <p className="text-[12px]" style={{ color: "#888" }}>
                                    The contributor will see it in their Bid Inbox.
                                </p>
                                <button
                                    onClick={() => setBidModal(null)}
                                    className="mt-4 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent"
                                    style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                                >
                                    Close
                                </button>
                            </div>
                        ) : (
                            <>
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => setBidModal(null)}
                                            className="w-8 h-8 rounded-lg border-none bg-transparent cursor-pointer flex items-center justify-center"
                                            style={{ color: "#fff" }}
                                        >
                                            <ArrowLeft className="w-4 h-4" />
                                        </button>
                                        <h2 className="text-[22px] font-extrabold text-white">Send Private Bid</h2>
                                    </div>
                                    <Info className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                </div>
                                <div className="flex flex-col gap-5">
                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">
                                            Scope of Work
                                        </label>
                                        <textarea
                                            rows={5}
                                            value={bidScope}
                                            onChange={(e) => setBidScope(e.target.value)}
                                            placeholder="Describe the specific tasks..."
                                            className="w-full bg-[#121208] text-white text-[14px] px-4 py-4 rounded border outline-none"
                                            style={{ borderColor: "#4a4816", resize: "vertical", fontFamily: "inherit" }}
                                        />
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">
                                            Prize Amount
                                        </label>
                                        <div
                                            className="flex items-center rounded border overflow-hidden"
                                            style={{ borderColor: "#4a4816", background: "#121208" }}
                                        >
                                            <input
                                                type="number"
                                                placeholder="0.00"
                                                value={bidPrize}
                                                onChange={(e) => setBidPrize(e.target.value)}
                                                className="flex-1 bg-transparent text-white text-[14px] px-4 py-3 outline-none border-none"
                                                style={{ fontFamily: "inherit" }}
                                            />
                                            <div
                                                className="px-4 py-3 flex items-center gap-2 border-l"
                                                style={{ borderColor: "#4a4816", color: "#e8ff00" }}
                                            >
                                                <span className="text-[12px] font-bold uppercase">ETH</span>
                                                <Wallet className="w-4 h-4" />
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block mb-2 text-[12px] font-bold uppercase tracking-wider text-white">
                                            Deadline
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                placeholder="dd-mm-yyyy"
                                                value={bidDeadline}
                                                onChange={(e) => setBidDeadline(e.target.value)}
                                                className="w-full bg-[#121208] text-white text-[14px] px-4 py-3 rounded border outline-none"
                                                style={{ borderColor: "#4a4816", fontFamily: "inherit" }}
                                            />
                                            <CalendarDays
                                                className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2"
                                                style={{ color: "#e8ff00" }}
                                            />
                                        </div>
                                    </div>
                                    <div
                                        className="rounded border p-4"
                                        style={{ background: "rgba(232,255,0,0.04)", borderColor: "#4a4816" }}
                                    >
                                        <div className="flex gap-3">
                                            <Lock className="w-4 h-4 flex-shrink-0 mt-0.5" style={{ color: "#e8ff00" }} />
                                            <p className="text-[12px] leading-relaxed" style={{ color: "#e8ff00" }}>
                                                This bid will be stored on-chain via the BountyEscrow contract. The
                                                contributor will see it in their Bid Inbox.
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={handleSend}
                                        disabled={bidSending || !bidScope.trim()}
                                        className="w-full py-4 rounded-lg text-[14px] font-bold border-none cursor-pointer flex items-center justify-center gap-2"
                                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                                    >
                                        {bidSending ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Sending...
                                            </>
                                        ) : (
                                            "Send Bid On-Chain"
                                        )}
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
