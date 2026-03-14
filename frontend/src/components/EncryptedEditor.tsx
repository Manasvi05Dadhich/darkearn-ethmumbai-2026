/**
 * Fileverse dDocs Encrypted Editor — DarkEarn
 *
 * Rich-text editor powered by @fileverse-dev/ddoc.
 * Content is encrypted with ECIES before storage — only the target wallet can read it.
 */
import { useState, useRef, lazy, Suspense, Component, type FC, type MouseEvent, type ReactNode } from "react";
import { Lock, Shield, Loader2, CheckCircle2 } from "lucide-react";
import { useAccount, useSignMessage } from "wagmi";
import {
    encryptForWallet,
    deriveKeyFromSignature,
    storeEncryptedDocument,
    SIGN_MESSAGE,
    type DocumentContent,
} from "../lib/fileverse";

// Lazy-load DdocEditor to prevent React 19 compat issues from crashing the app
const LazyDdocEditor = lazy(() =>
    import("@fileverse-dev/ddoc").then((mod) => ({ default: mod.DdocEditor }))
);

// Error boundary to catch DdocEditor crashes gracefully
class EditorErrorBoundary extends Component<{ children: ReactNode; fallback: ReactNode }, { hasError: boolean }> {
    state = { hasError: false };
    static getDerivedStateFromError() { return { hasError: true }; }
    render() {
        if (this.state.hasError) return this.fallback;
        return this.props.children;
    }
    get fallback() { return this.props.fallback; }
}

interface EncryptedEditorProps {
    sectionTitle?: string;
    placeholder?: string;
    onEncryptedStore: (cid: string, publicKey: string) => void;
    hidden?: boolean;
}

const EncryptedEditor: FC<EncryptedEditorProps> = ({
    sectionTitle = "Private Brief (Encrypted via Fileverse dDocs)",
    placeholder = "Write your confidential project brief here...\n\nThis content will be end-to-end encrypted using Fileverse ECIES.\nOnly the accepted applicant's wallet will be able to decrypt and read it.",
    onEncryptedStore,
    hidden,
}) => {
    const { address } = useAccount();
    const [expanded, setExpanded] = useState(false);
    const [encrypting, setEncrypting] = useState(false);
    const [storedCid, setStoredCid] = useState<string | null>(null);
    const [zoomLevel, setZoomLevel] = useState("100%");
    const [isNavbarVisible, setIsNavbarVisible] = useState(false);
    const [useFallback, setUseFallback] = useState(false);
    const [fallbackBody, setFallbackBody] = useState("");
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const editorContentRef = useRef<any>(null);

    const { signMessage, isPending: signing } = useSignMessage({
        mutation: {
            onSuccess: async (sig) => {
                const keys = deriveKeyFromSignature(sig);
                const content = useFallback ? fallbackBody : editorContentRef.current;
                const doc: DocumentContent = {
                    title: "Encrypted Brief",
                    body: typeof content === "string" ? content : JSON.stringify(content || {}),
                    createdAt: new Date().toISOString(),
                    author: address || "unknown",
                };
                const encrypted = encryptForWallet(doc, keys.publicKey);
                try {
                    const cid = await storeEncryptedDocument(encrypted);
                    setStoredCid(cid);
                    onEncryptedStore(cid, keys.publicKey);
                } catch (err) {
                    console.error("[EncryptedEditor] Storage failed:", err);
                }
                setEncrypting(false);
            },
            onError: () => setEncrypting(false),
        },
    });

    const handleEncrypt = () => {
        const hasContent = useFallback ? fallbackBody.trim() : editorContentRef.current;
        if (!hasContent) return;
        setEncrypting(true);
        signMessage({ message: SIGN_MESSAGE });
    };

    if (hidden) return null;

    const FallbackTextarea = (
        <textarea
            value={fallbackBody}
            onChange={(e) => setFallbackBody(e.target.value)}
            placeholder={placeholder}
            rows={8}
            className="w-full px-4 py-3 rounded-lg text-[13px] leading-relaxed outline-none border bg-transparent"
            style={{
                borderColor: "#1a1a1a",
                color: "#ccc",
                fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                resize: "vertical",
            }}
        />
    );

    return (
        <div className="mt-6">
            <button
                type="button"
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between px-4 py-3 rounded-lg border cursor-pointer bg-transparent transition-all"
                style={{
                    borderColor: expanded ? "rgba(232,255,0,0.3)" : "#1a1a1a",
                    background: expanded ? "rgba(232,255,0,0.04)" : "#0a0a0a",
                    fontFamily: "inherit",
                }}
            >
                <div className="flex items-center gap-2">
                    <Lock className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>
                        {sectionTitle}
                    </span>
                </div>
                <span className="text-[11px] font-medium" style={{ color: "#888" }}>
                    {expanded ? "▲ Collapse" : "▼ Optional — Add Encrypted Brief"}
                </span>
            </button>

            {expanded && (
                <div className="mt-3 rounded-xl border p-5" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                    {storedCid ? (
                        <div className="text-center py-6">
                            <CheckCircle2 className="w-12 h-12 mx-auto mb-3" style={{ color: "#22c55e" }} />
                            <p className="text-[14px] font-bold text-white mb-1">Brief Encrypted & Stored</p>
                            <p className="text-[12px] mb-3" style={{ color: "#888" }}>
                                CID: <code className="px-2 py-0.5 rounded" style={{ background: "#111", color: "#e8ff00" }}>{storedCid}</code>
                            </p>
                            <div className="flex items-center justify-center gap-2 text-[11px]" style={{ color: "#22c55e" }}>
                                <Shield className="w-3 h-3" />
                                <span>End-to-end encrypted with Fileverse ECIES</span>
                            </div>
                        </div>
                    ) : (
                        <>
                            <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-lg" style={{ background: "rgba(232,255,0,0.04)", border: "1px solid rgba(232,255,0,0.1)" }}>
                                <Shield className="w-3.5 h-3.5 flex-shrink-0" style={{ color: "#e8ff00" }} />
                                <p className="text-[11px]" style={{ color: "#e8ff00" }}>
                                    <strong>Fileverse dDocs</strong> — Rich-text editor with end-to-end encryption. Only the intended wallet can decrypt.
                                </p>
                            </div>

                            {/* dDocs Editor with fallback */}
                            <div
                                className="rounded-lg border overflow-hidden"
                                style={{
                                    borderColor: "#1a1a1a",
                                    background: "#111",
                                    minHeight: "300px",
                                }}
                            >
                                {useFallback ? (
                                    <div className="p-4">{FallbackTextarea}</div>
                                ) : (
                                    <EditorErrorBoundary
                                        fallback={
                                            <div className="p-4">
                                                <p className="text-[11px] mb-2" style={{ color: "#888" }}>
                                                    dDocs editor unavailable — using plain text editor
                                                </p>
                                                {FallbackTextarea}
                                            </div>
                                        }
                                    >
                                        <Suspense
                                            fallback={
                                                <div className="flex items-center justify-center py-16">
                                                    <Loader2 className="w-6 h-6 animate-spin" style={{ color: "#e8ff00" }} />
                                                    <span className="ml-2 text-[13px]" style={{ color: "#888" }}>Loading dDocs editor...</span>
                                                </div>
                                            }
                                        >
                                            <LazyDdocEditor
                                                isPreviewMode={false}
                                                onChange={(content: unknown) => {
                                                    if (typeof content !== "string") {
                                                        editorContentRef.current = content;
                                                    }
                                                }}
                                                zoomLevel={zoomLevel}
                                                setZoomLevel={setZoomLevel}
                                                isNavbarVisible={isNavbarVisible}
                                                setIsNavbarVisible={setIsNavbarVisible}
                                                documentStyling={{
                                                    background: { light: "#111", dark: "#111" },
                                                    canvasBackground: { light: "#0a0a0a", dark: "#0a0a0a" },
                                                    textColor: { light: "#ccc", dark: "#ccc" },
                                                    fontFamily: "Inter, sans-serif",
                                                }}
                                                editorCanvasClassNames="min-h-[250px] p-4"
                                            />
                                        </Suspense>
                                    </EditorErrorBoundary>
                                )}
                            </div>

                            {/* Toggle + Encrypt button */}
                            <div className="flex items-center justify-between mt-4">
                                <button
                                    type="button"
                                    onClick={() => setUseFallback(!useFallback)}
                                    className="text-[11px] bg-transparent border-none cursor-pointer underline"
                                    style={{ color: "#555", fontFamily: "inherit" }}
                                >
                                    {useFallback ? "Switch to rich editor" : "Switch to plain text"}
                                </button>
                                <button
                                    type="button"
                                    onClick={handleEncrypt}
                                    disabled={encrypting || signing}
                                    className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer transition-all"
                                    style={{
                                        background: "#e8ff00",
                                        color: "#000",
                                        fontFamily: "inherit",
                                        opacity: encrypting || signing ? 0.7 : 1,
                                    }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
                                        e.currentTarget.style.transform = "translateY(-1px)";
                                    }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
                                        e.currentTarget.style.transform = "translateY(0)";
                                    }}
                                >
                                    {encrypting || signing ? (
                                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Signing & Encrypting...</>
                                    ) : (
                                        <><Lock className="w-3.5 h-3.5" /> Encrypt & Store</>
                                    )}
                                </button>
                            </div>
                        </>
                    )}
                </div>
            )}
        </div>
    );
};

export default EncryptedEditor;
