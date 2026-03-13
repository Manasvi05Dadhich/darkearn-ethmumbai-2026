import { useState, type FC, type MouseEvent } from "react";
import { Lock, Shield, EyeOff, Key } from "lucide-react";

// ── Types ────────────────────────────────────────────────────
interface Bounty {
  id: number;
  title: string;
  prize: string;
  tags: string[];
  deadline: string;
  apps: number;
}

interface Feature {
  icon: React.ReactNode;
  title: string;
  desc: string;
}

interface NavbarProps {
  onConnect: () => void;
}

interface BountyCardProps {
  title: string;
  prize: string;
  tags: string[];
  deadline: string;
  apps: number;
}

interface ConnectWalletModalProps {
  onClose: () => void;
}

interface Wallet {
  id: string;
  name: string;
  icon: string;
}

// ── Data ─────────────────────────────────────────────────────
const BOUNTIES: Bounty[] = [
  { id: 1, title: "Build a ZK identity verification module for ENS", prize: "$2,400 USDC", tags: ["Solidity", "ZK", "ENS"], deadline: "12d left", apps: 7 },
  { id: 2, title: "Design privacy-first dashboard UI for DeFi protocol", prize: "$1,800 USDC", tags: ["Figma", "UX", "Web3"], deadline: "5d left", apps: 14 },
  { id: 3, title: "Audit Solidity escrow contract — critical scope", prize: "$5,000 USDC", tags: ["Security", "Audit", "EVM"], deadline: "3d left", apps: 3 },
  { id: 4, title: "Write technical docs for cross-chain bridge SDK", prize: "$900 USDC", tags: ["Docs", "SDK", "Bridge"], deadline: "20d left", apps: 9 },
  { id: 5, title: "Develop WASM-based proof generation library", prize: "$3,200 USDC", tags: ["Rust", "WASM", "Circuits"], deadline: "8d left", apps: 5 },
  { id: 6, title: "Frontend integration for on-chain reputation NFT", prize: "$1,200 USDC", tags: ["React", "wagmi", "NFT"], deadline: "15d left", apps: 11 },
];

const FEATURES: Feature[] = [
  { icon: <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: "#e8ff00" }} />, title: "EARNINGS HIDDEN", desc: "Financial flows are obfuscated using zero-knowledge protocols. Only you know your worth." },
  { icon: <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: "#e8ff00" }} />, title: "WALLET PRIVATE", desc: "Decouple your professional identity from your personal assets. Secure and untraceable." },
  { icon: <EyeOff className="w-6 h-6 mx-auto mb-2" style={{ color: "#e8ff00" }} />, title: "WORK CONFIDENTIAL", desc: "Build your reputation without exposing your history. Anonymity is the ultimate utility." },
];

const WALLETS: Wallet[] = [
  { id: "metamask", name: "MetaMask", icon: "🦊" },
  { id: "wc", name: "WalletConnect", icon: "🔗" },
  { id: "coinbase", name: "Coinbase Wallet", icon: "🔵" },
  { id: "rainbow", name: "Rainbow", icon: "🌈" },
];

// ── Navbar ───────────────────────────────────────────────────
const Navbar: FC<NavbarProps> = ({ onConnect }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/50 bg-[#060606]/95 backdrop-blur">
    <div className="w-full px-6 md:px-12 flex items-center justify-between" style={{ height: 72 }}>
      <div className="flex items-center gap-2">
        <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
        <span className="font-bold text-white tracking-widest text-[16px] uppercase font-sans">DARKEARN</span>
      </div>
      <button
        onClick={onConnect}
        className="font-bold text-[12px] uppercase transition-colors"
        style={{ background: "#e8ff00", color: "#000", padding: "10px 18px", border: "none", cursor: "pointer", fontFamily: "inherit", borderRadius: 2 }}
        onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#d4eb00"; }}
        onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#e8ff00"; }}
      >
        CONNECT WALLET
      </button>
    </div>
  </nav>
);

// ── BountyCard ────────────────────────────────────────────────
const BountyCard: FC<BountyCardProps> = ({ title, prize, tags, deadline, apps }) => (
  <div className="p-5 transition-colors" style={{ background: "#0a0a0a", borderBottom: "1px solid #1a1a1a" }}>
    <div className="flex justify-between items-center mb-3">
      <span className="font-bold text-sm tracking-wide" style={{ color: "#e8ff00" }}>{prize}</span>
      <span className="text-xs" style={{ color: "#555" }}>{deadline}</span>
    </div>
    <p className="text-sm font-semibold text-white leading-snug mb-4">{title}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((t: string) => (
        <span key={t} style={{ background: "#111", color: "#666", fontSize: 10, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 2 }}>
          {t}
        </span>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <span style={{ color: "#444", fontSize: 11 }}>{apps} applicants</span>
    </div>
  </div>
);

// ── ConnectWalletModal ────────────────────────────────────────
const ConnectWalletModal: FC<ConnectWalletModalProps> = ({ onClose }) => (
  <div
    className="fixed inset-0 z-50 flex items-center justify-center p-6"
    style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(4px)" }}
    onClick={onClose}
  >
    <div
      className="w-full max-w-sm p-8 rounded-lg"
      style={{ background: "#111", border: "1px solid #222" }}
      onClick={(e: MouseEvent<HTMLDivElement>) => e.stopPropagation()}
    >
      <div className="flex justify-between items-center mb-4">
        <h2 className="font-bold text-white tracking-widest text-[13px]">CONNECT WALLET</h2>
        <button
          onClick={onClose}
          style={{ background: "none", border: "none", color: "#555", fontSize: 16, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}
        >✕</button>
      </div>

      <p className="text-xs mb-6 leading-relaxed" style={{ color: "#888" }}>
        Connect a wallet to access the board and start earning privately.
      </p>

      <div className="flex flex-col gap-2 mb-6">
        {WALLETS.map((w: Wallet) => (
          <button
            key={w.id}
            className="flex items-center gap-3 px-4 py-3.5 text-left w-full transition-colors rounded-md"
            style={{ background: "#060606", border: "1px solid #1a1a1a", cursor: "pointer", fontFamily: "inherit" }}
            onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#e8ff00"; }}
            onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
          >
            <span style={{ fontSize: 18 }}>{w.icon}</span>
            <span className="flex-1 text-white text-[13px] font-medium tracking-wide">{w.name}</span>
            <span style={{ color: "#555", fontSize: 12 }}>→</span>
          </button>
        ))}
      </div>

      <p className="text-center" style={{ color: "#555", fontSize: 11 }}>
        By connecting, you agree to our{" "}
        <a href="#" style={{ color: "#777", textDecoration: "underline" }}>Terms of Service</a>.
      </p>
    </div>
  </div>
);

// ── LoginPage ─────────────────────────────────────────────────
const LoginPage: FC = () => {
  const [modalOpen, setModalOpen] = useState<boolean>(false);
  const [isBrowsing, setIsBrowsing] = useState<boolean>(false);

  const handleBrowse = () => {
    setIsBrowsing(true);
    window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden" style={{ background: "#060606", color: "#fff", fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,400;0,500;0,700;0,900;1,700;1,900&display=swap');
        
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:0.2} }
        @keyframes fadeUp { from{opacity:0;transform:translateY(12px)} to{opacity:1;transform:translateY(0)} }
        
        .live-dot { animation: blink 2s ease-in-out infinite; }
        .hero-inner { animation: fadeUp 0.6s ease both; }
        
        .bg-grid {
          background-size: 40px 40px;
          background-image: 
            linear-gradient(to right, rgba(232, 255, 0, 0.04) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(232, 255, 0, 0.04) 1px, transparent 1px);
          width: 100vw;
          min-width: 100%;
        }

        .heading-text {
          font-family: 'Inter', sans-serif;
          font-weight: 900;
          font-style: italic;
          line-height: 0.95;
          letter-spacing: -0.02em;
          text-transform: uppercase;
          font-size: clamp(48px, 9vw, 100px);
        }

        .heading-sm {
           font-family: 'Inter', sans-serif;
           font-weight: 900;
           font-style: italic;
           text-transform: uppercase;
           letter-spacing: -0.02em;
        }
      `}</style>

      <Navbar onConnect={() => setModalOpen(true)} />

      {/* ── HERO ── */}
      <section className="relative flex items-center justify-center bg-grid" style={{ paddingTop: 72, minHeight: "85vh", width: "100%" }}>
        <div className="absolute inset-0 pointer-events-none"
          style={{ background: "radial-gradient(circle at 50% 50%, transparent 0%, #060606 80%)" }} />

        <div className="relative z-10 text-center px-6 py-20 max-w-4xl hero-inner">
          {/* Badge */}
          <div className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-1.5 font-bold rounded-full"
            style={{ border: "1px solid rgba(232,255,0,0.2)", color: "#e8ff00", fontSize: 10, letterSpacing: "0.1em" }}>
            <span className="live-dot rounded-full inline-block" style={{ width: 6, height: 6, background: "#e8ff00" }} />
            ZERO KNOWLEDGE BOUNTIES NOW LIVE
          </div>

          {/* Headline */}
          <h1 className="mb-8 heading-text flex flex-col items-center justify-center">
            <div className="flex gap-3 drop-shadow-lg">
              <span className="text-white">WORK</span>
              <span style={{ color: "#e8ff00" }}>PUBLICLY.</span>
            </div>
            <div className="flex gap-3 drop-shadow-lg">
              <span className="text-white">EARN</span>
              <span style={{ color: "#e8ff00" }}>PRIVATELY.</span>
            </div>
          </h1>

          <p className="mx-auto mb-10 leading-relaxed" style={{ color: "#999", fontSize: 15, maxWidth: 600, fontWeight: 400 }}>
            The bounty platform where your earnings stay yours. No surveillance.<br />
            No exposure. Powered by ZK-proofs for the sovereign freelancer.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <button
              onClick={() => setModalOpen(true)}
              className="font-bold uppercase"
              style={{ background: "#e8ff00", color: "#000", padding: "16px 36px", fontSize: 13, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", borderRadius: 2 }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#d4eb00"; e.currentTarget.style.transform = "translateY(-1px)"; }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#e8ff00"; e.currentTarget.style.transform = "translateY(0)"; }}
            >
              START EARNING
            </button>

            <button
              onClick={handleBrowse}
              className="font-bold text-[#e8ff00] uppercase"
              style={{ background: "transparent", border: "1px solid rgba(232,255,0,0.3)", padding: "16px 36px", fontSize: 13, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", borderRadius: 2 }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "rgba(232,255,0,0.05)"; e.currentTarget.style.borderColor = "#e8ff00"; }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = "rgba(232,255,0,0.3)"; }}
            >
              BROWSE BOUNTIES
            </button>
          </div>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="bg-grid relative" style={{ padding: "0 24px" }}>
        {/* Subtle overlay */}
        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, transparent, #060606 80%)" }} />

        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" style={{ marginTop: "-50px" }}>
          {FEATURES.map((f: Feature) => (
            <div key={f.title} className="text-center p-8 transition-colors flex flex-col items-center justify-center relative overflow-hidden group rounded-md"
              style={{ background: "#0c0c0c", border: "1px solid #1a1a1a" }}
              onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "rgba(232,255,0,0.2)"; }}
              onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = "#1a1a1a"; }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-transparent via-[#e8ff00] to-transparent opacity-0 group-hover:opacity-20 transition-opacity" />
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-bold mb-3 uppercase" style={{ fontSize: 13, color: "#fff", letterSpacing: "0.05em" }}>{f.title}</h3>
              <p className="mx-auto leading-relaxed font-normal" style={{ fontSize: 13, color: "#777" }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── BOUNTY BOARD ── */}
      <section style={{ padding: "100px 24px 80px", background: "#060606" }}>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-center text-white mb-2 heading-sm" style={{ fontSize: 32 }}>
            AVAILABLE OPPORTUNITIES
          </h2>
          <p className="text-center mb-10 font-medium" style={{ color: "#777", fontSize: 13 }}>
            Connect your wallet to unlock full access to the board
          </p>

          <div className="relative" style={{ border: "1px solid #1a1a1a", borderRadius: 8, overflow: "hidden", background: "#0a0a0a" }}>
            <div className="flex flex-col"
              style={{ filter: isBrowsing ? "none" : "blur(4px)", opacity: isBrowsing ? 1 : 0.4, transition: "all 0.5s ease", pointerEvents: isBrowsing ? "auto" : "none", userSelect: isBrowsing ? "auto" : "none" }}>
              {BOUNTIES.map((b: Bounty) => (
                <BountyCard key={b.id} title={b.title} prize={b.prize} tags={b.tags} deadline={b.deadline} apps={b.apps} />
              ))}
            </div>

            {!isBrowsing && (
              <div className="absolute inset-0 flex items-center justify-center p-4 backdrop-blur-[1px]" onClick={() => setModalOpen(true)}>
                <div className="text-center cursor-pointer rounded-lg border border-[#1a1a1a] p-8 shadow-2xl transition-transform hover:-translate-y-1" style={{ background: "#0a0a0a", maxWidth: 360 }}>
                  <Key className="w-6 h-6 mx-auto mb-4" style={{ color: "#e8ff00" }} />
                  <h3 className="font-bold mb-3 tracking-widest uppercase text-white" style={{ fontSize: 13 }}>RESTRICTED AREA</h3>
                  <p className="mb-6 leading-relaxed text-[#888]" style={{ fontSize: 12 }}>
                    To protect the privacy of our workers and clients, the full board is encrypted for unauthorized visitors.
                  </p>
                  <button
                    className="w-full font-bold uppercase transition-colors"
                    style={{ background: "#e8ff00", color: "#000", padding: "12px 20px", border: "none", fontSize: 11, letterSpacing: "0.1em", cursor: "pointer", borderRadius: 2 }}
                    onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#d4eb00"; }}
                    onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "#e8ff00"; }}
                  >AUTHENTICATE TO VIEW</button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer style={{ borderTop: "1px solid #111", padding: "30px 24px", background: "#060606", marginTop: "auto" }}>
        <div className="max-w-[1000px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5" style={{ color: "#e8ff00" }} />
            <span className="font-bold tracking-widest text-white uppercase font-sans" style={{ fontSize: 13 }}>DARKEARN</span>
          </div>
          <div className="flex gap-6">
            {["TWITTER", "DISCORD", "GITHUB", "DOCS"].map((link: string) => (
              <a key={link} href="#" className="font-semibold uppercase"
                style={{ fontSize: 11, color: "#666", letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#e8ff00"; }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = "#666"; }}
              >{link}</a>
            ))}
          </div>
          <span style={{ fontSize: 11, color: "#444", fontWeight: 500 }}>
            © 2025 DARKEARN_PROTOCOL. ALL PRIVACY RESERVED.
          </span>
        </div>
      </footer>

      {modalOpen && <ConnectWalletModal onClose={() => setModalOpen(false)} />}
    </div>
  );
};

export default LoginPage;