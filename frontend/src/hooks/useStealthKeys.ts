import { useState, useEffect, useCallback } from "react";
import { useAccount, useSignMessage, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import {
    deriveStealthKeys,
    metaAddressToBytes,
    SPENDING_SIGN_MSG,
    VIEWING_SIGN_MSG,
    type StealthKeys,
} from "../lib/stealth";
import { CONTRACTS } from "../contracts";
import { toast } from "sonner";
import type { Hex } from "viem";

const SESSION_KEY = "darkearn-stealth-keys";

/**
 * Derives and caches stealth keys for the connected wallet.
 * Keys are deterministic — same wallet always produces same keys.
 * Cached in sessionStorage (cleared on browser close).
 *
 * Also handles registering the stealth meta-address on-chain
 * via ReputationNFT.setStealthMetaAddress().
 */
export function useStealthKeys() {
    const { address } = useAccount();
    const [stealthKeys, setStealthKeys] = useState<StealthKeys | null>(null);
    const [deriving, setDeriving] = useState(false);
    const [step, setStep] = useState<"idle" | "spending-sig" | "viewing-sig" | "done">("idle");

    // Internal state to collect signatures
    const [spendingSig, setSpendingSig] = useState<Hex | null>(null);

    // Load cached keys on mount
    useEffect(() => {
        const cached = sessionStorage.getItem(SESSION_KEY);
        if (cached) {
            try {
                setStealthKeys(JSON.parse(cached));
            } catch {
                sessionStorage.removeItem(SESSION_KEY);
            }
        }
    }, []);

    // Clear keys on disconnect
    useEffect(() => {
        if (!address) {
            setStealthKeys(null);
            sessionStorage.removeItem(SESSION_KEY);
        }
    }, [address]);

    const { signMessage: signSpending } = useSignMessage({
        mutation: {
            onSuccess: (sig) => {
                setSpendingSig(sig as Hex);
                setStep("viewing-sig");
            },
            onError: () => {
                setDeriving(false);
                setStep("idle");
                toast.error("Spending key signature rejected");
            },
        },
    });

    const { signMessage: signViewing } = useSignMessage({
        mutation: {
            onSuccess: (viewingSig) => {
                if (!spendingSig) return;
                const keys = deriveStealthKeys(spendingSig, viewingSig as Hex);
                setStealthKeys(keys);
                sessionStorage.setItem(SESSION_KEY, JSON.stringify(keys));
                setDeriving(false);
                setStep("done");
                toast.success("Stealth keys derived");
            },
            onError: () => {
                setDeriving(false);
                setStep("idle");
                toast.error("Viewing key signature rejected");
            },
        },
    });

    // Trigger the second signature when step transitions
    useEffect(() => {
        if (step === "viewing-sig" && address) {
            signViewing({ message: VIEWING_SIGN_MSG(address) });
        }
    }, [step, address, signViewing]);

    const deriveKeys = useCallback(() => {
        if (!address || deriving) return;
        setDeriving(true);
        setStep("spending-sig");
        signSpending({ message: SPENDING_SIGN_MSG(address) });
    }, [address, deriving, signSpending]);

    // On-chain registration of stealth meta-address
    const { writeContract, data: regTxHash, isPending: registering } = useWriteContract();
    const { isSuccess: registered } = useWaitForTransactionReceipt({ hash: regTxHash });

    const registerOnChain = useCallback(() => {
        if (!stealthKeys) return;
        const metaBytes = metaAddressToBytes(stealthKeys.metaAddress);
        writeContract({
            ...CONTRACTS.ReputationNFT,
            functionName: "setStealthMetaAddress",
            args: [metaBytes],
        });
    }, [stealthKeys, writeContract]);

    useEffect(() => {
        if (registered) {
            toast.success("Stealth meta-address registered on-chain");
        }
    }, [registered]);

    const clearKeys = useCallback(() => {
        setStealthKeys(null);
        sessionStorage.removeItem(SESSION_KEY);
        setStep("idle");
    }, []);

    return {
        stealthKeys,
        deriveKeys,
        clearKeys,
        deriving,
        step,
        registerOnChain,
        registering,
        registered,
    };
}
