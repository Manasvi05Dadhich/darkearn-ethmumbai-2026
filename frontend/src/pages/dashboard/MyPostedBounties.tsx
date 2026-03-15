import { useState, useMemo, type FC } from "react";
import { ChevronDown, Eye, CheckCircle2, Loader2 } from "lucide-react";
import { useAccount, useReadContract, useReadContracts, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";
import { formatEther } from "viem";
import FileverseBriefViewer from "../../components/FileverseBriefViewer";

interface Applicant { id: number; message: string; revealed: boolean; ensName: string; accepted: boolean; }
interface PostedBounty { id: number; title: string; prize: string; status: string; applicants: Applicant[]; deadline: string; }

const STATUS_LABELS: Record<number, string> = { 0: "Open", 1: "In Progress", 2: "Completed", 3: "Cancelled", 4: "Disputed" };

const MyPostedBountiesTab: FC = () => {
    const { address } = useAccount();
    const [expanded, setExpanded] = useState<number | null>(null);
    const [viewingBriefCid, setViewingBriefCid] = useState<string | null>(null);

    // Read bounty count
    const { data: nextId } = useReadContract({ ...CONTRACTS.BountyEscrow, functionName: "nextBountyId" });
    const bountyCount = nextId ? Number(nextId as bigint) - 1 : 0;
    const bountyIds = Array.from({ length: bountyCount }, (_, i) => i + 1);

    // Batch read core data
    const { data: coreResults, isLoading } = useReadContracts({
        contracts: bountyIds.map((id) => ({
            ...CONTRACTS.BountyEscrow, functionName: "getBountyCore" as const, args: [BigInt(id)],
        })),
    });

    // Batch read meta data
    const { data: metaResults } = useReadContracts({
        contracts: bountyIds.map((id) => ({
            ...CONTRACTS.BountyEscrow, functionName: "getBountyMeta" as const, args: [BigInt(id)],
        })),
    });

    // Filter to only bounties posted by this user
    const myBounties: PostedBounty[] = useMemo(() => {
        if (!coreResults || !address) return [];
        return bountyIds.map((id, i) => {
            const core = coreResults[i]?.result as [bigint, string, string, string, bigint, bigint, bigint, number] | undefined;
            const meta = metaResults?.[i]?.result as [string, boolean, boolean, bigint, bigint, string] | undefined;
            if (!core) return null;
            const [, posterAddress, , title, , deadline, prizeAmount, status] = core;
            // Only include bounties posted by connected address
            if (posterAddress.toLowerCase() !== address.toLowerCase()) return null;
            const applicantCount = meta ? Number(meta[3]) : 0;
            return {
                id,
                title: title || `Bounty #${id}`,
                prize: `${Number(formatEther(prizeAmount)).toFixed(4)} ETH`,
                status: STATUS_LABELS[status] || "Open",
                deadline: new Date(Number(deadline) * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }),
                applicants: Array.from({ length: applicantCount }, (_, j) => ({
                    id: j, message: "", revealed: false, ensName: "", accepted: false,
                })),
            } as PostedBounty;
        }).filter(Boolean) as PostedBounty[];
    }, [coreResults, metaResults, address, bountyIds]);

    // Reveal applicant on-chain
    const { writeContract: revealWrite, data: revealTx, isPending: revealing } = useWriteContract();
    const { isSuccess: _revealConfirmed } = useWaitForTransactionReceipt({ hash: revealTx });

    // Accept applicant on-chain
    const { writeContract: _acceptWrite, data: acceptTx, isPending: _accepting } = useWriteContract();
    const { isSuccess: _acceptConfirmed } = useWaitForTransactionReceipt({ hash: acceptTx });

    const handleReveal = (bountyId: number, appId: number) => {
        revealWrite({
            ...CONTRACTS.BountyEscrow,
            functionName: "revealApplicant",
            args: [BigInt(bountyId), BigInt(appId)],
        });
    };

    if (!address) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <p className="text-[14px]" style={{ color: "#888" }}>Connect your wallet to see your posted bounties.</p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading your bounties...</p>
            </div>
        );
    }

    if (myBounties.length === 0) {
        return (
            <div className="w-full max-w-4xl mx-auto text-center py-16 min-w-0">
                <p className="text-[16px] font-bold text-white mb-2">No bounties posted yet</p>
                <p className="text-[13px]" style={{ color: "#888" }}>Go to "Post Bounty" to create your first bounty.</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-5xl min-w-0">
            <div className="rounded-xl border overflow-hidden" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                {myBounties.map(bounty => {
                    const isExpanded = expanded === bounty.id;
                    return (
                        <div key={bounty.id} style={{ borderBottom: "1px solid #111" }}>
                            <button onClick={() => setExpanded(isExpanded ? null : bounty.id)}
                                className="w-full flex flex-wrap items-center gap-3 sm:gap-4 px-4 sm:px-6 py-4 bg-transparent border-none cursor-pointer text-left transition-colors hover:bg-[#0d0d0d]"
                                style={{ fontFamily: "inherit" }}>
                                <span className="flex-1 text-[14px] font-semibold text-white">{bounty.title}</span>
                                <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>{bounty.prize}</span>
                                <span className="text-[11px] font-bold uppercase px-2 py-1 rounded" style={{ background: bounty.status === "Open" ? "rgba(34,197,94,0.1)" : "rgba(59,130,246,0.1)", color: bounty.status === "Open" ? "#22c55e" : "#60a5fa" }}>{bounty.status}</span>
                                <span className="text-[11px]" style={{ color: "#555" }}>{bounty.applicants.length} applicants</span>
                                <span className="text-[11px] hidden md:block" style={{ color: "#555" }}>{bounty.deadline}</span>
                                <ChevronDown className="w-4 h-4" style={{ color: "#555", transform: isExpanded ? "rotate(180deg)" : "none", transition: "0.2s" }} />
                            </button>
                            {isExpanded && (
                                <div className="px-6 pb-5 flex flex-col gap-4" style={{ borderTop: "1px solid #111" }}>
                                    {bounty.applicants.length === 0 ? (
                                        <p className="text-[13px] py-4 text-center" style={{ color: "#555" }}>No applicants yet</p>
                                    ) : bounty.applicants.map(app => (
                                        <div key={app.id} className="p-4 rounded-lg border" style={{ background: "#060606", borderColor: "#1a1a1a" }}>
                                            <div className="flex items-center gap-3 mb-3">
                                                <span className="text-[14px] font-bold text-white">{app.revealed ? app.ensName : `Applicant #${app.id}`}</span>
                                            </div>
                                            <div className="flex gap-3">
                                                {!app.revealed && (
                                                    <button onClick={() => handleReveal(bounty.id, app.id)} disabled={revealing}
                                                        className="px-4 py-2 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center gap-2"
                                                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                                        {revealing ? <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Revealing...</> : <><Eye className="w-3.5 h-3.5" /> Reveal Identity</>}
                                                    </button>
                                                )}
                                                {app.accepted && (
                                                    <span className="text-[12px] font-bold flex items-center gap-1" style={{ color: "#22c55e" }}><CheckCircle2 className="w-4 h-4" /> Accepted</span>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>

            {/* Fileverse Brief Viewer Modal */}
            {viewingBriefCid && (
                <FileverseBriefViewer cid={viewingBriefCid} onClose={() => setViewingBriefCid(null)} />
            )}
        </div>
    );
};

export default MyPostedBountiesTab;
