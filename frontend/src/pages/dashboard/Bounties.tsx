import type { FC } from "react";
import { Search, ShieldCheck, Clock, Users } from "lucide-react";
import { useState, type MouseEvent } from "react";

const BOUNTIES = [
    { id: 1, title: "Build a ZK identity verification module for ENS", desc: "Solidity-based module integrating with ENS for zero-knowledge identity verification.", prize: "$2,400", currency: "USDC", category: "Solidity", catColor: "#627eea", poster: "vitalik.eth", deadline: "12d left", applicants: 7 },
    { id: 2, title: "Design privacy-first dashboard UI for DeFi protocol", desc: "Stunning modern dashboard prioritizing user privacy. Dark theme, data viz, responsive.", prize: "$1,800", currency: "USDC", category: "Design", catColor: "#f472b6", poster: "anon42.eth", deadline: "5d left", applicants: 14 },
    { id: 3, title: "Audit Solidity escrow contract — critical scope", desc: "Security audit of escrow contract handling up to $1M in value. OWASP guidelines.", prize: "$5,000", currency: "USDC", category: "Security", catColor: "#f97316", poster: "shadowed.eth", deadline: "3d left", applicants: 3 },
    { id: 4, title: "Write technical docs for cross-chain bridge SDK", desc: "Comprehensive developer docs including quickstart, API reference, and code examples.", prize: "$900", currency: "USDC", category: "Content", catColor: "#a78bfa", poster: "0xwriter.eth", deadline: "20d left", applicants: 9 },
    { id: 5, title: "Develop Cairo smart contract for StarkNet DEX", desc: "AMM-style DEX contract in Cairo for StarkNet. Multi-token swaps, liquidity pools.", prize: "$3,200", currency: "USDC", category: "Cairo", catColor: "#06b6d4", poster: "stark.eth", deadline: "8d left", applicants: 5 },
    { id: 6, title: "Frontend integration for on-chain reputation NFT", desc: "Build React components for minting, displaying, and verifying on-chain reputation NFTs.", prize: "$1,200", currency: "USDC", category: "Frontend", catColor: "#22c55e", poster: "builder.eth", deadline: "15d left", applicants: 11 },
];

const CATEGORIES = ["All", "Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];

const BountiesTab: FC = () => {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("All");

    const filtered = BOUNTIES.filter(b => {
        if (cat !== "All" && b.category !== cat) return false;
        if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    return (
        <div className="max-w-5xl">
            <div className="flex items-center gap-4 mb-6 flex-wrap">
                <div className="relative flex-1 min-w-[200px] max-w-sm">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#555" }} />
                    <input type="text" placeholder="Search bounties..." value={search} onChange={e => setSearch(e.target.value)}
                        className="w-full bg-[#0a0a0a] text-white text-[13px] pl-10 pr-4 py-2.5 rounded-lg outline-none border" style={{ borderColor: "#1a1a1a" }} />
                </div>
                <div className="flex gap-2 flex-wrap">
                    {CATEGORIES.map(c => (
                        <button key={c} onClick={() => setCat(c)}
                            className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider rounded-lg border-none cursor-pointer"
                            style={{ background: cat === c ? "rgba(232,255,0,0.1)" : "#0f0f0f", color: cat === c ? "#e8ff00" : "#666", fontFamily: "inherit", border: cat === c ? "1px solid rgba(232,255,0,0.2)" : "1px solid #1a1a1a" }}>{c}</button>
                    ))}
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filtered.map(b => (
                    <div key={b.id} className="p-5 rounded-xl border transition-all cursor-pointer" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                        onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "rgba(232,255,0,0.15)"; }}
                        onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}>
                        <div className="flex justify-between mb-3">
                            <span className="text-[12px]" style={{ color: "#777" }}>{b.poster}</span>
                            <span className="font-bold text-[15px]" style={{ color: "#e8ff00" }}>{b.prize} <span className="text-[11px]" style={{ color: "#888" }}>{b.currency}</span></span>
                        </div>
                        <h3 className="text-[14px] font-bold text-white mb-2">{b.title}</h3>
                        <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${b.catColor}15`, color: b.catColor }}>{b.category}</span>
                        <p className="text-[12px] mt-2 mb-4" style={{ color: "#777", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.desc}</p>
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1"><Clock className="w-3 h-3" style={{ color: "#555" }} /><span className="text-[11px]" style={{ color: "#555" }}>{b.deadline}</span></div>
                            <div className="flex items-center gap-1"><Users className="w-3 h-3" style={{ color: "#555" }} /><span className="text-[11px]" style={{ color: "#555" }}>{b.applicants} applied</span></div>
                            <div className="flex items-center gap-1 ml-auto"><ShieldCheck className="w-3 h-3" style={{ color: "#22c55e" }} /><span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>Verified</span></div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default BountiesTab;
