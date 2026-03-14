import { useReadContracts } from "wagmi";
import { CONTRACTS } from "../contracts";

export const SKILL_CATEGORIES = [
    "Solidity",
    "Cairo",
    "Frontend",
    "Security",
    "Content",
    "Design",
] as const;

export function useSkills(address?: `0x${string}`) {
    const results = useReadContracts({
        contracts: SKILL_CATEGORIES.map((_, i) => ({
            ...CONTRACTS.SkillRegistry,
            functionName: "getCompletionsInCategory" as const,
            args: address ? [address, BigInt(i)] : undefined,
        })),
        query: { enabled: !!address },
    });

    const skills = SKILL_CATEGORIES.map((category, i) => {
        const raw = results.data?.[i]?.result;
        const completions = raw !== undefined ? Number(raw as bigint) : 0;
        return {
            category,
            categoryId: i,
            completions,
            verified: completions >= 3,
        };
    });

    return { skills, isLoading: results.isLoading };
}
