import { useEffect, useState, useCallback, type FC } from "react";
import {
    ArrowLeft,
    CheckCircle2,
    Copy,
    Download,
    Loader2,
    ShieldCheck,
    AlertTriangle,
    ShieldAlert,
} from "lucide-react";

interface ClaimPaymentTabProps {
    prize?: string;
    onClose?: () => void;
}

/* ── step definitions ───────────────────────────────────── */
const CLAIM_STEPS = [
    {
        progress: 35,
        status: "Securing connection to privacy nodes...",
        cta: "Initializing Vault",
    },
    {
        progress: 65,
        status: "Creating one-time stealth route...",
        cta: "Generating Stealth Address",
    },
    {
        progress: 100,
        status: "Shielded payment rail online.",
        cta: "Vault Ready",
    },
] as const;

const TOTAL_PROGRESS_SEGMENTS = 3;

/* ── dummy data (replace with real values) ──────────────── */
const GENERATED_ADDRESS = "0x9f2b8cD47eA31f...4a1c";
const FULL_ADDRESS = "0x9f2b8cD47eA31f7b3D19aE5c6F02d84B9c4a1c";
const PRIVATE_KEY_MASKED = "5K3n67P...xR2w9wZ";
const FULL_PRIVATE_KEY = "5K3n67PQm8hXrT4vB9wLz1cN6jD2eF0gY8kA5nR7xR2w9wZ";

/* ── component ──────────────────────────────────────────── */
const ClaimPaymentTab: FC<ClaimPaymentTabProps> = ({ prize, onClose }) => {
    const [stepIndex, setStepIndex] = useState(0);
    const [copiedAddr, setCopiedAddr] = useState(false);
    const [copiedKey, setCopiedKey] = useState(false);

    /* auto‑advance steps */
    useEffect(() => {
        if (stepIndex >= CLAIM_STEPS.length - 1) return;
        const timeout = window.setTimeout(
            () => setStepIndex((c) => Math.min(c + 1, CLAIM_STEPS.length - 1)),
            1300,
        );
        return () => window.clearTimeout(timeout);
    }, [stepIndex]);

    const isGenerating = stepIndex < CLAIM_STEPS.length - 1;
    const isReady = !isGenerating;

    /* clipboard helpers */
    const copyAddress = useCallback(() => {
        navigator.clipboard.writeText(FULL_ADDRESS);
        setCopiedAddr(true);
        setTimeout(() => setCopiedAddr(false), 1800);
    }, []);

    const copyPrivateKey = useCallback(() => {
        navigator.clipboard.writeText(FULL_PRIVATE_KEY);
        setCopiedKey(true);
        setTimeout(() => setCopiedKey(false), 1800);
    }, []);

    const downloadPrivateKey = useCallback(() => {
        const blob = new Blob([FULL_PRIVATE_KEY], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "darkearn-private-key.txt";
        a.click();
        URL.revokeObjectURL(url);
    }, []);

    /* ── inline styles (keep everything self‑contained) ─── */
    const styles = {
        wrapper: {
            minHeight: "calc(100vh - 8rem)",
            display: "flex",
            alignItems: "flex-start",
            justifyContent: "center",
            padding: "1rem 1rem 6rem",
        } as React.CSSProperties,

        card: {
            width: "100%",
            maxWidth: "400px",
            borderRadius: "1rem",
            border: "1px solid #2e2b10",
            background: "linear-gradient(180deg, #141407 0%, #0e0f05 100%)",
            boxShadow: "0 24px 70px rgba(0,0,0,0.45)",
            overflow: "hidden",
        } as React.CSSProperties,

        /* top bar */
        header: {
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            position: "relative" as const,
            padding: "14px 20px",
            borderBottom: "1px solid #23210c",
        } as React.CSSProperties,

        backBtn: {
            position: "absolute" as const,
            left: 16,
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            color: "#e8ff00",
            cursor: "pointer",
            padding: 4,
            display: "flex",
        } as React.CSSProperties,

        headerTitle: {
            fontSize: 14,
            fontWeight: 700,
            color: "#e8ff00",
            letterSpacing: "0.06em",
            textTransform: "uppercase" as const,
            margin: 0,
        } as React.CSSProperties,

        /* progress dots */
        progressRow: {
            display: "flex",
            justifyContent: "center",
            gap: 8,
            padding: "14px 0 6px",
        } as React.CSSProperties,

        /* body */
        body: { padding: "4px 24px 24px" } as React.CSSProperties,

        /* checkmark */
        checkWrapper: {
            display: "flex",
            justifyContent: "center",
            margin: "10px 0 8px",
        } as React.CSSProperties,

        /* address box */
        addrBox: {
            display: "flex",
            alignItems: "center",
            gap: 10,
            background: "#1a1a08",
            border: "1px solid #2f2c0e",
            borderRadius: 10,
            padding: "10px 14px",
            marginBottom: 16,
        } as React.CSSProperties,

        addrIcon: {
            width: 32,
            height: 32,
            borderRadius: 8,
            background: "rgba(232,255,0,0.10)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            color: "#e8ff00",
        } as React.CSSProperties,

        copyBtn: {
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: 4,
            background: "#e8ff00",
            color: "#0a0a0a",
            border: "none",
            borderRadius: 6,
            padding: "6px 12px",
            fontSize: 11,
            fontWeight: 700,
            cursor: "pointer",
            textTransform: "uppercase" as const,
            letterSpacing: "0.08em",
            fontFamily: "inherit",
        } as React.CSSProperties,

        /* warning card */
        warningCard: {
            background: "rgba(232,255,0,0.04)",
            border: "1px solid #3b380f",
            borderRadius: 10,
            padding: "14px 16px",
            marginBottom: 16,
        } as React.CSSProperties,

        /* private key */
        pkLabel: {
            fontSize: 10,
            fontWeight: 700,
            letterSpacing: "0.18em",
            textTransform: "uppercase" as const,
            color: "#65707d",
            marginBottom: 8,
            marginTop: 2,
        } as React.CSSProperties,

        pkBox: {
            display: "flex",
            alignItems: "center",
            background: "#1a1a08",
            border: "1px solid #e8ff00",
            borderRadius: 8,
            padding: "10px 14px",
            marginBottom: 16,
        } as React.CSSProperties,

        pkIconBtn: {
            background: "none",
            border: "none",
            color: "#e8ff00",
            cursor: "pointer",
            padding: 4,
            display: "flex",
        } as React.CSSProperties,

        /* disclaimer */
        disclaimerRow: {
            display: "flex",
            alignItems: "flex-start",
            gap: 8,
            marginBottom: 20,
        } as React.CSSProperties,

        /* cta button */
        cta: {
            width: "100%",
            borderRadius: 10,
            padding: "16px 0",
            fontSize: 14,
            fontWeight: 800,
            textTransform: "uppercase" as const,
            letterSpacing: "0.12em",
            border: "none",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            cursor: "pointer",
            fontFamily: "inherit",
            background: "#e8ff00",
            color: "#0a0a0a",
        } as React.CSSProperties,

        ctaDisabled: {
            background: "#7d7c12",
            color: "#d7d5a1",
            opacity: 0.95,
            cursor: "not-allowed",
        } as React.CSSProperties,

        /* footer */
        footer: {
            textAlign: "center" as const,
            paddingTop: 12,
            paddingBottom: 4,
            fontSize: 9,
            fontWeight: 700,
            letterSpacing: "0.22em",
            textTransform: "uppercase" as const,
            color: "#3d3f1f",
        } as React.CSSProperties,
    };

    /* ── render ─────────────────────────────────────────── */
    return (
        <div style={styles.wrapper}>
            <div style={styles.card}>
                {/* ── header ── */}
                <div style={styles.header}>
                    <button type="button" onClick={onClose} style={styles.backBtn} aria-label="Go back">
                        <ArrowLeft size={18} />
                    </button>
                    <p style={styles.headerTitle}>Claim Payment</p>
                </div>

                {/* ── progress segments ── */}
                <div style={styles.progressRow}>
                    {Array.from({ length: TOTAL_PROGRESS_SEGMENTS }).map((_, i) => (
                        <div
                            key={i}
                            style={{
                                width: 40,
                                height: 4,
                                borderRadius: 2,
                                background: i <= stepIndex ? "#e8ff00" : "#2e2b10",
                                transition: "background 0.4s ease",
                            }}
                        />
                    ))}
                </div>

                <div style={styles.body}>
                    {/* ── generating state ── */}
                    {isGenerating && (
                        <>
                            <div style={{ textAlign: "center", marginBottom: 12 }}>
                                <Loader2
                                    className="animate-spin"
                                    size={40}
                                    style={{ color: "#e8ff00", margin: "16px auto 12px" }}
                                />
                                <h2
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 800,
                                        color: "#ffffff",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    Generating Address…
                                </h2>
                                <p style={{ fontSize: 12, color: "#8ea3b0", margin: 0 }}>
                                    {CLAIM_STEPS[stepIndex].status}
                                </p>
                                {prize && (
                                    <p
                                        style={{
                                            fontSize: 11,
                                            fontWeight: 700,
                                            textTransform: "uppercase",
                                            letterSpacing: "0.18em",
                                            color: "#e8ff00",
                                            marginTop: 12,
                                        }}
                                    >
                                        Pending payout {prize}
                                    </p>
                                )}
                            </div>

                            {/* progress bar */}
                            <div
                                style={{
                                    height: 6,
                                    borderRadius: 3,
                                    background: "#27280f",
                                    overflow: "hidden",
                                    marginBottom: 20,
                                }}
                            >
                                <div
                                    style={{
                                        height: "100%",
                                        borderRadius: 3,
                                        width: `${CLAIM_STEPS[stepIndex].progress}%`,
                                        background: "#e8ff00",
                                        transition: "width 0.5s ease",
                                    }}
                                />
                            </div>

                            <button
                                type="button"
                                disabled
                                style={{ ...styles.cta, ...styles.ctaDisabled }}
                            >
                                <Loader2 className="animate-spin" size={16} />
                                {CLAIM_STEPS[stepIndex].cta}
                            </button>
                        </>
                    )}

                    {/* ── ready state (matches screenshot) ── */}
                    {isReady && (
                        <>
                            {/* green check */}
                            <div style={styles.checkWrapper}>
                                <CheckCircle2 size={44} style={{ color: "#22c55e" }} />
                            </div>

                            <div style={{ textAlign: "center", marginBottom: 18 }}>
                                <h2
                                    style={{
                                        fontSize: 22,
                                        fontWeight: 800,
                                        color: "#ffffff",
                                        margin: "0 0 6px",
                                    }}
                                >
                                    Fresh Address Generated
                                </h2>
                                <p style={{ fontSize: 12, color: "#8ea3b0", margin: 0, lineHeight: 1.6 }}>
                                    A unique, non-custodial wallet has been created for{" "}
                                    <span style={{ color: "#22c55e", textDecoration: "underline" }}>
                                        this transaction
                                    </span>
                                    .
                                </p>
                            </div>

                            {/* address box */}
                            <div style={styles.addrBox}>
                                <div style={styles.addrIcon}>
                                    <ShieldAlert size={16} />
                                </div>
                                <div style={{ minWidth: 0 }}>
                                    <p
                                        style={{
                                            fontSize: 13,
                                            fontWeight: 700,
                                            color: "#f3f4f6",
                                            margin: 0,
                                            fontFamily: "monospace",
                                            whiteSpace: "nowrap",
                                            overflow: "hidden",
                                            textOverflow: "ellipsis",
                                        }}
                                    >
                                        {GENERATED_ADDRESS}
                                    </p>
                                    <p style={{ fontSize: 10, color: "#65707d", margin: "2px 0 0" }}>
                                        Your unique receiving address
                                    </p>
                                </div>
                                <button
                                    type="button"
                                    onClick={copyAddress}
                                    style={styles.copyBtn}
                                >
                                    <Copy size={12} />
                                    {copiedAddr ? "Copied!" : "Copy"}
                                </button>
                            </div>

                            {/* warning box */}
                            <div style={styles.warningCard}>
                                <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 6 }}>
                                    <AlertTriangle size={14} style={{ color: "#e8ff00" }} />
                                    <span
                                        style={{
                                            fontSize: 12,
                                            fontWeight: 700,
                                            color: "#e8ff00",
                                        }}
                                    >
                                        Save your private key now.
                                    </span>
                                </div>
                                <p style={{ fontSize: 11, lineHeight: 1.7, color: "#c4c78f", margin: 0 }}>
                                    DarkEarn cannot recover it. This is your only access to the funds. Loss of
                                    this key means permanent loss of assets.
                                </p>
                            </div>

                            {/* private key */}
                            <p style={styles.pkLabel}>Private Key (Secret)</p>
                            <div style={styles.pkBox}>
                                <span
                                    style={{
                                        flex: 1,
                                        fontSize: 13,
                                        fontFamily: "monospace",
                                        color: "#e8ff00",
                                        letterSpacing: "0.04em",
                                    }}
                                >
                                    {PRIVATE_KEY_MASKED}
                                </span>
                                <button
                                    type="button"
                                    onClick={copyPrivateKey}
                                    style={styles.pkIconBtn}
                                    aria-label="Copy private key"
                                >
                                    <Copy size={15} />
                                </button>
                                <button
                                    type="button"
                                    onClick={downloadPrivateKey}
                                    style={styles.pkIconBtn}
                                    aria-label="Download private key"
                                >
                                    <Download size={15} />
                                </button>
                            </div>

                            {/* disclaimer */}
                            <div style={styles.disclaimerRow}>
                                <ShieldCheck
                                    size={16}
                                    style={{ color: "#e8ff00", flexShrink: 0, marginTop: 1 }}
                                />
                                <p style={{ fontSize: 11, lineHeight: 1.6, color: "#8ea3b0", margin: 0 }}>
                                    By proceeding, you confirm that funds will be transferred to this
                                    untraceable, non-custodial wallet.
                                </p>
                            </div>

                            {/* CTA */}
                            <button type="button" style={styles.cta}>
                                Send My Payment Here
                                <span style={{ fontSize: 16 }}>▷</span>
                            </button>

                            {/* footer */}
                            <p style={styles.footer}>Powered by DarkEarn Privacy Layer</p>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimPaymentTab;
