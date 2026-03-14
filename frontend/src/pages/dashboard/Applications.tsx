import { useState, type FC } from "react";
import {
    Loader2,
    CheckCircle2,
    Lock,
    FileText,
    Shield,
    ExternalLink,
    Wallet,
    Scan,
} from "lucide-react";
import { useAccount, useWriteContract, useWaitForTransactionReceipt, useSignMessage } from "wagmi";
import { CONTRACTS } from "../../contracts";
import {
    encryptForWallet,
    deriveKeyFromSignature,
    storeEncryptedDocument,
    SIGN_MESSAGE,
    type DocumentContent,
} from "../../lib/fileverse";
import { useMyApplications, type MyApplication } from "../../hooks/useMyApplications";
import { useStealthKeys } from "../../hooks/useStealthKeys";
import { generateStealthAddress } from "../../lib/stealth";
import { toast } from "sonner";

const STATUS_STYLES: Record<string, { bg: string; color: string; label: string }> = {
    pending: { bg: "rgba(88, 80, 236, 0.7)", color: "#fff", label: "ANONYMOUS" },
    accepted: { bg: "#22c55e", color: "#fff", label: "ACCEPTED" },
    "work-submitted": { bg: "rgba(59, 130, 246, 0.7)", color: "#fff", label: "WORK SUBMITTED" },
    completed: { bg: "#10b981", color: "#fff", label: "COMPLETED" },
    "payment-claimed": { bg: "#a78bfa", color: "#fff", label: "PAYMENT CLAIMED" },
    disputed: { bg: "#f97316", color: "#fff", label: "DISPUTED" },
    cancelled: { bg: "#ef4444", color: "#fff", label: "CANCELLED" },
};

const SubmitWorkModal: FC<{ bountyId: number; onClose: () => void }> = ({ bountyId, onClose }) => {
    const { address } = useAccount();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [links, setLinks] = useState<string[]>([""]);
    const [encryptedCid, setEncryptedCid] = useState("");
    const [encrypting, setEncrypting] = useState(false);

    const addLink = () => setLinks([...links, ""]);
    const updateLink = (idx: number, val: string) => {
        const updated = [...links];
        updated[idx] = val;
        setLinks(updated);
    };
    const removeLink = (idx: number) => setLinks(links.filter((_, i) => i !== idx));
    const validLinks = links.filter((l) => l.trim());

    const { signMessage, isPending: sigPending } = useSignMessage({
        mutation: {
            onSuccess: async (sig) => {
                const keys = deriveKeyFromSignature(sig);
                const fullBody = validLinks.length > 0
                    ? `${body}\n\n---\nDeliverables:\n${validLinks.map((l, i) => `${i + 1}. ${l}`).join("\n")}`
                    : body;
                const doc: DocumentContent = {
                    title: title || `Submission for Bounty #${bountyId}`,
                    body: fullBody,
                    createdAt: new Date().toISOString(),
                    author: address || "unknown",
                };
                const encrypted = encryptForWallet(doc, keys.publicKey);
                try {
                    const cid = await storeEncryptedDocument(encrypted);
                    setEncryptedCid(cid);
                    toast.success("Document encrypted & pinned to IPFS");
                } catch (err) {
                    console.error("[SubmitWork] Storage failed:", err);
                    toast.error("Failed to store document");
                }
                setEncrypting(false);
            },
            onError: () => {
                setEncrypting(false);
                toast.error("Signature rejected");
            },
        },
    });

    const { writeContract, data: txHash, isPending: txPending, error: submitError } = useWriteContract();
    const { isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const handleEncrypt = () => {
        if (!body.trim()) return;
        setEncrypting(true);
        signMessage({ message: SIGN_MESSAGE });
    };

    const handleSubmitOnChain = () => {
        writeContract({
            ...CONTRACTS.BountyEscrow,
            functionName: "submitWork",
            args: [BigInt(bountyId), encryptedCid],
        });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg p-6 rounded-xl border"
                style={{ background: "#0c0c0c", borderColor: "#1a1a1a", maxHeight: "85vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Lock className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    <h2 className="text-lg font-bold text-white">Submit Encrypted Work</h2>
                </div>
                <p className="text-[11px] mb-5 flex items-center gap-1.5" style={{ color: "#888" }}>
                    <Shield className="w-3 h-3" style={{ color: "#22c55e" }} />
                    Powered by Fileverse ECIES — only the poster's wallet can read this
                </p>

                {confirmed ? (
                    <div className="text-center py-6">
                        <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
                        <p className="text-[14px] font-bold text-white mb-1">Work submitted on-chain.</p>
                        <p className="text-[12px] mb-1" style={{ color: "#888" }}>
                            CID:{" "}
                            <code className="px-1.5 py-0.5 rounded" style={{ background: "#111", color: "#e8ff00" }}>
                                {encryptedCid}
                            </code>
                        </p>
                        <button
                            onClick={onClose}
                            className="mt-5 px-6 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent"
                            style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                        >
                            Close
                        </button>
                    </div>
                ) : encryptedCid ? (
                    <div className="flex flex-col gap-4">
                        <div
                            className="px-4 py-3 rounded-lg"
                            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
                        >
                            <p className="text-[11px] font-bold mb-1" style={{ color: "#22c55e" }}>
                                ✓ Encrypted & stored
                            </p>
                            <p className="text-[12px] font-mono" style={{ color: "#888" }}>
                                {encryptedCid}
                            </p>
                        </div>
                        {submitError && (
                            <p className="text-[12px]" style={{ color: "#ef4444" }}>
                                {submitError.message?.slice(0, 100)}
                            </p>
                        )}
                        <button
                            onClick={handleSubmitOnChain}
                            disabled={txPending}
                            className="w-full py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                        >
                            {txPending ? (
                                <>
                                    <Loader2 className="w-4 h-4 animate-spin inline mr-2" />
                                    Confirming...
                                </>
                            ) : (
                                "Submit CID On-Chain"
                            )}
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4">
                        {/* Title */}
                        <div>
                            <label className="text-[11px] font-bold tracking-wide uppercase block mb-1.5" style={{ color: "#666" }}>
                                Submission Title
                            </label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Final audit report, Video walkthrough, UI mockups"
                                className="w-full px-4 py-3 rounded-lg text-[13px] outline-none border"
                                style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }}
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label className="text-[11px] font-bold tracking-wide uppercase block mb-1.5" style={{ color: "#666" }}>
                                Description / Notes *
                            </label>
                            <textarea
                                value={body}
                                onChange={(e) => setBody(e.target.value)}
                                rows={5}
                                placeholder={"Describe what you built, key decisions, how to run/test it...\n\nInclude any context the poster needs to review your work."}
                                className="w-full px-4 py-3 rounded-lg text-[13px] leading-relaxed outline-none border"
                                style={{
                                    background: "#0a0a0a",
                                    borderColor: "#1a1a1a",
                                    color: "#ccc",
                                    resize: "vertical",
                                    fontFamily: "inherit",
                                }}
                            />
                        </div>

                        {/* Deliverable Links */}
                        <div>
                            <label className="text-[11px] font-bold tracking-wide uppercase block mb-1.5" style={{ color: "#666" }}>
                                Deliverable Links (videos, repos, demos, files)
                            </label>
                            <div className="flex flex-col gap-2">
                                {links.map((link, idx) => (
                                    <div key={idx} className="flex gap-2">
                                        <input
                                            type="url"
                                            value={link}
                                            onChange={(e) => updateLink(idx, e.target.value)}
                                            placeholder={
                                                idx === 0
                                                    ? "https://github.com/you/repo"
                                                    : idx === 1
                                                      ? "https://youtu.be/demo-video"
                                                      : "https://..."
                                            }
                                            className="flex-1 px-4 py-3 rounded-lg text-[13px] outline-none border"
                                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a", color: "#fff", fontFamily: "inherit" }}
                                        />
                                        {links.length > 1 && (
                                            <button
                                                onClick={() => removeLink(idx)}
                                                className="px-2.5 rounded-lg border-none cursor-pointer text-[16px] bg-transparent"
                                                style={{ color: "#555" }}
                                            >
                                                ×
                                            </button>
                                        )}
                                    </div>
                                ))}
                            </div>
                            <button
                                onClick={addLink}
                                className="mt-2 text-[11px] font-bold tracking-wide bg-transparent border-none cursor-pointer"
                                style={{ color: "#e8ff00", fontFamily: "inherit" }}
                            >
                                + Add another link
                            </button>
                            <p className="text-[10px] mt-1" style={{ color: "#444" }}>
                                GitHub repos, Loom/YouTube videos, Figma links, Google Drive, IPFS — anything the poster needs
                            </p>
                        </div>

                        {/* Encrypt & Submit */}
                        <button
                            onClick={handleEncrypt}
                            disabled={!body.trim() || encrypting || sigPending}
                            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{
                                background: body.trim() ? "#e8ff00" : "#222",
                                color: body.trim() ? "#000" : "#555",
                                fontFamily: "inherit",
                            }}
                        >
                            {encrypting || sigPending ? (
                                <>
                                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                                    Encrypting...
                                </>
                            ) : (
                                <>
                                    <Lock className="w-3.5 h-3.5" />
                                    Encrypt & Submit
                                </>
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ClaimPaymentModal: FC<{ bountyId: number; prize: string; onClose: () => void }> = ({
    bountyId,
    prize,
    onClose,
}) => {
    const { stealthKeys, deriveKeys, deriving } = useStealthKeys();
    const [stealthAddr, setStealthAddr] = useState("");
    const [ephPubKey, setEphPubKey] = useState("");
    const [viewTag, setViewTag] = useState("");

    const { writeContract, data: txHash, isPending, error: claimError } = useWriteContract();
    const { isSuccess: confirmed } = useWaitForTransactionReceipt({ hash: txHash });

    const handleGenerateStealth = async () => {
        let keys = stealthKeys;
        if (!keys) {
            deriveKeys();
            return;
        }
        const payment = generateStealthAddress(keys.metaAddress);
        setStealthAddr(payment.stealthAddress);
        setEphPubKey(payment.ephemeralPublicKey);
        setViewTag(payment.viewTag);
    };

    const handleClaim = () => {
        if (!stealthAddr || !ephPubKey || !viewTag) return;
        writeContract({
            ...CONTRACTS.BountyEscrow,
            functionName: "claimPayment",
            args: [
                BigInt(bountyId),
                stealthAddr as `0x${string}`,
                ephPubKey as `0x${string}`,
                viewTag as `0x${string}`,
            ],
        });
    };

    if (confirmed) {
        return (
            <div
                className="fixed inset-0 z-50 flex items-center justify-center p-6"
                style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
                onClick={onClose}
            >
                <div
                    className="w-full max-w-md p-8 rounded-xl border text-center"
                    style={{ background: "#0c0c0c", borderColor: "#1a1a1a" }}
                    onClick={(e) => e.stopPropagation()}
                >
                    <CheckCircle2 className="w-14 h-14 mx-auto mb-4" style={{ color: "#22c55e" }} />
                    <h2 className="text-lg font-bold text-white mb-2">Payment Claimed via Stealth Address!</h2>
                    <p className="text-[13px] mb-2" style={{ color: "#888" }}>
                        {prize} will be sent to your ERC-5564 stealth address.
                    </p>
                    <p className="text-[11px] font-mono mb-1" style={{ color: "#e8ff00" }}>
                        {stealthAddr.slice(0, 14)}...{stealthAddr.slice(-10)}
                    </p>
                    <p className="text-[11px] mb-4" style={{ color: "#555" }}>
                        Scan your Payments tab to find and access these funds.
                    </p>
                    {txHash && (
                        <a
                            href={`https://sepolia.basescan.org/tx/${txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-[12px] flex items-center justify-center gap-1"
                            style={{ color: "#60a5fa" }}
                        >
                            <ExternalLink className="w-3 h-3" /> View on Basescan
                        </a>
                    )}
                    <button
                        onClick={onClose}
                        className="mt-6 px-8 py-3 rounded-lg text-[13px] font-bold border cursor-pointer bg-transparent"
                        style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                    >
                        Close
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-lg p-6 rounded-xl border"
                style={{ background: "#0c0c0c", borderColor: "#1a1a1a", maxHeight: "90vh", overflowY: "auto" }}
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center gap-2 mb-1">
                    <Wallet className="w-5 h-5" style={{ color: "#e8ff00" }} />
                    <h2 className="text-lg font-bold text-white">Claim via Stealth Address (ERC-5564)</h2>
                </div>
                <p className="text-[12px] mb-6" style={{ color: "#888" }}>
                    Your payment will be sent to a mathematically derived stealth address. No new private key to save
                    — scan your Payments tab to find and spend these funds using your existing wallet.
                </p>

                {!stealthKeys && !stealthAddr && (
                    <div className="text-center py-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: "rgba(232,255,0,0.1)", border: "1px solid rgba(232,255,0,0.2)" }}
                        >
                            <Shield className="w-8 h-8" style={{ color: "#e8ff00" }} />
                        </div>
                        <p className="text-[14px] font-semibold text-white mb-2">
                            Set up your stealth keys first
                        </p>
                        <p className="text-[11px] mb-6" style={{ color: "#666" }}>
                            Sign two messages to derive your spending and viewing keys.
                            This only happens once per session.
                        </p>
                        <button
                            onClick={handleGenerateStealth}
                            disabled={deriving}
                            className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                        >
                            {deriving ? (
                                <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Deriving keys...</>
                            ) : (
                                "Derive Stealth Keys"
                            )}
                        </button>
                    </div>
                )}

                {stealthKeys && !stealthAddr && (
                    <div className="text-center py-4">
                        <div
                            className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"
                            style={{ background: "rgba(34,197,94,0.1)", border: "1px solid rgba(34,197,94,0.2)" }}
                        >
                            <Scan className="w-8 h-8" style={{ color: "#22c55e" }} />
                        </div>
                        <p className="text-[14px] font-semibold text-white mb-2">
                            Stealth keys ready
                        </p>
                        <p className="text-[11px] mb-6" style={{ color: "#666" }}>
                            Generate a one-time stealth address for this payment.
                        </p>
                        <button
                            onClick={handleGenerateStealth}
                            className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                            style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                        >
                            Generate Stealth Address
                        </button>
                    </div>
                )}

                {stealthAddr && (
                    <div className="flex flex-col gap-4">
                        <div
                            className="p-4 rounded-lg"
                            style={{ background: "rgba(34,197,94,0.06)", border: "1px solid rgba(34,197,94,0.15)" }}
                        >
                            <p className="text-[11px] font-bold mb-2" style={{ color: "#22c55e" }}>
                                Stealth address generated
                            </p>
                            <p className="text-[12px] font-mono break-all" style={{ color: "#e8ff00" }}>
                                {stealthAddr}
                            </p>
                        </div>

                        <div
                            className="p-3 rounded-lg"
                            style={{ background: "rgba(232,255,0,0.04)", border: "1px solid rgba(232,255,0,0.1)" }}
                        >
                            <p className="text-[11px]" style={{ color: "#888" }}>
                                This address is derived from your stealth keys using ECDH.
                                No one can link it to your ENS identity.
                                The ephemeral public key will be announced on-chain so you can find this payment later.
                            </p>
                        </div>

                        {claimError && (
                            <div className="p-3 rounded-lg" style={{ background: "rgba(239,68,68,0.06)", border: "1px solid rgba(239,68,68,0.2)" }}>
                                <p className="text-[12px] font-bold" style={{ color: "#ef4444" }}>
                                    {claimError.message?.slice(0, 150)}
                                </p>
                            </div>
                        )}

                        <button
                            onClick={handleClaim}
                            disabled={isPending}
                            className="w-full py-4 rounded-lg text-[14px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center justify-center gap-2"
                            style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                        >
                            {isPending ? (
                                <><Loader2 className="w-4 h-4 animate-spin" /> Confirming...</>
                            ) : (
                                "Claim Payment to Stealth Address"
                            )}
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

const ApplicationsTab: FC = () => {
    const { address } = useAccount();
    const { applications, isLoading } = useMyApplications();
    const [modal, setModal] = useState<
        { type: "submit"; bountyId: number } | { type: "claim"; bountyId: number; prize: string } | null
    >(null);

    if (!address) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <p className="text-[14px]" style={{ color: "#888" }}>
                    Connect your wallet to see your applications.
                </p>
            </div>
        );
    }

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading applications from chain...</p>
            </div>
        );
    }

    if (applications.length === 0) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <FileText className="w-10 h-10 mx-auto mb-4" style={{ color: "#333" }} />
                <h3 className="text-[16px] font-bold text-white mb-2">No applications yet</h3>
                <p className="text-[13px]" style={{ color: "#777" }}>
                    Browse bounties and apply to start working. Your applications will appear here.
                </p>
            </div>
        );
    }

    return (
        <div className="max-w-2xl mx-auto">
            <div className="space-y-2">
                {applications.map((app: MyApplication) => {
                    const style = STATUS_STYLES[app.status] || STATUS_STYLES.pending;
                    return (
                        <div key={app.bountyId} className="rounded-lg overflow-hidden" style={{ background: "#0a0a0a" }}>
                            <div className="w-full flex items-start gap-4 px-4 py-4">
                                <div className="flex-1 min-w-0">
                                    <p className="text-[14px] font-semibold text-white">{app.title}</p>
                                    <p className="text-[12px] mt-0.5" style={{ color: "#94a3b8" }}>
                                        {app.posterEns || "Anonymous Poster"} · {app.prize}
                                    </p>
                                    <div className="flex items-center gap-2 mt-2">
                                        <span
                                            className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded"
                                            style={{ background: style.bg, color: style.color }}
                                        >
                                            {style.label}
                                        </span>
                                        {app.status === "pending" && (
                                            <span className="text-[10px]" style={{ color: "#555" }}>
                                                You appear as Applicant #{app.applicantId}
                                            </span>
                                        )}
                                    </div>

                                    <div className="flex gap-2 mt-3">
                                        {app.status === "accepted" && (
                                            <button
                                                onClick={() => setModal({ type: "submit", bountyId: app.bountyId })}
                                                className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border-none cursor-pointer"
                                                style={{
                                                    background: "#e8ff00",
                                                    color: "#000",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                Submit Work
                                            </button>
                                        )}
                                        {app.status === "completed" && (
                                            <button
                                                onClick={() =>
                                                    setModal({
                                                        type: "claim",
                                                        bountyId: app.bountyId,
                                                        prize: app.prize,
                                                    })
                                                }
                                                className="px-4 py-2 rounded-lg text-[11px] font-bold uppercase tracking-wider border-none cursor-pointer flex items-center gap-1.5"
                                                style={{
                                                    background: "#22c55e",
                                                    color: "#fff",
                                                    fontFamily: "inherit",
                                                }}
                                            >
                                                <Wallet className="w-3.5 h-3.5" /> Claim Payment
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {modal?.type === "submit" && <SubmitWorkModal bountyId={modal.bountyId} onClose={() => setModal(null)} />}
            {modal?.type === "claim" && (
                <ClaimPaymentModal bountyId={modal.bountyId} prize={modal.prize} onClose={() => setModal(null)} />
            )}
        </div>
    );
};

export default ApplicationsTab;
