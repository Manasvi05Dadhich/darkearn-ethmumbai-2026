/**
 * Fileverse Brief Viewer — DarkEarn
 * 
 * Decrypts and displays a Fileverse-encrypted document.
 * User signs a message → derives key → decrypts the document.
 */
import { useState, type FC } from "react";
import { Lock, Loader2, Shield, FileText, AlertTriangle } from "lucide-react";
import { useSignMessage } from "wagmi";
import {
    fetchEncryptedDocument,
    decryptWithKey,
    deriveKeyFromSignature,
    SIGN_MESSAGE,
    type DocumentContent,
} from "../lib/fileverse";

interface BriefViewerProps {
    /** The CID of the encrypted document */
    cid: string;
    /** Called when user closes the viewer */
    onClose: () => void;
}

const FileverseBriefViewer: FC<BriefViewerProps> = ({ cid, onClose }) => {
    const [doc, setDoc] = useState<DocumentContent | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [decrypting, setDecrypting] = useState(false);

    const { signMessage, isPending: signing } = useSignMessage({
        mutation: {
            onSuccess: (sig) => {
                try {
                    const encrypted = fetchEncryptedDocument(cid);
                    if (!encrypted) {
                        setError("Document not found. It may have been deleted or the CID is invalid.");
                        setDecrypting(false);
                        return;
                    }
                    const keys = deriveKeyFromSignature(sig);
                    const decrypted = decryptWithKey(encrypted, keys.privateKey);
                    setDoc(decrypted);
                    setError(null);
                } catch {
                    setError("Decryption failed. You may not have access to this document — only the authorized wallet can decrypt it.");
                }
                setDecrypting(false);
            },
            onError: () => {
                setError("Signature cancelled. You need to sign to prove wallet ownership for decryption.");
                setDecrypting(false);
            },
        },
    });

    const handleDecrypt = () => {
        setDecrypting(true);
        setError(null);
        signMessage({ message: SIGN_MESSAGE });
    };

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-6"
            style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(6px)" }}
            onClick={onClose}
        >
            <div
                className="w-full max-w-2xl rounded-xl border overflow-hidden"
                style={{ background: "#0c0c0c", borderColor: "#1a1a1a", maxHeight: "80vh" }}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="px-6 py-4 border-b flex items-center justify-between" style={{ borderColor: "#1a1a1a", background: "rgba(232,255,0,0.03)" }}>
                    <div className="flex items-center gap-2">
                        <Lock className="w-4 h-4" style={{ color: "#e8ff00" }} />
                        <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>Fileverse Encrypted Document</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded" style={{ background: "#111", color: "#888" }}>{cid}</span>
                </div>

                <div className="px-6 py-6 overflow-y-auto" style={{ maxHeight: "65vh" }}>
                    {doc ? (
                        /* Decrypted content */
                        <>
                            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.15)" }}>
                                <Shield className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                <span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>Decrypted successfully — Fileverse ECIES</span>
                            </div>
                            <h2 className="text-xl font-bold text-white mb-2">{doc.title}</h2>
                            <div className="flex items-center gap-4 mb-5 text-[11px]" style={{ color: "#666" }}>
                                <span>By: {doc.author.slice(0, 6)}...{doc.author.slice(-4)}</span>
                                <span>{new Date(doc.createdAt).toLocaleDateString()}</span>
                            </div>
                            <div className="text-[14px] text-white whitespace-pre-wrap leading-relaxed"
                                style={{ fontFamily: "'Inter', sans-serif" }}>
                                {doc.body}
                            </div>
                        </>
                    ) : error ? (
                        /* Error state */
                        <div className="text-center py-8">
                            <AlertTriangle className="w-10 h-10 mx-auto mb-3" style={{ color: "#ef4444" }} />
                            <p className="text-[14px] font-bold text-white mb-2">Access Denied</p>
                            <p className="text-[12px] mb-4" style={{ color: "#888" }}>{error}</p>
                            <button onClick={handleDecrypt}
                                className="px-5 py-2.5 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent"
                                style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>
                                Try Again
                            </button>
                        </div>
                    ) : (
                        /* Unlock prompt */
                        <div className="text-center py-8">
                            <div className="relative inline-block mb-5">
                                <div className="absolute inset-0 rounded-full opacity-20 blur-xl" style={{ background: "#e8ff00" }} />
                                <FileText className="relative w-14 h-14 mx-auto" style={{ color: "#e8ff00" }} />
                            </div>
                            <h3 className="text-[16px] font-bold text-white mb-2">Encrypted Document</h3>
                            <p className="text-[12px] mb-6 max-w-sm mx-auto" style={{ color: "#888" }}>
                                This document is encrypted with Fileverse ECIES. Sign a message to derive your decryption key and prove wallet ownership.
                            </p>
                            <button onClick={handleDecrypt} disabled={decrypting || signing}
                                className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                                style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}>
                                {decrypting || signing ? (
                                    <><Loader2 className="w-4 h-4 animate-spin inline mr-2" />Decrypting...</>
                                ) : (
                                    <><Lock className="w-4 h-4 inline mr-2" />Sign to Decrypt</>
                                )}
                            </button>
                            <p className="text-[10px] font-medium uppercase tracking-wider mt-6" style={{ color: "#444" }}>
                                Powered by Fileverse × DarkEarn
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-3 border-t flex justify-end" style={{ borderColor: "#1a1a1a" }}>
                    <button onClick={onClose}
                        className="px-4 py-2 rounded-lg text-[12px] font-bold border cursor-pointer bg-transparent"
                        style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}>
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default FileverseBriefViewer;
