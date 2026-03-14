import { type FC } from "react";
import { Shield, Lock, Eye, Wallet, FileText, Users, ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";

const STEPS = [
    {
        icon: Shield,
        title: "1. Connect & Mint",
        desc: "Connect your wallet, enter your ENS name, and mint a soulbound ReputationNFT. A ZK proof verifies your reputation band — no private data ever leaves your browser.",
    },
    {
        icon: FileText,
        title: "2. Post or Apply",
        desc: "Posters create bounties with on-chain escrow. Applicants apply anonymously — the contract only emits a bounty ID and applicant number. No addresses, no ENS names until the poster reveals.",
    },
    {
        icon: Eye,
        title: "3. Reveal & Accept",
        desc: "The poster reviews anonymous applicants and reveals identities one at a time. Once accepted, the private brief (encrypted via Fileverse ECIES) is shared with the winner only.",
    },
    {
        icon: Lock,
        title: "4. Submit Encrypted Work",
        desc: "The winner submits their deliverable encrypted end-to-end. Only the poster's wallet can decrypt. The CID is stored on-chain for immutable proof of delivery.",
    },
    {
        icon: Wallet,
        title: "5. Claim Payment Privately",
        desc: "Payment goes to a one-time wallet address generated in your browser. The contract enforces that this address is NOT linked to your ENS identity — true financial privacy.",
    },
    {
        icon: Users,
        title: "6. Build Reputation",
        desc: "Each completion is recorded by the SkillRegistry. Reach 3 completions in a category for a verified skill badge. Upgrade your band with a new ZK proof when you qualify.",
    },
];

const HowItWorks: FC = () => (
    <div className="min-h-screen bg-[#060606] text-white font-sans">
        <nav className="border-b py-4 px-6" style={{ borderColor: "#1a1a1a" }}>
            <div className="max-w-4xl mx-auto flex items-center justify-between">
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                    <span className="font-bold tracking-widest text-[16px] uppercase text-white">DARKEARN</span>
                </Link>
                <Link
                    to="/"
                    className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-1 no-underline"
                    style={{ color: "#e8ff00" }}
                >
                    Launch App <ArrowRight className="w-3 h-3" />
                </Link>
            </div>
        </nav>

        <div className="max-w-4xl mx-auto px-6 py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    How <span style={{ color: "#e8ff00" }}>DarkEarn</span> Works
                </h1>
                <p className="text-[16px] max-w-2xl mx-auto" style={{ color: "#888" }}>
                    Anonymous bounties. Encrypted deliverables. Private payments. Zero-knowledge reputation.
                    Everything on-chain, nothing traceable.
                </p>
            </div>

            <div className="flex flex-col gap-8 mb-16">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                        <div
                            key={step.title}
                            className="rounded-xl border p-8 flex gap-6"
                            style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}
                        >
                            <div
                                className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0"
                                style={{ background: "rgba(232,255,0,0.08)", border: "1px solid rgba(232,255,0,0.15)" }}
                            >
                                <Icon className="w-7 h-7" style={{ color: "#e8ff00" }} />
                            </div>
                            <div>
                                <h3 className="text-[18px] font-bold text-white mb-2">{step.title}</h3>
                                <p className="text-[14px] leading-relaxed" style={{ color: "#888" }}>
                                    {step.desc}
                                </p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border p-8 text-center" style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                <h3 className="text-2xl font-bold text-white mb-3">Privacy Stack</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    {[
                        { label: "ZK Proofs", detail: "Noir + Barretenberg Honk" },
                        { label: "Encryption", detail: "Fileverse ECIES" },
                        { label: "Custody", detail: "BitGo MPC" },
                        { label: "Chain", detail: "Base Sepolia L2" },
                    ].map((item) => (
                        <div key={item.label} className="p-4 rounded-lg" style={{ background: "#060606", border: "1px solid #1a1a1a" }}>
                            <p className="text-[13px] font-bold" style={{ color: "#e8ff00" }}>
                                {item.label}
                            </p>
                            <p className="text-[11px] mt-1" style={{ color: "#555" }}>
                                {item.detail}
                            </p>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center mt-12 text-[10px] font-bold tracking-[0.2em] uppercase" style={{ color: "#333" }}>
                Built for ETHGlobal
            </p>
        </div>
    </div>
);

export default HowItWorks;
