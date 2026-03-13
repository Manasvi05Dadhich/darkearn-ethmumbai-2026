import { useState, useEffect, useRef, type FC, type MouseEvent } from "react";
import {
    Shield, Search, ChevronDown, Clock, Users, ShieldCheck,
    X, Lock, Loader2, CheckCircle2, ExternalLink, ArrowRight
} from "lucide-react";

// ── Types ──────────────────────────────────────────────────────
interface Bounty {
    id: number;
    title: string;
    description: string;
    fullDescription: string;
    prize: string;
    prizeNum: number;
    currency: string;
    category: string;
    categoryColor: string;
    posterEns: string;
    posterAvatar: string;
    deadline: string;
    deadlineDate: string;
    applicants: number;
    hasPrivateBrief: boolean;
    status: "open" | "closed";
}

type Category = "All" | "Solidity" | "Cairo" | "Frontend" | "Security" | "Content" | "Design";
type SortOption = "newest" | "highest" | "deadline";
type StatusFilter = "open" | "all";

// ── Mock Data ──────────────────────────────────────────────────
const BOUNTIES: Bounty[] = [
    {
        id: 1,
        title: "Build a ZK identity verification module for ENS",
        description: "We need a Solidity-based module that integrates with ENS to provide zero-knowledge identity verification. Must use Semaphore or similar ZK framework.",
        fullDescription: `We're looking for an experienced Solidity developer to build a zero-knowledge identity verification module that integrates seamlessly with ENS (Ethereum Name Service).

**Requirements:**
- Build a Solidity smart contract that verifies ENS ownership without revealing the owner's address
- Integrate with Semaphore or a comparable ZK framework for proof generation
- Create a verification circuit that proves ENS ownership
- Write comprehensive test coverage (minimum 90%)
- Gas-optimized deployment on Ethereum mainnet

**Deliverables:**
1. Smart contract source code with full NatSpec documentation
2. ZK circuit implementation
3. Test suite with >90% coverage
4. Deployment scripts for mainnet/testnet
5. Technical documentation

**Timeline:** 2 weeks from acceptance

The contract will be audited by a third-party security firm before deployment. You will be expected to address any findings from the audit.`,
        prize: "$2,400",
        prizeNum: 2400,
        currency: "USDC",
        category: "Solidity",
        categoryColor: "#627eea",
        posterEns: "vitalik.eth",
        posterAvatar: "V",
        deadline: "12d left",
        deadlineDate: "March 22, 2026 at 23:59 UTC",
        applicants: 7,
        hasPrivateBrief: true,
        status: "open"
    },
    {
        id: 2,
        title: "Design privacy-first dashboard UI for DeFi protocol",
        description: "Create a stunning, modern dashboard that prioritizes user privacy. Dark theme, data visualization, and responsive design required.",
        fullDescription: `We need a world-class UI/UX designer to create a privacy-first dashboard for our DeFi protocol.

**Scope:**
- Design a comprehensive dashboard with portfolio overview, transaction history, and yield tracking
- All financial data should have toggle-able privacy modes (blur/hide amounts)
- Dark theme with accent colors (our brand color is #e8ff00)
- Responsive design for desktop, tablet, and mobile
- Interactive data visualizations (charts, graphs)

**Deliverables:**
1. Figma file with all screens and components
2. Design system with tokens, spacing, typography
3. Interactive prototype
4. Developer handoff documentation
5. Asset exports (SVG/PNG)

We want this to feel like the most premium DeFi dashboard ever built. Think Bloomberg Terminal meets modern Web3.`,
        prize: "$1,800",
        prizeNum: 1800,
        currency: "USDC",
        category: "Design",
        categoryColor: "#f472b6",
        posterEns: "anon42.eth",
        posterAvatar: "A",
        deadline: "5d left",
        deadlineDate: "March 15, 2026 at 23:59 UTC",
        applicants: 14,
        hasPrivateBrief: false,
        status: "open"
    },
    {
        id: 3,
        title: "Audit Solidity escrow contract — critical scope",
        description: "Security audit of our escrow smart contract handling up to $1M in value. Previous audit experience required. Must follow OWASP guidelines.",
        fullDescription: `We require a thorough security audit of our Solidity escrow contract that handles significant value transfers.

**Contract Details:**
- ~800 lines of Solidity code
- Handles USDC, USDT, and ETH escrow
- Multi-party dispute resolution mechanism
- Time-locked releases with emergency provisions

**Audit Requirements:**
- Full line-by-line code review
- Automated analysis (Slither, Mythril, Echidna)
- Manual testing of edge cases
- Gas optimization recommendations
- Formal verification of critical paths

**Deliverables:**
1. Comprehensive audit report (PDF)
2. Severity classification of all findings (Critical/High/Medium/Low/Informational)
3. Remediation recommendations
4. Re-audit of fixed issues (1 round)

Previous audit experience with escrow/payment contracts is mandatory. Please include links to past audit reports in your application.`,
        prize: "$5,000",
        prizeNum: 5000,
        currency: "USDC",
        category: "Security",
        categoryColor: "#f97316",
        posterEns: "shadowed.eth",
        posterAvatar: "S",
        deadline: "3d left",
        deadlineDate: "March 13, 2026 at 23:59 UTC",
        applicants: 3,
        hasPrivateBrief: true,
        status: "open"
    },
    {
        id: 4,
        title: "Write technical docs for cross-chain bridge SDK",
        description: "Comprehensive developer documentation for our bridge SDK. Must include quickstart guides, API reference, and code examples in JS/TS.",
        fullDescription: `Create comprehensive technical documentation for our cross-chain bridge SDK.

**Scope:**
- Getting Started / Quickstart guide
- Full API reference documentation
- Code examples in JavaScript and TypeScript
- Architecture overview with diagrams
- Troubleshooting guide
- Migration guide from v1 to v2

**Requirements:**
- Experience writing developer documentation
- Understanding of cross-chain bridges and messaging protocols
- Familiarity with JavaScript/TypeScript
- Ability to write clear, concise technical prose

**Deliverables:**
1. Markdown documentation files (compatible with Docusaurus)
2. Code examples (tested and working)
3. Architecture diagrams (Mermaid or similar)
4. Changelog documentation`,
        prize: "$900",
        prizeNum: 900,
        currency: "USDC",
        category: "Content",
        categoryColor: "#a78bfa",
        posterEns: "0xwriter.eth",
        posterAvatar: "0",
        deadline: "20d left",
        deadlineDate: "March 30, 2026 at 23:59 UTC",
        applicants: 9,
        hasPrivateBrief: false,
        status: "open"
    },
    {
        id: 5,
        title: "Develop Cairo smart contract for StarkNet DEX",
        description: "Build an AMM-style DEX contract in Cairo for StarkNet. Must support multi-token swaps, liquidity pools, and fee distribution.",
        fullDescription: `We're building a decentralized exchange on StarkNet and need an experienced Cairo developer to write the core smart contracts.

**Requirements:**
- AMM (Automated Market Maker) implementation in Cairo
- Multi-token swap support
- Liquidity pool management (add/remove liquidity)
- Fee distribution mechanism
- Admin controls with timelock

**Technical Specs:**
- Cairo 1.0+ syntax
- Compatible with StarkNet mainnet
- Gas-optimized for StarkNet's fee model
- Full test coverage using Protostar or similar framework

**Deliverables:**
1. Cairo smart contract source code
2. Test suite
3. Deployment scripts
4. Technical documentation
5. Integration guide for frontend developers`,
        prize: "$3,200",
        prizeNum: 3200,
        currency: "USDC",
        category: "Cairo",
        categoryColor: "#06b6d4",
        posterEns: "stark.eth",
        posterAvatar: "⚡",
        deadline: "8d left",
        deadlineDate: "March 18, 2026 at 23:59 UTC",
        applicants: 5,
        hasPrivateBrief: true,
        status: "open"
    },
    {
        id: 6,
        title: "Frontend integration for on-chain reputation NFT",
        description: "Build React components for minting, displaying, and verifying on-chain reputation NFTs. Must integrate with wagmi and RainbowKit.",
        fullDescription: `We need a React frontend developer to build the user interface for our on-chain reputation NFT system.

**Components Needed:**
- NFT minting flow with MetaMask integration
- Reputation badge display component
- Verification widget (can be embedded on external sites)
- Profile page showing reputation history
- Leaderboard component

**Tech Stack:**
- React 18+ with TypeScript
- wagmi v2 for wallet interactions
- RainbowKit for wallet connection UI
- Vite for bundling
- TailwindCSS for styling

**Deliverables:**
1. React component library (published to npm)
2. Storybook documentation
3. Integration examples
4. Unit and integration tests`,
        prize: "$1,200",
        prizeNum: 1200,
        currency: "USDC",
        category: "Frontend",
        categoryColor: "#22c55e",
        posterEns: "builder.eth",
        posterAvatar: "B",
        deadline: "15d left",
        deadlineDate: "March 25, 2026 at 23:59 UTC",
        applicants: 11,
        hasPrivateBrief: false,
        status: "open"
    },
    {
        id: 7,
        title: "Smart contract for privacy-preserving voting system",
        description: "Design and implement a Solidity-based voting system using ZK proofs. Voters must remain anonymous while votes are verifiable.",
        fullDescription: `Build a privacy-preserving voting system smart contract using zero-knowledge proofs.

**Requirements:**
- Anonymous voting using ZK-SNARKs
- Verifiable vote tallying
- Support for multiple proposal types
- Delegation mechanism
- Time-bounded voting periods

This is a research-grade implementation. Academic rigor is expected.`,
        prize: "$4,500",
        prizeNum: 4500,
        currency: "USDC",
        category: "Solidity",
        categoryColor: "#627eea",
        posterEns: "dao-lead.eth",
        posterAvatar: "D",
        deadline: "10d left",
        deadlineDate: "March 20, 2026 at 23:59 UTC",
        applicants: 6,
        hasPrivateBrief: true,
        status: "open"
    },
    {
        id: 8,
        title: "Create brand identity and marketing assets for DeFi launch",
        description: "Full brand identity package including logo, color palette, typography, social media templates, and pitch deck design for protocol launch.",
        fullDescription: `We're launching a new DeFi protocol and need a complete brand identity package.

**Deliverables:**
- Logo (primary, secondary, icon versions)
- Color palette and typography guidelines
- Social media templates (Twitter, Discord banners)
- Pitch deck template (20 slides)
- Brand guidelines document
- Marketing one-pager

The aesthetic should convey trust, innovation, and privacy. Dark themes preferred.`,
        prize: "$2,000",
        prizeNum: 2000,
        currency: "USDC",
        category: "Design",
        categoryColor: "#f472b6",
        posterEns: "protocol.eth",
        posterAvatar: "P",
        deadline: "18d left",
        deadlineDate: "March 28, 2026 at 23:59 UTC",
        applicants: 19,
        hasPrivateBrief: false,
        status: "open"
    },
];

const CATEGORIES: Category[] = ["All", "Solidity", "Cairo", "Frontend", "Security", "Content", "Design"];

const CATEGORY_COLORS: Record<string, string> = {
    Solidity: "#627eea",
    Cairo: "#06b6d4",
    Frontend: "#22c55e",
    Security: "#f97316",
    Content: "#a78bfa",
    Design: "#f472b6",
};

// ── BountyBoardNavbar ──────────────────────────────────────────
const BountyBoardNavbar: FC<{
    onNavigate: (page: string) => void;
    userEns?: string;
    userBand?: number;
}> = ({ onNavigate, userEns = "alice.eth", userBand = 0 }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 border-b bg-[#060606]/95 backdrop-blur-md" style={{ borderColor: "#1a1a1a" }}>
            <div className="w-full max-w-[1400px] mx-auto px-6 md:px-10 flex items-center justify-between" style={{ height: 64 }}>
                {/* Left - Logo */}
                <button
                    onClick={() => onNavigate("home")}
                    className="flex items-center gap-2 cursor-pointer bg-transparent border-none"
                    style={{ fontFamily: "inherit" }}
                >
                    <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
                    <span className="font-bold text-white tracking-widest text-[14px] uppercase">DARKEARN</span>
                </button>

                {/* Center - Nav Links */}
                <div className="hidden md:flex items-center gap-8">
                    {[
                        { label: "Browse", id: "bounties", active: true },
                        { label: "Post Bounty", id: "post" },
                        { label: "How It Works", id: "how" },
                    ].map((link) => (
                        <button
                            key={link.id}
                            onClick={() => onNavigate(link.id)}
                            className="bg-transparent border-none cursor-pointer font-medium text-[13px] tracking-wide transition-colors"
                            style={{ color: link.active ? "#fff" : "#777", fontFamily: "inherit" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = "#e8ff00"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = link.active ? "#fff" : "#777"; }}
                        >
                            {link.label}
                        </button>
                    ))}
                </div>

                {/* Right - User Profile */}
                <div className="relative" ref={dropdownRef}>
                    <button
                        onClick={() => setDropdownOpen(!dropdownOpen)}
                        className="flex items-center gap-3 bg-transparent border rounded-full px-3 py-1.5 cursor-pointer transition-colors"
                        style={{ borderColor: dropdownOpen ? "rgba(232,255,0,0.3)" : "#222", fontFamily: "inherit" }}
                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!dropdownOpen) e.currentTarget.style.borderColor = "#333"; }}
                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!dropdownOpen) e.currentTarget.style.borderColor = "#222"; }}
                    >
                        {/* Avatar */}
                        <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                            style={{ background: "rgba(232,255,0,0.15)", color: "#e8ff00" }}>
                            {userEns.charAt(0).toUpperCase()}
                        </div>
                        {/* ENS + Band */}
                        <div className="hidden sm:flex items-center gap-2">
                            <span className="text-white text-[13px] font-medium">{userEns}</span>
                            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded"
                                style={{ background: "rgba(232,255,0,0.1)", color: "#e8ff00" }}>
                                B{userBand}
                            </span>
                        </div>
                        <ChevronDown className="w-3.5 h-3.5" style={{ color: "#666", transform: dropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                    </button>

                    {/* Dropdown */}
                    {dropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 rounded-lg border overflow-hidden shadow-2xl"
                            style={{ background: "#0c0c0c", borderColor: "#1a1a1a", animation: "fadeIn 0.15s ease" }}>
                            {[
                                { label: "Dashboard", id: "dashboard" },
                                { label: "Profile", id: "profile" },
                                { label: "Settings", id: "settings" },
                            ].map((item) => (
                                <button
                                    key={item.id}
                                    onClick={() => { onNavigate(item.id); setDropdownOpen(false); }}
                                    className="w-full text-left px-4 py-3 text-[13px] font-medium bg-transparent border-none cursor-pointer transition-colors"
                                    style={{ color: "#ccc", fontFamily: "inherit", borderBottom: "1px solid #141414" }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#111"; e.currentTarget.style.color = "#fff"; }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#ccc"; }}
                                >
                                    {item.label}
                                </button>
                            ))}
                            <button
                                onClick={() => { onNavigate("disconnect"); setDropdownOpen(false); }}
                                className="w-full text-left px-4 py-3 text-[13px] font-medium bg-transparent border-none cursor-pointer transition-colors"
                                style={{ color: "#ef4444", fontFamily: "inherit" }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "rgba(239,68,68,0.05)"; }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; }}
                            >
                                Disconnect
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    );
};

// ── BountyCard ─────────────────────────────────────────────────
const BountyCard: FC<{ bounty: Bounty; onClick: () => void }> = ({ bounty, onClick }) => (
    <button
        onClick={onClick}
        className="w-full text-left p-6 rounded-xl border transition-all cursor-pointer group"
        style={{
            background: "#0a0a0a",
            borderColor: "#1a1a1a",
            fontFamily: "inherit",
        }}
        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.borderColor = "rgba(232,255,0,0.2)";
            e.currentTarget.style.background = "#0d0d0d";
            e.currentTarget.style.transform = "translateY(-2px)";
            e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.4)";
        }}
        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => {
            e.currentTarget.style.borderColor = "#1a1a1a";
            e.currentTarget.style.background = "#0a0a0a";
            e.currentTarget.style.transform = "translateY(0)";
            e.currentTarget.style.boxShadow = "none";
        }}
    >
        {/* Top Row: Poster + Prize */}
        <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold"
                    style={{ background: "#151515", color: "#888", border: "1px solid #222" }}>
                    {bounty.posterAvatar}
                </div>
                <span className="text-[12px] font-medium" style={{ color: "#777" }}>{bounty.posterEns}</span>
            </div>
            <span className="font-bold text-[16px] tracking-tight" style={{ color: "#e8ff00" }}>
                {bounty.prize} <span className="text-[11px] font-semibold" style={{ color: "#888" }}>{bounty.currency}</span>
            </span>
        </div>

        {/* Title */}
        <h3 className="font-bold text-[15px] text-white mb-3 leading-snug">{bounty.title}</h3>

        {/* Category Tag */}
        <div className="mb-3">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full"
                style={{ background: `${bounty.categoryColor}15`, color: bounty.categoryColor }}>
                {bounty.category}
            </span>
        </div>

        {/* Description (2 lines) */}
        <p className="text-[13px] leading-relaxed mb-5 line-clamp-2" style={{ color: "#777" }}>
            {bounty.description}
        </p>

        {/* Bottom Row */}
        <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5" style={{ color: "#555" }} />
                <span className="text-[11px] font-medium" style={{ color: "#555" }}>{bounty.deadline}</span>
            </div>
            <div className="flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" style={{ color: "#555" }} />
                <span className="text-[11px] font-medium" style={{ color: "#555" }}>{bounty.applicants} applied</span>
            </div>
            <div className="flex items-center gap-1.5 ml-auto">
                <ShieldCheck className="w-3.5 h-3.5" style={{ color: "#22c55e" }} />
                <span className="text-[11px] font-bold" style={{ color: "#22c55e" }}>Funds Verified</span>
            </div>
        </div>
    </button>
);

// ── BountyDetailPanel ──────────────────────────────────────────
const BountyDetailPanel: FC<{
    bounty: Bounty | null;
    isOpen: boolean;
    onClose: () => void;
}> = ({ bounty, isOpen, onClose }) => {
    const [applyState, setApplyState] = useState<"idle" | "spinning" | "metamask" | "success">("idle");
    const panelRef = useRef<HTMLDivElement>(null);

    // Reset state when bounty changes
    useEffect(() => {
        setApplyState("idle");
    }, [bounty?.id]);

    const handleApply = () => {
        setApplyState("spinning");
        setTimeout(() => {
            setApplyState("metamask");
            setTimeout(() => {
                setApplyState("success");
            }, 1500);
        }, 2000);
    };

    if (!bounty) return null;

    return (
        <>
            {/* Backdrop */}
            <div
                className={`fixed inset-0 z-[60] transition-opacity duration-300 ${isOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"}`}
                style={{ background: "rgba(0,0,0,0.65)", backdropFilter: "blur(2px)" }}
                onClick={onClose}
            />

            {/* Panel */}
            <div
                ref={panelRef}
                className={`fixed top-0 right-0 bottom-0 z-[70] w-full max-w-[600px] flex flex-col transition-transform duration-300 ease-out ${isOpen ? "translate-x-0" : "translate-x-full"}`}
                style={{ background: "#0a0a0a", borderLeft: "1px solid #1a1a1a" }}
            >
                {/* Scrollable Content */}
                <div className="flex-1 overflow-y-auto">
                    {/* Header */}
                    <div className="sticky top-0 z-10 flex items-center justify-between p-5 border-b"
                        style={{ background: "#0a0a0a", borderColor: "#1a1a1a" }}>
                        <h2 className="text-[13px] font-bold tracking-widest uppercase" style={{ color: "#888" }}>Bounty Details</h2>
                        <button
                            onClick={onClose}
                            className="w-8 h-8 flex items-center justify-center rounded-lg border cursor-pointer transition-colors bg-transparent"
                            style={{ borderColor: "#222" }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#444"; e.currentTarget.style.background = "#111"; }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#222"; e.currentTarget.style.background = "transparent"; }}
                        >
                            <X className="w-4 h-4" style={{ color: "#888" }} />
                        </button>
                    </div>

                    <div className="p-6 md:p-8">
                        {/* Poster Info */}
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-10 h-10 rounded-full flex items-center justify-center text-[14px] font-bold"
                                style={{ background: "#151515", color: "#888", border: "1px solid #222" }}>
                                {bounty.posterAvatar}
                            </div>
                            <div>
                                <span className="text-[14px] font-semibold text-white">{bounty.posterEns}</span>
                                <p className="text-[11px] mt-0.5" style={{ color: "#555" }}>Bounty Poster</p>
                            </div>
                        </div>

                        {/* Title */}
                        <h1 className="text-2xl md:text-[28px] font-extrabold text-white mb-4 leading-tight">{bounty.title}</h1>

                        {/* Prize + Category Row */}
                        <div className="flex items-center gap-4 mb-6 flex-wrap">
                            <span className="font-bold text-[20px]" style={{ color: "#e8ff00" }}>
                                {bounty.prize} <span className="text-[13px] font-semibold" style={{ color: "#888" }}>{bounty.currency}</span>
                            </span>
                            <span className="text-[11px] font-bold uppercase tracking-wider px-3 py-1 rounded-full"
                                style={{ background: `${bounty.categoryColor}15`, color: bounty.categoryColor }}>
                                {bounty.category}
                            </span>
                        </div>

                        {/* Stats Row */}
                        <div className="flex items-center gap-6 mb-8 pb-6 border-b flex-wrap" style={{ borderColor: "#1a1a1a" }}>
                            <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4" style={{ color: "#888" }} />
                                <div>
                                    <p className="text-[12px] font-semibold text-white">{bounty.deadline}</p>
                                    <p className="text-[10px]" style={{ color: "#555" }}>{bounty.deadlineDate}</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users className="w-4 h-4" style={{ color: "#888" }} />
                                <p className="text-[12px] font-semibold text-white">{bounty.applicants} people have applied</p>
                            </div>
                            <div className="flex items-center gap-1.5">
                                <ShieldCheck className="w-4 h-4" style={{ color: "#22c55e" }} />
                                <span className="text-[12px] font-bold" style={{ color: "#22c55e" }}>Funds Verified</span>
                            </div>
                        </div>

                        {/* Private Brief Box */}
                        {bounty.hasPrivateBrief && (
                            <div className="p-5 rounded-lg border mb-8" style={{ background: "rgba(245,158,11,0.04)", borderColor: "rgba(245,158,11,0.2)" }}>
                                <div className="flex gap-3">
                                    <Lock className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: "#f59e0b" }} />
                                    <div>
                                        <h4 className="font-bold text-[13px] mb-1" style={{ color: "#f59e0b" }}>This bounty includes a confidential project brief.</h4>
                                        <p className="text-[12px] leading-relaxed" style={{ color: "#a78b6a" }}>
                                            The full brief is shared with accepted applicants only via Fileverse.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Full Description */}
                        <div className="mb-8">
                            <h3 className="text-[12px] font-bold tracking-widest uppercase mb-4" style={{ color: "#888" }}>Description</h3>
                            <div className="prose-dark text-[14px] leading-relaxed" style={{ color: "#bbb" }}>
                                {bounty.fullDescription.split("\n").map((line, i) => {
                                    if (line.startsWith("**") && line.endsWith("**")) {
                                        return <h4 key={i} className="font-bold text-white mt-5 mb-2 text-[14px]">{line.replace(/\*\*/g, "")}</h4>;
                                    }
                                    if (line.startsWith("- ")) {
                                        return <p key={i} className="pl-4 mb-1" style={{ color: "#999" }}>• {line.slice(2)}</p>;
                                    }
                                    if (line.match(/^\d+\.\s/)) {
                                        return <p key={i} className="pl-4 mb-1" style={{ color: "#999" }}>{line}</p>;
                                    }
                                    if (line.trim() === "") {
                                        return <div key={i} className="h-3" />;
                                    }
                                    return <p key={i} className="mb-2" style={{ color: "#999" }}>{line}</p>;
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Apply Button - Fixed at bottom */}
                <div className="p-5 border-t" style={{ borderColor: "#1a1a1a", background: "#0a0a0a" }}>
                    {applyState === "success" ? (
                        <div className="flex items-center gap-3 justify-center py-3 rounded-lg" style={{ background: "rgba(34,197,94,0.08)", border: "1px solid rgba(34,197,94,0.2)" }}>
                            <CheckCircle2 className="w-5 h-5" style={{ color: "#22c55e" }} />
                            <div>
                                <p className="text-[13px] font-bold" style={{ color: "#22c55e" }}>Application submitted.</p>
                                <p className="text-[11px]" style={{ color: "#888" }}>You appear as Applicant #{bounty.applicants + 1} — your identity is anonymous.</p>
                            </div>
                        </div>
                    ) : (
                        <button
                            onClick={handleApply}
                            disabled={applyState !== "idle"}
                            className="w-full font-bold text-[14px] py-4 rounded-lg uppercase tracking-wider transition-all border-none cursor-pointer flex items-center justify-center gap-3"
                            style={{
                                background: applyState !== "idle" ? "#1a1a1a" : "#e8ff00",
                                color: applyState !== "idle" ? "#888" : "#000",
                                cursor: applyState !== "idle" ? "not-allowed" : "pointer",
                                boxShadow: applyState === "idle" ? "0 0 20px rgba(232,255,0,0.1)" : "none",
                                fontFamily: "inherit"
                            }}
                            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (applyState === "idle") { e.currentTarget.style.boxShadow = "0 0 30px rgba(232,255,0,0.25)"; e.currentTarget.style.transform = "translateY(-1px)"; } }}
                            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (applyState === "idle") { e.currentTarget.style.boxShadow = "0 0 20px rgba(232,255,0,0.1)"; e.currentTarget.style.transform = "translateY(0)"; } }}
                        >
                            {applyState === "spinning" && <><Loader2 className="w-5 h-5 animate-spin" /> Processing...</>}
                            {applyState === "metamask" && <><Loader2 className="w-5 h-5 animate-spin" /> Confirm in MetaMask...</>}
                            {applyState === "idle" && <>Apply to this Bounty <ArrowRight className="w-4 h-4" /></>}
                        </button>
                    )}
                </div>
            </div>
        </>
    );
};

// ── Main BountyBoard Page ──────────────────────────────────────
const BountyBoard: FC = () => {
    const [searchQuery, setSearchQuery] = useState("");
    const [activeCategory, setActiveCategory] = useState<Category>("All");
    const [sortBy, setSortBy] = useState<SortOption>("newest");
    const [statusFilter, setStatusFilter] = useState<StatusFilter>("open");
    const [selectedBounty, setSelectedBounty] = useState<Bounty | null>(null);
    const [isPanelOpen, setIsPanelOpen] = useState(false);
    const [sortDropdownOpen, setSortDropdownOpen] = useState(false);
    const sortRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (e: Event) => {
            if (sortRef.current && !sortRef.current.contains(e.target as Node)) {
                setSortDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    // Close panel with Escape
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                setIsPanelOpen(false);
            }
        };
        document.addEventListener("keydown", handleEscape);
        return () => document.removeEventListener("keydown", handleEscape);
    }, []);

    const openBounty = (bounty: Bounty) => {
        setSelectedBounty(bounty);
        setIsPanelOpen(true);
    };

    const closePanel = () => {
        setIsPanelOpen(false);
    };

    // Filter & sort bounties
    const filteredBounties = BOUNTIES
        .filter((b) => {
            if (statusFilter === "open" && b.status !== "open") return false;
            if (activeCategory !== "All" && b.category !== activeCategory) return false;
            if (searchQuery) {
                const q = searchQuery.toLowerCase();
                return b.title.toLowerCase().includes(q) || b.description.toLowerCase().includes(q) || b.category.toLowerCase().includes(q);
            }
            return true;
        })
        .sort((a, b) => {
            if (sortBy === "highest") return b.prizeNum - a.prizeNum;
            if (sortBy === "deadline") return parseInt(a.deadline) - parseInt(b.deadline);
            return b.id - a.id; // newest
        });

    const sortLabels: Record<SortOption, string> = {
        newest: "Newest",
        highest: "Highest Prize",
        deadline: "Deadline Soon",
    };

    const handleNavigate = (page: string) => {
        console.log(`Navigate to: ${page}`);
        // In a real app, this would use a router
    };

    return (
        <div className="min-h-screen flex flex-col bg-[#060606] text-white font-sans">
            <style>{`
                @keyframes fadeIn { from { opacity: 0; transform: translateY(4px); } to { opacity: 1; transform: translateY(0); } }
                .line-clamp-2 {
                    display: -webkit-box;
                    -webkit-line-clamp: 2;
                    -webkit-box-orient: vertical;
                    overflow: hidden;
                }
                .filter-scrollbar::-webkit-scrollbar { height: 0; }
                .search-input:focus { border-color: rgba(232, 255, 0, 0.3) !important; box-shadow: 0 0 0 2px rgba(232,255,0,0.05); }
                .category-btn { transition: all 0.15s ease; }
                .category-btn:hover { background: #1a1a1a !important; }
            `}</style>

            <BountyBoardNavbar onNavigate={handleNavigate} />

            {/* Main Content */}
            <main className="flex-1 pt-16">
                {/* Filter Bar */}
                <div className="border-b sticky top-16 z-40 bg-[#060606]/95 backdrop-blur-md" style={{ borderColor: "#1a1a1a" }}>
                    <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-4">
                        {/* Row 1: Search + Sort + Status */}
                        <div className="flex items-center gap-4 mb-4 flex-wrap">
                            {/* Search */}
                            <div className="relative flex-1 min-w-[200px] max-w-md">
                                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: "#555" }} />
                                <input
                                    type="text"
                                    placeholder="Search bounties..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="search-input w-full bg-[#0a0a0a] text-white text-[13px] pl-10 pr-4 py-2.5 rounded-lg outline-none transition-all"
                                    style={{ border: "1px solid #1a1a1a" }}
                                />
                            </div>

                            {/* Sort Dropdown */}
                            <div className="relative" ref={sortRef}>
                                <button
                                    onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                                    className="flex items-center gap-2 bg-[#0a0a0a] border rounded-lg px-4 py-2.5 text-[13px] font-medium cursor-pointer transition-colors"
                                    style={{ borderColor: sortDropdownOpen ? "rgba(232,255,0,0.3)" : "#1a1a1a", color: "#ccc", fontFamily: "inherit" }}
                                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (!sortDropdownOpen) e.currentTarget.style.borderColor = "#333"; }}
                                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (!sortDropdownOpen) e.currentTarget.style.borderColor = "#1a1a1a"; }}
                                >
                                    {sortLabels[sortBy]}
                                    <ChevronDown className="w-3.5 h-3.5" style={{ color: "#666", transform: sortDropdownOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                                </button>
                                {sortDropdownOpen && (
                                    <div className="absolute left-0 top-full mt-1 w-44 rounded-lg border overflow-hidden shadow-2xl z-50"
                                        style={{ background: "#0c0c0c", borderColor: "#1a1a1a", animation: "fadeIn 0.15s ease" }}>
                                        {(["newest", "highest", "deadline"] as SortOption[]).map((opt) => (
                                            <button
                                                key={opt}
                                                onClick={() => { setSortBy(opt); setSortDropdownOpen(false); }}
                                                className="w-full text-left px-4 py-2.5 text-[13px] font-medium bg-transparent border-none cursor-pointer transition-colors"
                                                style={{ color: sortBy === opt ? "#e8ff00" : "#999", fontFamily: "inherit" }}
                                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#111"; }}
                                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; }}
                                            >
                                                {sortLabels[opt]}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            {/* Status Toggle */}
                            <div className="flex items-center rounded-lg overflow-hidden border" style={{ borderColor: "#1a1a1a" }}>
                                {(["open", "all"] as StatusFilter[]).map((s) => (
                                    <button
                                        key={s}
                                        onClick={() => setStatusFilter(s)}
                                        className="px-4 py-2.5 text-[12px] font-bold uppercase tracking-wider border-none cursor-pointer transition-colors"
                                        style={{
                                            background: statusFilter === s ? "#1a1a1a" : "transparent",
                                            color: statusFilter === s ? "#e8ff00" : "#666",
                                            fontFamily: "inherit"
                                        }}
                                        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { if (statusFilter !== s) e.currentTarget.style.background = "#111"; }}
                                        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { if (statusFilter !== s) e.currentTarget.style.background = "transparent"; }}
                                    >
                                        {s.charAt(0).toUpperCase() + s.slice(1)}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Row 2: Category Pills */}
                        <div className="flex items-center gap-2 overflow-x-auto filter-scrollbar pb-1">
                            {CATEGORIES.map((cat) => (
                                <button
                                    key={cat}
                                    onClick={() => setActiveCategory(cat)}
                                    className="category-btn px-4 py-2 text-[12px] font-bold uppercase tracking-wider rounded-lg border-none cursor-pointer whitespace-nowrap"
                                    style={{
                                        background: activeCategory === cat ? (cat === "All" ? "#e8ff00" : `${CATEGORY_COLORS[cat]}20`) : "#0f0f0f",
                                        color: activeCategory === cat ? (cat === "All" ? "#000" : CATEGORY_COLORS[cat] || "#e8ff00") : "#666",
                                        border: activeCategory === cat ? (cat === "All" ? "1px solid #e8ff00" : `1px solid ${CATEGORY_COLORS[cat]}40`) : "1px solid #1a1a1a",
                                        fontFamily: "inherit"
                                    }}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Bounty Grid */}
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-8">
                    {/* Results count */}
                    <div className="flex items-center justify-between mb-6">
                        <p className="text-[12px] font-medium" style={{ color: "#777" }}>
                            {filteredBounties.length} {filteredBounties.length === 1 ? "bounty" : "bounties"} found
                        </p>
                        <div className="flex items-center gap-2">
                            <ShieldCheck className="w-4 h-4" style={{ color: "#22c55e" }} />
                            <span className="text-[11px] font-medium" style={{ color: "#22c55e" }}>All funds escrowed & verified</span>
                        </div>
                    </div>

                    {filteredBounties.length > 0 ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {filteredBounties.map((bounty) => (
                                <BountyCard key={bounty.id} bounty={bounty} onClick={() => openBounty(bounty)} />
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Search className="w-10 h-10 mb-4" style={{ color: "#333" }} />
                            <h3 className="text-[16px] font-bold text-white mb-2">No bounties found</h3>
                            <p className="text-[13px]" style={{ color: "#777" }}>Try adjusting your filters or search query.</p>
                            <button
                                onClick={() => { setSearchQuery(""); setActiveCategory("All"); setStatusFilter("open"); }}
                                className="mt-4 px-5 py-2.5 text-[12px] font-bold uppercase tracking-wider rounded-lg border cursor-pointer transition-colors bg-transparent"
                                style={{ borderColor: "#333", color: "#ccc", fontFamily: "inherit" }}
                                onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; e.currentTarget.style.color = "#e8ff00"; }}
                                onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#333"; e.currentTarget.style.color = "#ccc"; }}
                            >
                                Clear Filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <footer className="border-t mt-auto" style={{ borderColor: "#111", padding: "30px 24px", background: "#060606" }}>
                    <div className="max-w-[1400px] mx-auto flex items-center justify-between flex-wrap gap-4">
                        <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4" style={{ color: "#e8ff00" }} />
                            <span className="font-bold tracking-widest text-white uppercase" style={{ fontSize: 12 }}>DARKEARN</span>
                        </div>
                        <div className="flex gap-6">
                            {["TWITTER", "DISCORD", "GITHUB", "DOCS"].map((link) => (
                                <a key={link} href="#" className="font-semibold uppercase"
                                    style={{ fontSize: 11, color: "#555", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                                    onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#e8ff00"; }}
                                    onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#555"; }}
                                >{link}</a>
                            ))}
                        </div>
                        <span style={{ fontSize: 11, color: "#333", fontWeight: 500 }}>© 2025 DARKEARN_PROTOCOL. ALL PRIVACY RESERVED.</span>
                    </div>
                </footer>
            </main>

            {/* Detail Panel Overlay */}
            <BountyDetailPanel
                bounty={selectedBounty}
                isOpen={isPanelOpen}
                onClose={closePanel}
            />
        </div>
    );
};

export default BountyBoard;
