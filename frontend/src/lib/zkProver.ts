/**
 * DarkEarn ZK Proof Generation
 *
 * Uses the compiled Noir circuit (reputation_score) to generate
 * UltraHonk proofs entirely in the browser via WASM.
 *
 * Private inputs never leave the browser.
 * Only the proof bytes and the public score_band are sent on-chain.
 *
 * All noir/bb packages are excluded from Vite's dep optimizer so
 * their internal WASM loading (via import.meta.url) works correctly.
 * Noir.execute() handles WASM init automatically.
 */

import circuit from "../circuits/reputation_score.json";

export interface ReputationInputs {
    darkearn_completions: number;
    darkearn_approval_rate: number;
    darkearn_dispute_rate: number;
    darkearn_account_age_days: number;
    score_band: number;
}

export interface ProofResult {
    proof: Uint8Array;
    publicInputs: string[];
    proofHex: `0x${string}`;
    publicInputsBytes32: `0x${string}`[];
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
let noirInstance: any = null;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let backendInstance: any = null;

async function getInstances() {
    if (!noirInstance || !backendInstance) {
        console.log("[ZK] Importing @noir-lang/noir_js...");
        const noirMod = await import("@noir-lang/noir_js");
        console.log("[ZK] noir_js imported, exports:", Object.keys(noirMod));

        console.log("[ZK] Importing @aztec/bb.js...");
        const bbMod = await import("@aztec/bb.js");
        console.log("[ZK] bb.js imported, exports:", Object.keys(bbMod).slice(0, 10));

        console.log("[ZK] Creating Noir instance...");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        noirInstance = new noirMod.Noir(circuit as any);

        console.log("[ZK] Creating UltraHonkBackend...");
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        backendInstance = new bbMod.UltraHonkBackend((circuit as any).bytecode);
        console.log("[ZK] Both instances created");
    }
    return { noir: noirInstance, backend: backendInstance };
}

function computeExpectedBand(inputs: Omit<ReputationInputs, "score_band">): number {
    const { darkearn_completions: c, darkearn_approval_rate: a, darkearn_dispute_rate: d, darkearn_account_age_days: age } = inputs;

    if (c >= 25 && a >= 92 && d === 0 && age >= 60) return 4;
    if (c >= 15 && a >= 85 && d < 5 && age >= 30) return 3;
    if (c >= 8 && a >= 80 && d < 10 && age >= 14) return 2;
    if (c >= 3 && a >= 70 && d === 0 && age >= 7) return 1;
    return 0;
}

export async function generateReputationProof(
    inputs: Omit<ReputationInputs, "score_band">
): Promise<ProofResult> {
    const score_band = computeExpectedBand(inputs);

    const witnessInputs: Record<string, string> = {
        darkearn_completions: inputs.darkearn_completions.toString(),
        darkearn_approval_rate: inputs.darkearn_approval_rate.toString(),
        darkearn_dispute_rate: inputs.darkearn_dispute_rate.toString(),
        darkearn_account_age_days: inputs.darkearn_account_age_days.toString(),
        score_band: score_band.toString(),
    };

    const { noir, backend } = await getInstances();

    console.log("[ZK] Executing circuit (this triggers WASM init)...");
    const { witness } = await noir.execute(witnessInputs);
    console.log("[ZK] Witness generated, length:", witness.length);

    console.log("[ZK] Generating proof (heavy WASM operation)...");
    const proof = await backend.generateProof(witness);
    console.log("[ZK] Proof generated, size:", proof.proof.length);

    const proofBytes = proof.proof;
    const proofHex = ("0x" + Array.from(proofBytes as Uint8Array).map((b: number) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`;

    const publicInputsBytes32 = [
        ("0x" + score_band.toString(16).padStart(64, "0")) as `0x${string}`,
    ];

    return {
        proof: proofBytes as Uint8Array,
        publicInputs: [score_band.toString()],
        proofHex,
        publicInputsBytes32,
    };
}

export { computeExpectedBand };
