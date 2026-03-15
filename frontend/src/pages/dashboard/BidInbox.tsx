import { useState, type FC, type MouseEvent } from "react";
import { Inbox, Lock, Loader2, Mail, ExternalLink } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import { useBids } from "../../hooks/useBids";

const BidInboxTab: FC = () => {
    const { address } = useAccount();
    const [decrypted, setDecrypted] = useState(false);
    const [subTab, setSubTab] = useState<"all" | "private" | "archived">("private");
    const { bids, isLoading } = useBids();

    const { signMessage, isPending: signing } = useSignMessage({
        mutation: {
            onSuccess: () => setDecrypted(true),
        },
    });

    const handleDecrypt = () => {
        signMessage({ message: "DarkEarn: Unlock encrypted bid inbox" });
    };

    if (!address) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <p className="text-[14px]" style={{ color: "#888" }}>
                    Connect your wallet to view your bid inbox.
                </p>
            </div>
        );
    }

    if (!decrypted) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 rounded-full opacity-30 blur-xl" style={{ background: "#e8ff00" }} />
                    <Lock
                        className="relative w-20 h-20 mx-auto"
                        style={{ color: "#e8ff00", filter: "drop-shadow(0 0 20px rgba(232,255,0,0.5))" }}
                    />
                </div>
                <h3 className="text-[18px] font-bold text-white mb-3">Sign to Decrypt Your Bids</h3>
                <p className="text-[13px] mb-2 max-w-md mx-auto" style={{ color: "#888" }}>
                    Your private offers are encrypted with your public key. Sign a message to prove ownership.
                </p>
                <p className="text-[11px] mb-6 max-w-md mx-auto" style={{ color: "#555" }}>
                    DarkEarn uses your wallet signature to decrypt messages locally in your browser. Nothing is sent to
                    any server.
                </p>
                <button
                    onClick={handleDecrypt}
                    disabled={signing}
                    className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                        if (!signing) e.currentTarget.style.transform = "translateY(-1px)";
                    }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.transform = "translateY(0)";
                    }}
                >
                    {signing ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                            Signing...
                        </>
                    ) : (
                        "Unlock Inbox & Sign Signature"
                    )}
                </button>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading bids from chain...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-4xl min-w-0">
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-[15px] font-bold text-white">Bid Inbox</h2>
                    <span
                        className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                        style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}
                    >
                        Decrypted
                    </span>
                </div>
                <div className="flex gap-6 border-b" style={{ borderColor: "#222" }}>
                    {(["all", "private", "archived"] as const).map((t) => (
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
                            {t === "all" ? `All Bids (${bids.length})` : t === "private" ? "Private Offers" : "Archived"}
                        </button>
                    ))}
                </div>
            </div>

            {bids.length === 0 ? (
                <div className="text-center py-16">
                    <Inbox className="w-10 h-10 mx-auto mb-4" style={{ color: "#333" }} />
                    <h3 className="text-[16px] font-bold text-white mb-2">No private bids yet.</h3>
                    <p className="text-[13px]" style={{ color: "#777" }}>
                        As your reputation grows, posters will send you direct private offers here.
                    </p>
                    <p className="text-[12px] mt-2" style={{ color: "#555" }}>
                        Appearing in Find Contributors requires Band 2 and opting in via Settings.
                    </p>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {bids.map((bid, _i) => (
                        <div
                            key={bid.txHash}
                            className="rounded-lg border p-4"
                            style={{
                                background: "#0a0a0a",
                                borderColor: "#1a1a1a",
                                borderLeft: "3px solid #e8ff00",
                            }}
                        >
                            <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 sm:gap-4">
                                <div className="flex items-start gap-3 min-w-0 flex-1">
                                    <div
                                        className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0"
                                        style={{ background: "rgba(232,255,0,0.1)" }}
                                    >
                                        <Mail className="w-5 h-5" style={{ color: "#e8ff00" }} />
                                    </div>
                                    <div>
                                        <p className="text-[13px] font-semibold text-white">
                                            Private bid from {bid.poster.slice(0, 6)}...{bid.poster.slice(-4)}
                                        </p>
                                        <p className="text-[11px] mt-1" style={{ color: "#555" }}>
                                            Encrypted bid data: {bid.encryptedBid.slice(0, 20)}...
                                        </p>
                                    </div>
                                </div>
                                <a
                                    href={`https://sepolia.basescan.org/tx/${bid.txHash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-[11px] flex items-center gap-1 shrink-0"
                                    style={{ color: "#60a5fa" }}
                                >
                                    <ExternalLink className="w-3 h-3" /> View
                                </a>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BidInboxTab;
