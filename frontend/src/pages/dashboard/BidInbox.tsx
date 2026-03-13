import { useState, type FC, type MouseEvent } from "react";
import { Inbox, Lock, Loader2 } from "lucide-react";

interface Bid {
    id: number; timestamp: string; scope: string; prize: string; deadline: string; unread: boolean; decrypted: boolean;
}

const BIDS: Bid[] = [
    { id: 1, timestamp: "2 hours ago", scope: "Build a privacy-preserving analytics dashboard for our DeFi protocol. Must handle real-time data streams.", prize: "$3,000 USDC", deadline: "Apr 5, 2026", unread: true, decrypted: true },
    { id: 2, timestamp: "3 days ago", scope: "Audit our cross-chain bridge contract before mainnet launch. Critical security scope.", prize: "$4,500 USDC", deadline: "Mar 30, 2026", unread: true, decrypted: true },
];

const BidInboxTab: FC = () => {
    const [bids, setBids] = useState(BIDS);
    const [decrypted, setDecrypted] = useState(true);
    const [signing, setSigning] = useState(false);

    const handleDecrypt = () => { setSigning(true); setTimeout(() => { setSigning(false); setDecrypted(true); }, 1500); };

    if (!decrypted) {
        return (
            <div className="max-w-2xl mx-auto text-center py-20">
                <Lock className="w-10 h-10 mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <h3 className="text-[16px] font-bold text-white mb-2">Sign with your wallet to decrypt your private messages.</h3>
                <button onClick={handleDecrypt} disabled={signing}
                    className="mt-4 px-6 py-3 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                    {signing ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Signing...</> : "Decrypt Messages"}
                </button>
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
        <div className="max-w-4xl flex flex-col gap-4">
            {bids.map(bid => (
                <div key={bid.id} className="rounded-xl border p-6 transition-colors" style={{ background: "#0a0a0a", borderColor: "#1a1a1a", borderLeft: bid.unread ? "3px solid #6366f1" : "3px solid transparent" }}>
                    <div className="flex items-center justify-between mb-3">
                        <p className="text-[13px] font-semibold text-white">A poster sent you a private offer</p>
                        <span className="text-[11px]" style={{ color: "#555" }}>{bid.timestamp}</span>
                    </div>
                    <p className="text-[13px] mb-4" style={{ color: "#888" }}>{bid.scope}</p>
                    <div className="flex items-center gap-4 mb-4">
                        <span className="text-[14px] font-bold" style={{ color: "#e8ff00" }}>{bid.prize}</span>
                        <span className="text-[12px]" style={{ color: "#777" }}>Deadline: {bid.deadline}</span>
                    </div>
                    <div className="flex gap-3">
                        <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border cursor-pointer bg-transparent transition-colors"
                            style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#ccc"; }}>
                            View Full Details
                        </button>
                        <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{ background: "#22c55e", color: "#fff", fontFamily: "inherit" }}>Accept</button>
                        <button className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{ background: "#222", color: "#888", fontFamily: "inherit" }}
                            onClick={() => setBids(bids.filter(b => b.id !== bid.id))}>Decline</button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default BidInboxTab;
