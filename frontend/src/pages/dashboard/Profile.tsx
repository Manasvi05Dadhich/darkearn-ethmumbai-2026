import { type FC } from "react";
import { FileCode, Code, Shield, CheckCircle2, Globe, Loader2, Layout, Cpu, Paintbrush, FileText } from "lucide-react";
import { useAccount } from "wagmi";
import { useUserNFT } from "../../hooks/useUserNFT";
import { useSkills } from "../../hooks/useSkills";

const SKILL_ICONS: Record<string, FC<{ className?: string }>> = {
    Solidity: FileCode,
    Cairo: Cpu,
    Frontend: Layout,
    Security: Shield,
    Content: FileText,
    Design: Paintbrush,
};

const ProfileTab: FC = () => {
    const { address } = useAccount();
    const { ensName, band, memberSince, tokenId, isLoading } = useUserNFT();
    const { skills } = useSkills(address);

    if (isLoading) {
        return (
            <div className="max-w-2xl mx-auto text-center py-16">
                <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" style={{ color: "#e8ff00" }} />
                <p className="text-[13px]" style={{ color: "#888" }}>Loading profile from chain...</p>
            </div>
        );
    }

    const currentBand = band ?? 0;
    const displayName = ensName || (address ? `${address.slice(0, 6)}...${address.slice(-4)}` : "Not connected");
    const totalCompletions = skills.reduce((sum, s) => sum + s.completions, 0);
    const verifiedSkills = skills.filter((s) => s.verified);
    const memberDate = memberSince
        ? new Date(memberSince * 1000).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
          })
        : "—";

    return (
        <div className="max-w-2xl mx-auto">
            <div className="flex flex-col items-center text-center mb-8">
                <div className="relative mb-4">
                    <div
                        className="w-24 h-24 flex items-center justify-center rotate-45 rounded-lg"
                        style={{
                            background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                            border: "2px solid #333",
                        }}
                    >
                        <span className="text-2xl font-extrabold text-white -rotate-45">
                            {currentBand}
                        </span>
                    </div>
                    <span
                        className="absolute -bottom-1 left-1/2 -translate-x-1/2 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider"
                        style={{ background: "#e8ff00", color: "#0a0a0a" }}
                    >
                        Band {currentBand}
                    </span>
                </div>
                <h1
                    className="text-xl font-bold text-white tracking-widest"
                    style={{ letterSpacing: "0.2em" }}
                >
                    {displayName.toUpperCase()}
                </h1>
                <p className="text-[12px] mt-1" style={{ color: "#888" }}>
                    Member since {memberDate}
                </p>
                {tokenId !== null && (
                    <p className="text-[11px] mt-1" style={{ color: "#555" }}>
                        Token ID: {tokenId.toString()}
                    </p>
                )}
            </div>

            <div className="mb-8">
                <h3 className="text-[11px] font-bold tracking-[0.2em] uppercase mb-3" style={{ color: "#888" }}>
                    Verification Status
                </h3>
                <div className="px-4 py-3 rounded-lg" style={{ background: "#e8ff00" }}>
                    <p className="text-[14px] font-bold" style={{ color: "#0a0a0a" }}>
                        {totalCompletions} Bounties Completed
                    </p>
                </div>
            </div>

            <div className="mb-8">
                <h3
                    className="text-[11px] font-bold tracking-[0.2em] uppercase mb-4 flex items-center gap-2"
                    style={{ color: "#888" }}
                >
                    <Globe className="w-4 h-4" style={{ color: "#e8ff00" }} />
                    Verified Skill Badges
                </h3>
                {verifiedSkills.length === 0 ? (
                    <p className="text-[13px]" style={{ color: "#555" }}>
                        No verified skills yet. Complete 3 bounties in a category to earn a badge.
                    </p>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {verifiedSkills.map(({ category }) => {
                            const Icon = SKILL_ICONS[category] || Code;
                            return (
                                <div
                                    key={category}
                                    className="flex items-center gap-3 px-4 py-3 rounded-lg"
                                    style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                                >
                                    <div
                                        className="w-10 h-10 rounded flex items-center justify-center"
                                        style={{ background: "rgba(232,255,0,0.1)" }}
                                    >
                                        <Icon className="w-5 h-5 text-[#e8ff00]" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[13px] font-semibold text-white">{category}</p>
                                        <p
                                            className="text-[10px] font-bold uppercase tracking-wider flex items-center gap-1"
                                            style={{ color: "#22c55e" }}
                                        >
                                            <CheckCircle2 className="w-3 h-3" /> Verified
                                        </p>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            <p
                className="text-[10px] font-medium uppercase tracking-widest text-center"
                style={{ color: "#555" }}
            >
                Powered by DarkEarn ZK Proofs
            </p>
        </div>
    );
};

export default ProfileTab;
