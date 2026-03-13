import { type FC } from "react";
import { FileCode, Code, Shield, CheckCircle2, Globe } from "lucide-react";

const SKILL_BADGES = [
    { name: "Solidity", icon: FileCode },
    { name: "Cairo", icon: Code },
    { name: "Security", icon: Shield },
];

const ProfileTab: FC = () => {
    const score = 80;
    const band = 3;
    const bountiesCompleted = 16;
    const proofsCount = 20;

    return (
        <div className="max-w-2xl mx-auto">
            {/* Profile header */}
            <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-4">
                    <div
                        className="w-24 h-24 flex items-center justify-center rotate-45 rounded-lg"
                        style={{ background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)", border: "2px solid #333" }}
                    >
                        <span className="text-2xl font-extrabold text-white -rotate-45">{score}</span>
                    </div>
                    <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "#e8ff00", color: "#0a0a0a" }}
                    >
                        Band {band}
                    </span>
                </div>
                <h1 className="text-xl font-bold text-white tracking-widest" style={{ letterSpacing: "0.2em" }}>ALICE.ETH</h1>
                <p className="text-[12px] mt-1" style={{ color: "#888" }}>Member since March 2025</p>
                <p className="text-[11px] mt-2 font-medium uppercase tracking-wider" style={{ color: "#666" }}>Working reputation URL</p>
            </div>

            {/* Verification Status */}
            <div className="mb-8">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#888" }}>Verification Status</h3>
                <div className="px-4 py-3 rounded-lg" style={{ background: "#e8ff00" }}>
                    <p className="text-[14px] font-bold" style={{ color: "#0a0a0a" }}>{bountiesCompleted} Bounties Completed</p>
                </div>
            </div>

            {/* Verified Skill Badges */}
            <div className="mb-8">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2" style={{ color: "#888" }}>
                    <Globe className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    Verified Skill Badges
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    {SKILL_BADGES.map(({ name, icon: Icon }) => (
                        <div
                            key={name}
                            className="flex items-center gap-3 px-4 py-3 rounded-lg"
                            style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                        >
                            <div className="w-10 h-10 rounded flex items-center justify-center" style={{ background: "rgba(232,255,0,0.1)" }}>
                                <Icon className="w-5 h-5" style={{ color: "#e8ff00" }} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-[13px] font-semibold text-white">{name}</p>
                                <p className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1" style={{ color: "#22c55e" }}>
                                    <CheckCircle2 className="w-3 h-3" /> Verified
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Powered by */}
            <p className="text-[10px] font-medium uppercase tracking-widest text-center" style={{ color: "#555" }}>
                Powered by DarkEarn {proofsCount} Proofs
            </p>
        </div>
    );
};

export default ProfileTab;
