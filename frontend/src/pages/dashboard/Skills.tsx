import type { FC } from "react";
import { CheckCircle2, Code, Shield as ShieldIcon, Paintbrush, FileText, Cpu, Layout } from "lucide-react";

const SKILLS = [
    { name: "Solidity", icon: <Code className="w-6 h-6" />, completions: 5, verified: true, color: "#627eea" },
    { name: "Cairo", icon: <Cpu className="w-6 h-6" />, completions: 1, verified: false, color: "#06b6d4" },
    { name: "Frontend", icon: <Layout className="w-6 h-6" />, completions: 3, verified: true, color: "#22c55e" },
    { name: "Security", icon: <ShieldIcon className="w-6 h-6" />, completions: 2, verified: false, color: "#f97316" },
    { name: "Content", icon: <FileText className="w-6 h-6" />, completions: 0, verified: false, color: "#a78bfa" },
    { name: "Design", icon: <Paintbrush className="w-6 h-6" />, completions: 0, verified: false, color: "#f472b6" },
];

const SkillsTab: FC = () => (
    <div className="max-w-4xl">
        <div className="p-4 rounded-lg border mb-6" style={{ background: "rgba(232,255,0,0.03)", borderColor: "rgba(232,255,0,0.1)" }}>
            <p className="text-[12px] font-medium" style={{ color: "#999" }}>Skill badges are earned automatically. Complete 3 bounties in any category and the badge appears. No manual steps.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {SKILLS.map(s => (
                <div key={s.name} className="p-6 rounded-xl border transition-colors" style={{ background: "#0a0a0a", borderColor: s.verified ? `${s.color}30` : "#1a1a1a" }}>
                    <div className="mb-4" style={{ color: s.color }}>{s.icon}</div>
                    <h3 className="text-[15px] font-bold text-white mb-2">{s.name}</h3>
                    {s.verified ? (
                        <div className="flex items-center gap-1.5 mb-2"><CheckCircle2 className="w-4 h-4" style={{ color: "#22c55e" }} /><span className="text-[12px] font-bold" style={{ color: "#22c55e" }}>Verified ✓</span></div>
                    ) : (
                        <p className="text-[12px] mb-2" style={{ color: "#555" }}>Not yet verified</p>
                    )}
                    <p className="text-[11px]" style={{ color: "#777" }}>{s.completions} {s.name} completions on DarkEarn</p>
                </div>
            ))}
        </div>
    </div>
);

export default SkillsTab;
