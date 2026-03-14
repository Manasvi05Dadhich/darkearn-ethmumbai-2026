import { useState, type FC, type MouseEvent } from "react";
import { ChevronDown, ChevronUp, Loader2, CheckCircle2, Lock, Copy, Download, ExternalLink, FileText, Settings, Code, Shield } from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { CONTRACTS } from "../../contracts";

type AppStatus = "under-review" | "accepted" | "pending" | "rejected";

interface Application {
    id: number;
    bountyId: number;
    title: string;
    posterEns: string;
    prize: string;
    appStatus: AppStatus;
}

const STATUS_STYLES: Record<AppStatus, { bg: string; color: string }> = {
    "under-review": { bg: "rgba(59, 130, 246, 0.5)", color: "#fff" },
    "accepted": { bg: "#22c55e", color: "#fff" },
    "pending": { bg: "rgba(88, 80, 236, 0.7)", color: "#fff" },
    "rejected": { bg: "#ef4444", color: "#fff" },
};

/* ── Submit Work (real contract call) ── */
const SubmitWorkModal: FC<{ bountyId: number; onClose: () => void }> = ({ bountyId, onClose }) => {
    const [fileId, setFileId] = useState("");
    const { writeContract, data: txHash, isPending, error: submitError } = useWriteContract();
    const { isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const handleSubmit = () => {
        writeContract({
            ...CONTRACTS.BountyEscrow,
            functionName: "submitWork",
            args: [BigInt(bountyId), fileId || "submission"],
        });
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-6" style={{ background: "rgba(0,0,0,0.8)", backdropFilter: "blur(4px)" }} onClick={onClose}>
            <div className="w-full max-w-md p-8 rounded-xl border" style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }} onClick={e => e.stopPropagation()}>
                <h2 className="text-lg font-bold text-white mb-1">Submit Your Work</h2>
                <p className="text-[12px] mb-6" style={{ color: "#888" }}>Enter your submission reference (e.g. IPFS hash, Fileverse ID, or any identifier).</p>
                {confirmed ? (
                    <div className="text-center py-4">
                        <CheckCircle2 className="w-10 h-10 mx-auto mb-3" style={{ color: "#22c55e" }} />
                        <p className="text-[14px] font-bold text-white mb-1">Work submitted on-chain.</p>
                        <p className="text-[12px]" style={{ color: "#888" }}>Poster has been notified.</p>
                        <button onClick={onClose} className="mt-4 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent" style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>Close</button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        <input type="text" value={fileId} onChange={e => setFileId(e.target.value)} placeholder="Submission reference..."
                            className="w-full px-4 py-3 rounded-lg text-[14px] outline-none border" style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }} />
                        {submitError && <p className="text-[12px]" style={{ color: "#ef4444" }}>{submitError.message?.slice(0, 100)}</p>}
                        <button onClick={handleSubmit} disabled={isPending}
                            className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer" style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                            {isPending ? <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Confirming...</> : "Submit On-Chain"}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

/* ── Applications Tab (empty state — no mock data) ── */
const ApplicationsTab: FC = () => {
    const { address } = useAccount();
    const [modal, setModal] = useState<{ type: "submit"; bountyId: number } | null>(null);

    // TODO: Read applications from contract once getApplicant/getMyApplications is available
    const applications: Application[] = [];

    if (!address) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <p className="text-[14px]" style={{ color: "#888" }}>Connect your wallet to see your applications.</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <FileText className="w-10 h-10 mx-auto mb-4" style={{ color: "#333" }} />
                <h3 className="text-[16px] font-bold text-white mb-2">No applications yet</h3>
                <p className="text-[13px]" style={{ color: "#777" }}>Browse bounties and apply to start working. Your applications will appear here.</p>

                {modal?.type === "submit" && <SubmitWorkModal bountyId={modal.bountyId} onClose={() => setModal(null)} />}
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-1">
                {applications.map((app) => {
                    const appStyle = STATUS_STYLES[app.appStatus];
                    return (
                        <div key={app.id} className="rounded-lg overflow-hidden" style={{ background: "#0a0a0a" }}>
                            <div className="w-full flex items-start gap-4 px-4 py-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold text-white">{app.title}</p>
                                    <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>{app.posterEns} • {app.prize}</p>
                                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded mt-2 inline-block" style={appStyle}>
                                        {app.appStatus === "under-review" ? "UNDER REVIEW" : app.appStatus.toUpperCase()}
                                    </span>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
            {modal?.type === "submit" && <SubmitWorkModal bountyId={modal.bountyId} onClose={() => setModal(null)} />}
        </div>
    );
};

export default ApplicationsTab;
