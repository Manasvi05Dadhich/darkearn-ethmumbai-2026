import { useReadContract } from "wagmi";
import { CONTRACTS } from "../contracts";

const CATEGORIES = ["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"] as const;

export function useSkills(address?: `0x${string}`) {
    const results = CATEGORIES.map((category) => {

        return useReadContract({
            ...CONTRACTS.SkillRegistry,
            functionName: "getCompletionsInCategory",
            args: address ? [address, category] : undefined,
            query: { enabled: !!address },
        });
    });

    const skills = CATEGORIES.map((category, i) => ({
        category,
        completions: results[i].data !== undefined ? Number(results[i].data) : 0,
    }));

    const isLoading = results.some((r) => r.isLoading);

    return { skills, isLoading };
}
