import { type FC } from "react";
import { useParams } from "react-router-dom";
import { useReadContract, useReadContracts } from "wagmi";
import { CONTRACTS } from "../contracts";
import { Shield, CheckCircle2, Loader2, Code, Cpu, Layout, FileText, Paintbrush } from "lucide-react";

const SKILL_NAMES = ["Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];
const SKILL_ICONS: Record<string, FC<{ className?: string; style?: React.CSSProperties }>> = {
    Solidity: Code,
    Cairo: Cpu,
    Frontend: Layout,
    Security: Shield,
    Content: FileText,
    Design: Paintbrush,
};

const PublicProfile: FC = () => {
    const { ensName } = useParams<{ ensName: string }>();

    const { data: tokenId, isLoading: tokenLoading } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "ensToTokenId",
        args: ensName ? [ensName] : undefined,
        query: { enabled: !!ensName },
    });

    const tid = tokenId ? (tokenId as bigint) : null;
    const exists = tid !== null && tid > 0n;

    const { data: band } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToBand",
        args: tid ? [tid] : undefined,
        query: { enabled: exists },
    });

    const { data: memberSince } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToMemberSince",
        args: tid ? [tid] : undefined,
        query: { enabled: exists },
    });

    const { data: minter } = useReadContract({
        ...CONTRACTS.ReputationNFT,
        functionName: "tokenIdToMinter",
        args: tid ? [tid] : undefined,
        query: { enabled: exists },
    });

    const { data: skillResults } = useReadContracts({
        contracts: SKILL_NAMES.map((_, i) => ({
            ...CONTRACTS.SkillRegistry,
            functionName: "getCompletionsInCategory" as const,
            args: minter ? [minter as `0x${string}`, BigInt(i)] : undefined,
        })),
        query: { enabled: !!minter },
    });

    const skills = SKILL_NAMES.map((name, i) => {
        const completions = skillResults?.[i]?.result !== undefined ? Number(skillResults[i].result as bigint) : 0;
        return { name, completions, verified: completions >= 3 };
    });

    const totalCompletions = skills.reduce((sum, s) => sum + s.completions, 0);
    const verifiedSkills = skills.filter((s) => s.verified);
    const currentBand = band !== undefined ? Number(band as bigint) : 0;
    const memberDate = memberSince
        ? new Date(Number(memberSince as bigint) * 1000).toLocaleDateString("en-US", {
              month: "long",
              year: "numeric",
          })
        : "—";

    if (tokenLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#060606]">
                <Loader2 className="w-8 h-8 animate-spin" style={{ color: "#e8ff00" }} />
            </div>
        );
    }

    if (!exists) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#060606] text-white">
                <Shield className="w-16 h-16 mb-4" style={{ color: "#333" }} />
                <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
                <p className="text-[14px]" style={{ color: "#888" }}>
                    {ensName} has not registered on DarkEarn.
                </p>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-[#060606] text-white font-sans">
            <nav className="border-b py-4 px-6" style={{ borderColor: "#1a1a1a" }}>
                <div className="max-w-3xl mx-auto flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                        <span className="font-bold tracking-widest text-[16px] uppercase">DARKEARN</span>
                    </div>
                    <span className="text-[12px]" style={{ color: "#555" }}>
                        Public Profile
                    </span>
                </div>
            </nav>

            <div className="max-w-3xl mx-auto px-6 py-12">
                <div className="flex flex-col items-center text-center mb-12">
                    <div className="relative mb-6">
                        <div
                            className="w-28 h-28 flex items-center justify-center rotate-45 rounded-xl"
                            style={{
                                background: "linear-gradient(135deg, #1a1a1a 0%, #0a0a0a 100%)",
                                border: "2px solid #333",
                            }}
                        >
                            <span className="text-3xl font-extrabold text-white -rotate-45">{currentBand}</span>
                        </div>
                        <span
                            className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-3 py-1 text-[11px] font-bold uppercase tracking-wider rounded"
                            style={{ background: "#e8ff00", color: "#0a0a0a" }}
                        >
                            Band {currentBand}
                        </span>
                    </div>
                    <h1
                        className="text-3xl font-extrabold tracking-widest mb-2"
                        style={{ letterSpacing: "0.15em" }}
                    >
                        {ensName}
                    </h1>
                    <p className="text-[13px]" style={{ color: "#888" }}>
                        Member since {memberDate}
                    </p>
                    <p className="text-[14px] font-semibold mt-2 text-white">
                        {totalCompletions} completions
                    </p>
                </div>

                {verifiedSkills.length > 0 && (
                    <div className="mb-12">
                        <h3
                            className="text-[12px] font-bold tracking-[0.2em] uppercase mb-4 text-center"
                            style={{ color: "#888" }}
                        >
                            Verified Skills
                        </h3>
                        <div className="flex flex-wrap gap-3 justify-center">
                            {verifiedSkills.map((s) => {
                                const Icon = SKILL_ICONS[s.name] || Code;
                                return (
                                    <div
                                        key={s.name}
                                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg"
                                        style={{ background: "#0a0a0a", border: "1px solid #1a1a1a" }}
                                    >
                                        <Icon className="w-4 h-4" style={{ color: "#e8ff00" }} />
                                        <span className="text-[13px] font-semibold text-white">{s.name}</span>
                                        <CheckCircle2 className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                <div
                    className="rounded-xl border p-8 text-center"
                    style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                >
                    <Shield className="w-8 h-8 mx-auto mb-3" style={{ color: "#e8ff00" }} />
                    <h3 className="text-[14px] font-bold text-white mb-2">Privacy Protected</h3>
                    <p className="text-[12px] max-w-md mx-auto" style={{ color: "#555" }}>
                        No wallet address. No earnings. No bounty history. No application history. No transaction
                        links. Only the ENS name, band, completions, and verified skills are visible. This is DarkEarn.
                    </p>
                </div>

                <p className="text-center mt-8 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#333" }}>
                    Powered by DarkEarn ZK Reputation
                </p>
            </div>
        </div>
    );
};

export default PublicProfile;
