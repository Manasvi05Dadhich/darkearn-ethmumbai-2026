import { useState, type FC } from "react";
import {
    Copy,
    Shield,
    Wallet,
    ExternalLink,
    Loader2,
    Scan,
    Key,
    CheckCircle2,
    Eye,
    EyeOff,
} from "lucide-react";
import { useAccount } from "wagmi";
import { useStealthKeys } from "../../hooks/useStealthKeys";
import { useStealthPayments, type StealthPayment } from "../../hooks/useStealthPayments";
import { toast } from "sonner";

const PaymentCard: FC<{
    payment: StealthPayment;
    onReveal: () => void;
    revealedKey: string | null;
}> = ({ payment, onReveal, revealedKey }) => (
    <div
        className="px-5 py-4 flex flex-col gap-2"
        style={{ borderBottom: "1px solid #111" }}
    >
        <div className="flex items-center justify-between">
            <div>
                <p className="text-[13px] font-semibold text-white">
                    Stealth Payment
                </p>
                <p className="text-[11px] font-mono" style={{ color: "#555" }}>
                    {payment.stealthAddress.slice(0, 14)}...{payment.stealthAddress.slice(-8)}
                </p>
            </div>
            <div className="flex items-center gap-3">
                <span className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>
                    {payment.amount} ETH
                </span>
                <span
                    className="text-[10px] font-bold uppercase px-2 py-0.5 rounded"
                    style={{
                        background: payment.isSpent ? "rgba(239,68,68,0.15)" : "rgba(34,197,94,0.15)",
                        color: payment.isSpent ? "#ef4444" : "#22c55e",
                    }}
                >
                    {payment.isSpent ? "Spent" : "Available"}
                </span>
            </div>
        </div>

        <div className="flex items-center gap-2">
            <a
                href={`https://sepolia.basescan.org/tx/${payment.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[11px] flex items-center gap-1"
                style={{ color: "#60a5fa" }}
            >
                <ExternalLink className="w-3 h-3" /> View tx
            </a>

            {!payment.isSpent && !revealedKey && (
                <button
                    onClick={onReveal}
                    className="text-[11px] flex items-center gap-1 border-none bg-transparent cursor-pointer"
                    style={{ color: "#e8ff00", fontFamily: "inherit" }}
                >
                    <Key className="w-3 h-3" /> Reveal private key
                </button>
            )}
        </div>

        {revealedKey && (
            <div
                className="p-3 rounded-lg mt-1"
                style={{ background: "rgba(245,158,11,0.06)", border: "1px solid rgba(245,158,11,0.15)" }}
            >
                <p className="text-[10px] font-bold mb-1" style={{ color: "#f59e0b" }}>
                    Stealth Private Key — import to MetaMask to access funds
                </p>
                <p className="text-[10px] font-mono break-all mb-2" style={{ color: "#888" }}>
                    {revealedKey}
                </p>
                <button
                    onClick={() => {
                        navigator.clipboard.writeText(revealedKey);
                        toast.success("Private key copied");
                    }}
                    className="text-[10px] flex items-center gap-1 border-none bg-transparent cursor-pointer"
                    style={{ color: "#f59e0b", fontFamily: "inherit" }}
                >
                    <Copy className="w-3 h-3" /> Copy
                </button>
            </div>
        )}
    </div>
);

const PaymentsTab: FC = () => {
    const { address } = useAccount();
    const { stealthKeys, deriveKeys, deriving, registerOnChain, registering, registered } = useStealthKeys();
    const { payments, scanning, scanForPayments, revealPrivateKey, totalAvailable } =
        useStealthPayments(stealthKeys);
    const [revealedKeys, setRevealedKeys] = useState<Record<string, string>>({});
    const [showMeta, setShowMeta] = useState(false);

    const shortAddr = address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected";

    if (!stealthKeys) {
        return (
            <div className="max-w-2xl mx-auto">
                <div className="flex items-center gap-3 mb-6">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(232,255,0,0.12)", border: "1px solid rgba(232,255,0,0.18)" }}
                    >
                        <Shield className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                    <div>
                        <p className="text-[20px] font-extrabold text-white leading-none">Private Payments</p>
                        <p className="text-[12px]" style={{ color: "#e8ff00" }}>ERC-5564 Stealth Addresses</p>
                    </div>
                </div>

                <div
                    className="rounded-xl border p-8 text-center"
                    style={{ background: "#121208", borderColor: "#2a2a12" }}
                >
                    <Scan className="w-12 h-12 mx-auto mb-4" style={{ color: "#e8ff00" }} />
                    <h3 className="text-[18px] font-bold text-white mb-2">Set Up Stealth Payments</h3>
                    <p className="text-[13px] mb-6 max-w-md mx-auto" style={{ color: "#888" }}>
                        DarkEarn uses ERC-5564 stealth addresses to keep your payments completely private.
                        Sign with your wallet to derive your spending and viewing keys.
                        This does not cost gas.
                    </p>
                    <button
                        onClick={deriveKeys}
                        disabled={deriving}
                        className="px-8 py-3.5 rounded-lg text-[13px] font-bold uppercase tracking-wider border-none cursor-pointer"
                        style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                    >
                        {deriving ? (
                            <><Loader2 className="w-4 h-4 animate-spin inline mr-2" /> Deriving keys...</>
                        ) : (
                            "Set Up Private Payments"
                        )}
                    </button>
                    <p className="text-[11px] mt-4" style={{ color: "#555" }}>
                        You will see two signature requests — one for your spending key,
                        one for your viewing key. These never leave your browser.
                    </p>
                </div>
            </div>
        );
    }

    const totalEth = payments
        .filter((p) => !p.isSpent)
        .reduce((sum, p) => sum + parseFloat(p.amount || "0"), 0);

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(232,255,0,0.12)", border: "1px solid rgba(232,255,0,0.18)" }}
                    >
                        <Wallet className="w-6 h-6" style={{ color: "#e8ff00" }} />
                    </div>
                    <div>
                        <p className="text-[20px] font-extrabold text-white leading-none">Stealth Payments</p>
                        <p className="text-[12px]" style={{ color: "#e8ff00" }}>{shortAddr}</p>
                    </div>
                </div>
                <button
                    onClick={scanForPayments}
                    disabled={scanning}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-[12px] font-bold border-none cursor-pointer"
                    style={{ background: "#e8ff00", color: "#000", fontFamily: "inherit" }}
                >
                    {scanning ? (
                        <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Scanning...</>
                    ) : (
                        <><Scan className="w-3.5 h-3.5" /> Scan Blockchain</>
                    )}
                </button>
            </div>

            <div className="rounded-xl border p-4 mb-4" style={{ background: "#121208", borderColor: "#2a2a12" }}>
                <div
                    className="rounded-xl border px-4 py-8 mb-4 flex items-center justify-center"
                    style={{
                        background: "linear-gradient(180deg, rgba(232,255,0,0.05), rgba(232,255,0,0.01))",
                        borderColor: "#2f2b12",
                    }}
                >
                    <div
                        className="w-14 h-14 rounded-lg flex items-center justify-center"
                        style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.16)" }}
                    >
                        <Wallet className="w-7 h-7" style={{ color: "#e8ff00" }} />
                    </div>
                </div>

                <p className="text-[11px] font-bold tracking-widest uppercase mb-2" style={{ color: "#9b9b63" }}>
                    Available Balance (stealth)
                </p>
                <p className="text-[48px] font-extrabold leading-none mb-3" style={{ color: "#e8ff00" }}>
                    {totalEth.toFixed(4)}{" "}
                    <span className="text-[28px] text-white">ETH</span>
                </p>
                <div className="flex items-center gap-2 mb-4">
                    <Shield className="w-3.5 h-3.5" style={{ color: "#e8ff00" }} />
                    <p className="text-[12px] font-medium" style={{ color: "#e8ff00" }}>
                        {totalAvailable} stealth payment{totalAvailable !== 1 ? "s" : ""} found
                    </p>
                </div>

                <div
                    className="p-3 rounded-lg mb-4"
                    style={{ background: "rgba(232,255,0,0.04)", border: "1px solid rgba(232,255,0,0.1)" }}
                >
                    <p className="text-[11px]" style={{ color: "#888" }}>
                        Payments use ERC-5564 stealth addresses. Each payment goes to a unique,
                        unlinkable address derived from your keys. Only you can find and spend them.
                    </p>
                </div>

                {!registered && (
                    <button
                        onClick={registerOnChain}
                        disabled={registering}
                        className="w-full py-3 rounded-lg text-[12px] font-bold border-none cursor-pointer flex items-center justify-center gap-2 mb-3"
                        style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00", fontFamily: "inherit" }}
                    >
                        {registering ? (
                            <><Loader2 className="w-3.5 h-3.5 animate-spin" /> Registering...</>
                        ) : (
                            <><CheckCircle2 className="w-3.5 h-3.5" /> Register stealth meta-address on-chain</>
                        )}
                    </button>
                )}
            </div>

            <div className="mb-4">
                <div className="flex items-center justify-between mb-2">
                    <p className="text-[11px] font-bold tracking-widest uppercase" style={{ color: "#9b9b63" }}>
                        Your Stealth Meta-Address
                    </p>
                    <button
                        onClick={() => setShowMeta(!showMeta)}
                        className="text-[11px] flex items-center gap-1 border-none bg-transparent cursor-pointer"
                        style={{ color: "#888", fontFamily: "inherit" }}
                    >
                        {showMeta ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                        {showMeta ? "Hide" : "Show"}
                    </button>
                </div>
                {showMeta && (
                    <div
                        className="rounded-xl border px-4 py-3 flex items-center justify-between gap-2"
                        style={{ background: "#121208", borderColor: "#2a2a12" }}
                    >
                        <p className="text-[10px] font-mono break-all flex-1" style={{ color: "#888" }}>
                            {stealthKeys.metaAddress}
                        </p>
                        <button
                            onClick={() => {
                                navigator.clipboard.writeText(stealthKeys.metaAddress);
                                toast.success("Meta-address copied");
                            }}
                            className="border-none bg-transparent cursor-pointer flex-shrink-0"
                            style={{ color: "#e8ff00" }}
                        >
                            <Copy className="w-4 h-4" />
                        </button>
                    </div>
                )}
            </div>

            <div className="flex items-center justify-between mb-3">
                <h3 className="text-[18px] font-bold text-white">Stealth Payments</h3>
            </div>

            {payments.length === 0 ? (
                <div className="text-center py-8">
                    <Wallet className="w-8 h-8 mx-auto mb-3" style={{ color: "#333" }} />
                    <p className="text-[13px]" style={{ color: "#777" }}>
                        {scanning
                            ? "Scanning blockchain for your payments..."
                            : "No stealth payments found. Click 'Scan Blockchain' to check."}
                    </p>
                </div>
            ) : (
                <div
                    className="rounded-xl border overflow-hidden"
                    style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                >
                    {payments.map((p) => (
                        <PaymentCard
                            key={p.txHash}
                            payment={p}
                            revealedKey={revealedKeys[p.stealthAddress] || null}
                            onReveal={() => {
                                try {
                                    const pk = revealPrivateKey(p);
                                    setRevealedKeys((prev) => ({ ...prev, [p.stealthAddress]: pk }));
                                    toast.success("Stealth private key computed");
                                } catch {
                                    toast.error("Failed to compute private key");
                                }
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentsTab;
