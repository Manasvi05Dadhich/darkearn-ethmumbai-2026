import type { FC } from "react";
import { CheckCircle2, Code, Shield as ShieldIcon, Paintbrush, FileText, Cpu, Layout, Loader2 } from "lucide-react";
import { useAccount } from "wagmi";
import { useSkills } from "../../hooks/useSkills";

const SKILL_ICONS: Record<string, React.ReactNode> = {
    Solidity: <Code className="w-6 h-6" />,
    Cairo: <Cpu className="w-6 h-6" />,
    Frontend: <Layout className="w-6 h-6" />,
    Security: <ShieldIcon className="w-6 h-6" />,
    Content: <FileText className="w-6 h-6" />,
    Design: <Paintbrush className="w-6 h-6" />,
};

const SKILL_COLORS: Record<string, string> = {
    Solidity: "#627eea",
    Cairo: "#06b6d4",
    Frontend: "#22c55e",
    Security: "#f97316",
    Content: "#a78bfa",
    Design: "#f472b6",
};

const SkillsTab: FC = () => {
    const { address } = useAccount();
    const { skills, isLoading } = useSkills(address);

    if (isLoading) {
        return (
            <div className="max-w-4xl text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading skills from SkillRegistry...</p>
            </div>
        );
    }

    return (
        <div className="max-w-4xl">
            <div
                className="p-4 rounded-lg border mb-6"
                style={{ background: "rgba(232,255,0,0.03)", borderColor: "rgba(232,255,0,0.1)" }}
            >
                <p className="text-[12px] font-medium" style={{ color: "#999" }}>
                    Skill badges are earned automatically. Complete 3 bounties in any category and the badge appears.
                    No manual steps.
                </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {skills.map((s) => {
                    const color = SKILL_COLORS[s.category] || "#888";
                    return (
                        <div
                            key={s.category}
                            className="p-6 rounded-xl border transition-colors"
                            style={{
                                background: "#0a0a0a",
                                borderColor: s.verified ? `${color}30` : "#1a1a1a",
                            }}
                        >
                            <div className="mb-4" style={{ color }}>
                                {SKILL_ICONS[s.category]}
                            </div>
                            <h3 className="text-[15px] font-bold text-white mb-2">{s.category}</h3>
                            {s.verified ? (
                                <div className="flex items-center gap-1.5 mb-2">
                                    <CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} />
                                    <span className="text-[12px] font-bold" style={{ color: "#22c55e" }}>
                                        Verified ✓
                                    </span>
                                </div>
                            ) : (
                                <p className="text-[12px] mb-2" style={{ color: "#555" }}>
                                    Not yet verified
                                </p>
                            )}
                            <p className="text-[11px]" style={{ color: "#777" }}>
                                {s.completions} {s.category} completions on DarkEarn
                            </p>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SkillsTab;
