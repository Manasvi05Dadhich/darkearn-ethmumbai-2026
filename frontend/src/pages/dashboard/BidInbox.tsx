import { useState, type FC, type MouseEvent } from "react";
import { Inbox, Lock, Loader2, Mail } from "lucide-react";

interface Bid {
    id: number;
    timestamp: string;
    title: string;
    scope: string;
    prize: string;
    deadline?: string;
    complexity?: number;
    detailed?: boolean;
    unread: boolean;
}

const BIDS: Bid[] = [
    {
        id: 1,
        timestamp: "2 hours ago",
        title: "Smart Contract Security Audit - Project Phoenix",
        scope: "Detailed review of the liquidity provision logic and emergency withdrawal patterns in the Phoenix protocol core contracts. Requires experience with cross-chain message passing.",
        prize: "$1,200 USDC",
        deadline: "Oct 24, 2023",
        complexity: 2,
        detailed: true,
        unread: true,
    },
    {
        id: 2,
        timestamp: "5 hours ago",
        title: "Frontend Optimization: Neo-Tokyo Marketplace",
        scope: "Refactor high-latency components in the marketplace dashboard and implement skeleton loaders for improved perceived performance.",
        prize: "$850 USDC",
        detailed: false,
        unread: true,
    },
    {
        id: 3,
        timestamp: "Yesterday",
        title: "Discord Bot Integration for DAO Governance",
        scope: "Create a slash command bridge for real-time Snapshot monitoring and alert routing to Discord channels.",
        prize: "$400 USDC",
        detailed: false,
        unread: true,
    },
];

type SubTab = "all" | "private" | "archived";

interface BidInboxTabProps {
    decrypted?: boolean;
    onDecrypted?: () => void;
}

const BidInboxTab: FC<BidInboxTabProps> = ({ decrypted: propDecrypted, onDecrypted }) => {
    const [bids, setBids] = useState(BIDS);
    const [internalDecrypted, setInternalDecrypted] = useState(false);
    const decrypted = propDecrypted ?? internalDecrypted;
    const [signing, setSigning] = useState(false);
    const [subTab, setSubTab] = useState<SubTab>("private");

    const handleDecrypt = () => { setSigning(true); setTimeout(() => { setSigning(false); setInternalDecrypted(true); onDecrypted?.(); }, 1500); };

    if (!decrypted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <div className="relative inline-block mb-6">
                    <div className="absolute inset-0 rounded-full opacity-30 blur-xl" style={{ background: "#e8ff00" }} />
                    <Lock className="relative w-20 h-20 mx-auto" style={{ color: "#e8ff00", filter: "drop-shadow(0 0 20px rgba(232,255,0,0.5))" }} />
                </div>
                <h3 className="text-[18px] font-bold text-white mb-3">Sign to Decrypt Your Bids</h3>
                <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "#888" }}>
                    Your private offers are encrypted with your public key. Only you can read them with a valid signature.
                </p>
                <button onClick={handleDecrypt} disabled={signing}
                    className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!signing) e.currentTarget.style.transform = "translateY(-1px)"; }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.transform = "translateY(0)"; }}>
                    {signing ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Signing...</> : "Unlock Inbox & Sign Signature"}
                </button>
                <p className="text-[10px] font-medium uppercase tracking-[0.2em] mt-10" style={{ color: "#555" }}>Secure Edge Protocol V4.2</p>
            </div>
        );
    }

    if (bids.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <Inbox className="w-10 h-10 mx-auto mb-4" style={{ color: "#333" }} />
                <h3 className="text-[16px] font-bold text-white mb-2">No private bids yet.</h3>
                <p className="text-[13px]" style={{ color: "#777" }}>As your reputation grows, posters will send you direct private offers here.</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            {/* Header with tabs */}
            <div className="mb-6">
                <div className="flex items-center gap-2 mb-4">
                    <h2 className="text-[15px] font-bold text-white">Bid Inbox</h2>
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded" style={{ background: "rgba(34,197,94,0.2)", color: "#22c55e" }}>Decrypted</span>
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
                            {t === "all" ? "All Bids" : t === "private" ? "Private Offers" : "Archived"}
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Private Offers + badge */}
            <div className="flex items-center justify-between mb-6">
                <h3 className="text-[13px] font-semibold text-white">Recent Private Offers</h3>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded" style={{ background: "#e8ff00", color: "#0a0a0a" }}>3 New Encrypted Signals</span>
            </div>

            {/* Offer cards */}
            <div className="flex flex-col gap-4">
                {bids.map((bid) => (
                    <div key={bid.id} className="rounded-xl border p-6 transition-colors" style={{ background: "#0a0a0a", borderColor: "#1a1a1a", borderLeft: bid.unread ? "3px solid #6366f1" : "3px solid transparent" }}>
                        <div className="flex items-center gap-2 mb-2">
                            <Mail className="w-4 h-4" style={{ color: "#888" }} />
                            <p className="text-[12px]" style={{ color: "#888" }}>A poster sent you a private offer {bid.timestamp}</p>
                        </div>
                        <h4 className="text-[14px] font-bold mb-2" style={{ color: "#e8ff00" }}>{bid.title}{!bid.detailed ? ` ${bid.prize}` : ""}</h4>
                        <p className="text-[13px] mb-4" style={{ color: "#888" }}>{bid.scope}</p>
                        {bid.detailed && (
                            <div className="flex flex-wrap gap-4 mb-4">
                                <div>
                                    <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: "#666" }}>Prize Amount</p>
                                    <p className="text-[14px] font-bold" style={{ color: "#e8ff00" }}>{bid.prize}</p>
                                </div>
                                {bid.deadline && (
                                    <div>
                                        <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: "#666" }}>Deadline</p>
                                        <p className="text-[14px] font-bold" style={{ color: "#e8ff00" }}>{bid.deadline}</p>
                                    </div>
                                )}
                                {bid.complexity !== undefined && (
                                    <div>
                                        <p className="text-[10px] font-bold tracking-wider uppercase mb-1" style={{ color: "#666" }}>Complexity</p>
                                        <div className="flex gap-0.5">
                                            {[1, 2, 3, 4, 5].map((i) => (
                                                <div key={i} className="w-1.5 h-4 rounded-sm" style={{ background: i <= (bid.complexity ?? 0) ? "#e8ff00" : "#333" }} />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                        <div className="flex gap-3">
                            <button className="px-4 py-2 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent transition-colors"
                                style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#ccc"; }}>
                                {bid.detailed ? "View Full Details" : "View Details"}
                            </button>
                            <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                {bid.detailed ? "Accept Offer" : "Accept"}
                            </button>
                            <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                style={{ background: "#222", color: "#888", fontFamily: "inherit" }}
                                onClick={() => setBids(bids.filter((b) => b.id !== bid.id))}>
                                Decline
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BidInboxTab;
