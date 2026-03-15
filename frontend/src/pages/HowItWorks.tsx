import { type FC } from "react";
import { Shield, Lock, Eye, Wallet, FileText, Users, ArrowRight } from "lucide-react";
import logo from "../assets/logo.png";
import { Link } from "react-router-dom";
import { theme } from "../theme";

const t = theme;

const STEPS = [
    { icon: Shield, title: "1. Connect & Mint", desc: "Connect your wallet, enter your ENS name, and mint a soulbound ReputationNFT. A ZK proof verifies your reputation band — no private data ever leaves your browser." },
    { icon: FileText, title: "2. Post or Apply", desc: "Posters create bounties with on-chain escrow. Applicants apply anonymously — the contract only emits a bounty ID and applicant number. No addresses, no ENS names until the poster reveals." },
    { icon: Eye, title: "3. Reveal & Accept", desc: "The poster reviews anonymous applicants and reveals identities one at a time. Once accepted, the private brief (encrypted via Fileverse ECIES) is shared with the winner only." },
    { icon: Lock, title: "4. Submit Encrypted Work", desc: "The winner submits their deliverable encrypted end-to-end. Only the poster's wallet can decrypt. The CID is stored on-chain for immutable proof of delivery." },
    { icon: Wallet, title: "5. Claim Payment Privately", desc: "Payment goes to a one-time wallet address generated in your browser. The contract enforces that this address is NOT linked to your ENS identity — true financial privacy." },
    { icon: Users, title: "6. Build Reputation", desc: "Each completion is recorded by the SkillRegistry. Reach 3 completions in a category for a verified skill badge. Upgrade your band with a new ZK proof when you qualify." },
];

const HowItWorks: FC = () => (
    <div className="min-h-screen text-white font-sans" style={{ background: t.color.background.primary }}>
        <nav className="border-b py-4 px-4 sm:px-6" style={{ borderColor: t.color.border.default }}>
            <div className="w-full max-w-6xl mx-auto flex items-center justify-between gap-4 flex-wrap">
                <Link to="/" className="flex items-center gap-2 no-underline">
                    <img src={logo} alt="DarkEarn" className="h-8 w-auto" />
                </Link>
                <div className="flex items-center gap-6">
                    <Link to="/" className="text-[12px] font-medium no-underline transition-colors hover:opacity-80" style={{ color: t.color.text.secondary }}>
                        Browse Bounties
                    </Link>
                    <Link to="/dashboard?tab=post-bounty" className="text-[12px] font-medium no-underline transition-colors hover:opacity-80" style={{ color: t.color.text.secondary }}>
                        Post Bounty
                    </Link>
                    <Link to="/" className="text-[12px] font-bold uppercase tracking-wider flex items-center gap-1 no-underline" style={{ color: t.color.accent }}>
                        Launch App <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>
            </div>
        </nav>

        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 py-12 md:py-16">
            <div className="text-center mb-16">
                <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
                    How <span style={{ color: t.color.accent }}>DarkEarn</span> Works
                </h1>
                <p className="max-w-2xl mx-auto" style={{ fontSize: t.font.size.subheading.md, color: t.color.text.secondary }}>
                    Anonymous bounties. Encrypted deliverables. Private payments. Zero-knowledge reputation.
                    Everything on-chain, nothing traceable.
                </p>
            </div>

            <div className="flex flex-col gap-8 mb-16">
                {STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                        <div key={step.title} className="rounded-xl border p-6 md:p-8 flex flex-col sm:flex-row gap-4 sm:gap-6" style={{ background: t.color.surface.card, borderColor: t.color.border.default }}>
                            <div className="w-14 h-14 rounded-lg flex items-center justify-center flex-shrink-0" style={{ background: t.color.accentSubtle, border: `1px solid ${t.color.accentMuted}` }}>
                                <Icon className="w-7 h-7" style={{ color: t.color.accent }} />
                            </div>
                            <div>
                                <h3 className="font-bold text-white mb-2" style={{ fontSize: t.font.size.subheading.lg }}>{step.title}</h3>
                                <p className="leading-relaxed" style={{ fontSize: t.font.size.text.md, color: t.color.text.secondary }}>{step.desc}</p>
                            </div>
                        </div>
                    );
                })}
            </div>

            <div className="rounded-xl border p-8 text-center" style={{ background: t.color.surface.card, borderColor: t.color.border.default }}>
                <h3 className="text-2xl font-bold text-white mb-3">Privacy Stack</h3>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4 mt-6">
                    {[
                        { label: "ZK Proofs", detail: "Noir + Barretenberg Honk" },
                        { label: "Encryption", detail: "Fileverse ECIES" },
                        { label: "Custody", detail: "BitGo MPC" },
                        { label: "Chain", detail: "Base Sepolia L2" },
                    ].map((item) => (
                        <div key={item.label} className="p-4 rounded-lg" style={{ background: t.color.background.primary, border: `1px solid ${t.color.border.default}` }}>
                            <p className="font-bold" style={{ fontSize: t.font.size.text.sm, color: t.color.accent }}>{item.label}</p>
                            <p className="mt-1" style={{ fontSize: t.font.size.caption.md, color: t.color.text.muted }}>{item.detail}</p>
                        </div>
                    ))}
                </div>
            </div>

            <p className="text-center mt-12 font-bold tracking-[0.2em] uppercase" style={{ fontSize: t.font.size.caption.sm, color: t.color.text.disabled }}>
                Built for ETHGlobal
            </p>
        </div>
    </div>
);

export default HowItWorks;
