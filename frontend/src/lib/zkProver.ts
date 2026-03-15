/**
 * DarkEarn ZK Proof Generation
 *
 * MOCK MODE: Returns fake proof data for development. Uses testMint on-chain
 * instead of mint() since the verifier would reject mock proofs.
 *
 * To enable real ZK: set MOCK_ZK = false and fix Noir/bb.js integration.
 */

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

/** When true, proof is mocked and testMint must be used on-chain (mint would reject fake proof) */
export const MOCK_ZK = true;

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

    if (MOCK_ZK) {
        // Mock: return fake proof data instantly. Use testMint on-chain, not mint().
        const publicInputBytes32 = ("0x" + score_band.toString(16).padStart(64, "0")) as `0x${string}`;
        const mockProof = new Uint8Array(32); // placeholder

        return {
            proof: mockProof,
            publicInputs: [score_band.toString()],
            proofHex: ("0x" + Array.from(mockProof).map((b) => b.toString(16).padStart(2, "0")).join("")) as `0x${string}`,
            publicInputsBytes32: [publicInputBytes32],
        };
    }

    // Real ZK path (disabled for now - Noir/bb.js integration issues)
    throw new Error("Real ZK proof generation is disabled. Use MOCK_ZK=true.");
}

export { computeExpectedBand };
