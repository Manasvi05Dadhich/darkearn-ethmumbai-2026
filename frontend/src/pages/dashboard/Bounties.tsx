import { useState, useMemo, type FC, type MouseEvent } from "react";
import { Search, ShieldCheck, Clock, Users, Loader2 } from "lucide-react";
import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { formatEther } from "viem";

const CATEGORIES = ["All", "Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];
const CATEGORY_NAMES: Record<number, string> = { 0: "Solidity", 1: "Cairo", 2: "Frontend", 3: "Security", 4: "Content", 5: "Design" };
const CATEGORY_COLORS: Record<string, string> = { Solidity: "#627eea", Cairo: "#06b6d4", Frontend: "#22c55e", Security: "#f97316", Content: "#a78bfa", Design: "#f472b6" };

interface Bounty {
    id: number;
    title: string;
    desc: string;
    prize: string;
    category: string;
    catColor: string;
    poster: string;
    deadline: string;
    applicants: number;
}

const BountiesTab: FC = () => {
    const [search, setSearch] = useState("");
    const [cat, setCat] = useState("All");

    // Read bounty count
    const { data: nextId, isLoading: countLoading } = useReadContract({ ...CONTRACTS.BountyEscrow, functionName: "nextBountyId" });
    const bountyCount = nextId ? Number(nextId as bigint) - 1 : 0;
    const bountyIds = Array.from({ length: bountyCount }, (_, i) => i + 1);

    // Batch read core + meta
    const { data: coreResults, isLoading: coreLoading } = useReadContracts({
        contracts: bountyIds.map((id) => ({ ...CONTRACTS.BountyEscrow, functionName: "getBountyCore" as const, args: [BigInt(id)] })),
    });
    const { data: metaResults } = useReadContracts({
        contracts: bountyIds.map((id) => ({ ...CONTRACTS.BountyEscrow, functionName: "getBountyMeta" as const, args: [BigInt(id)] })),
    });

    const bounties: Bounty[] = useMemo(() => {
        if (!coreResults) return [];
        return bountyIds.map((id, i) => {
            const core = coreResults[i]?.result as [bigint, string, string, string, bigint, bigint, bigint, number] | undefined;
            const meta = metaResults?.[i]?.result as [string, boolean, boolean, bigint, bigint, string] | undefined;
            if (!core) return null;
            const [, posterAddr, , title, categoryId, deadline, prizeAmount] = core;
            const catName = CATEGORY_NAMES[Number(categoryId)] || "Other";
            const daysLeft = Math.max(0, Math.floor((Number(deadline) * 1000 - Date.now()) / 86400000));
            return {
                id,
                title: title || `Bounty #${id}`,
                desc: meta?.[5] || "",
                prize: Number(formatEther(prizeAmount)).toFixed(4),
                category: catName,
                catColor: CATEGORY_COLORS[catName] || "#888",
                poster: `${posterAddr.slice(0, 6)}...${posterAddr.slice(-4)}`,
                deadline: `${daysLeft}d left`,
                applicants: meta ? Number(meta[3]) : 0,
            } as Bounty;
        }).filter(Boolean) as Bounty[];
    }, [coreResults, metaResults, bountyIds]);

    const filtered = bounties.filter(b => {
        if (cat !== "All" && b.category !== cat) return false;
        if (search && !b.title.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const isLoading = countLoading || coreLoading;

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

            {isLoading ? (
                <div className="text-center py-16">
                    <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <p className="text-[13px]" style={{ color: "#888" }}>Loading bounties from contract...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="text-center py-16">
                    <p className="text-[16px] font-bold text-white mb-2">No bounties found</p>
                    <p className="text-[13px]" style={{ color: "#777" }}>No bounties have been posted on-chain yet.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filtered.map(b => (
                        <div key={b.id} className="p-5 rounded-xl border transition-all cursor-pointer" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                            onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "rgba(232,255,0,0.15)"; }}
                            onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}>
                            <div className="flex justify-between mb-3">
                                <span className="text-[12px]" style={{ color: "#777" }}>{b.poster}</span>
                                <span className="font-bold text-[15px]" style={{ color: "#e8ff00" }}>{b.prize} <span className="text-[11px]" style={{ color: "#888" }}>ETH</span></span>
                            </div>
                            <h3 className="text-[14px] font-bold text-white mb-2">{b.title}</h3>
                            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full" style={{ background: `${b.catColor}15`, color: b.catColor }}>{b.category}</span>
                            {b.desc && <p className="text-[12px] mt-2 mb-4" style={{ color: "#777", display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden" }}>{b.desc}</p>}
                            <div className="flex items-center gap-4 mt-3">
                                <div className="flex items-center gap-1"><Clock className="w-3 h-3" style={{ color: "#555" }} /><span className="text-[11px]" style={{ color: "#555" }}>{b.deadline}</span></div>
                                <div className="flex items-center gap-1"><Users className="w-3 h-3" style={{ color: "#555" }} /><span className="text-[11px]" style={{ color: "#555" }}>{b.applicants} applied</span></div>
                                <div className="flex items-center gap-1 ml-auto"><ShieldCheck className="w-3 h-3" style={{ color: "#22c55e" }} /><span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>On-Chain</span></div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default BountiesTab;
