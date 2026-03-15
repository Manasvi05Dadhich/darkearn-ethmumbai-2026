import React, { type FC, type MouseEvent } from "react";
import { useNavigate } from "react-router-dom";
import { Lock, Shield, EyeOff, Key } from "lucide-react";
import logo from "../assets/logo.png";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { theme } from "../theme";

const t = theme;

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

interface BountyCardProps {
  title: string;
  prize: string;
  tags: string[];
  deadline: string;
  apps: number;
}

const BOUNTIES: Bounty[] = [
  { id: 1, title: "Build a ZK identity verification module for ENS", prize: "$2,400 USDC", tags: ["Solidity", "ZK", "ENS"], deadline: "12d left", apps: 7 },
  { id: 2, title: "Design privacy-first dashboard UI for DeFi protocol", prize: "$1,800 USDC", tags: ["Figma", "UX", "Web3"], deadline: "5d left", apps: 14 },
  { id: 3, title: "Audit Solidity escrow contract — critical scope", prize: "$5,000 USDC", tags: ["Security", "Audit", "EVM"], deadline: "3d left", apps: 3 },
  { id: 4, title: "Write technical docs for cross-chain bridge SDK", prize: "$900 USDC", tags: ["Docs", "SDK", "Bridge"], deadline: "20d left", apps: 9 },
  { id: 5, title: "Develop WASM-based proof generation library", prize: "$3,200 USDC", tags: ["Rust", "WASM", "Circuits"], deadline: "8d left", apps: 5 },
  { id: 6, title: "Frontend integration for on-chain reputation NFT", prize: "$1,200 USDC", tags: ["React", "wagmi", "NFT"], deadline: "15d left", apps: 11 },
];

const FEATURES: Feature[] = [
  { icon: <Lock className="w-6 h-6 mx-auto mb-2" style={{ color: t.color.accent }} />, title: "EARNINGS HIDDEN", desc: "Financial flows are obfuscated using zero-knowledge protocols. Only you know your worth." },
  { icon: <Shield className="w-6 h-6 mx-auto mb-2" style={{ color: t.color.accent }} />, title: "WALLET PRIVATE", desc: "Decouple your professional identity from your personal assets. Secure and untraceable." },
  { icon: <EyeOff className="w-6 h-6 mx-auto mb-2" style={{ color: t.color.accent }} />, title: "WORK CONFIDENTIAL", desc: "Build your reputation without exposing your history. Anonymity is the ultimate utility." },
];

const Navbar: FC<{ onBrowse: () => void; onHowItWorks: () => void; onHome: () => void }> = ({ onBrowse, onHowItWorks, onHome }) => (
  <nav className="fixed top-0 left-0 right-0 z-50 border-b border-black/50 backdrop-blur" style={{ background: `${t.color.background.primary}95` }}>
    <div className="w-full px-6 md:px-12 flex items-center justify-between" style={{ height: 72 }}>
      <div className="flex items-center gap-8">
        <button type="button" onClick={onHome} className="flex items-center gap-2 cursor-pointer bg-transparent border-none p-0">
          <img src={logo} alt="DarkEarn" className="h-8 w-auto" />
        </button>
        <button
          type="button"
          onClick={onBrowse}
          className="font-semibold uppercase text-[12px] tracking-wider transition-colors hidden sm:block"
          style={{ color: t.color.text.secondary, letterSpacing: t.font.tracking.wider }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.color.accent; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.color.text.secondary; }}
        >
          Browse Bounties
        </button>
        <button
          type="button"
          onClick={onHowItWorks}
          className="font-semibold uppercase text-[12px] tracking-wider transition-colors hidden sm:block"
          style={{ color: t.color.text.secondary, letterSpacing: t.font.tracking.wider }}
          onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.color.accent; }}
          onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.color.text.secondary; }}
        >
          How It Works
        </button>
      </div>
      <ConnectButton />
    </div>
  </nav>
);

const BountyCard: FC<BountyCardProps> = ({ title, prize, tags, deadline, apps }) => (
  <div className="p-5 transition-colors" style={{ background: t.color.surface.card, borderBottom: `1px solid ${t.color.border.default}` }}>
    <div className="flex justify-between items-center mb-3">
      <span className="font-bold text-sm tracking-wide" style={{ color: t.color.accent }}>{prize}</span>
      <span className="text-xs" style={{ color: t.color.text.muted }}>{deadline}</span>
    </div>
    <p className="text-sm font-semibold text-white leading-snug mb-4">{title}</p>
    <div className="flex flex-wrap gap-2 mb-4">
      {tags.map((tagname: string) => (
        <span key={tagname} style={{ background: t.color.background.tertiary, color: t.color.secondaryDark, fontSize: 10, padding: "3px 8px", textTransform: "uppercase", letterSpacing: "0.06em", borderRadius: 2 }}>
          {tagname}
        </span>
      ))}
    </div>
    <div className="flex justify-between items-center">
      <span style={{ color: "#444", fontSize: 11 }}>{apps} applicants</span>
    </div>
  </div>
);

const LoginPage: FC = () => {
  const navigate = useNavigate();

  const handleBrowse = () => {
    navigate("/choose-role");
  };

  const handleHowItWorks = () => {
    navigate("/how-it-works");
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden" style={{ background: t.color.background.primary, color: t.color.text.primary, fontFamily: t.font.family.sans }}>
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

      <Navbar onBrowse={handleBrowse} onHowItWorks={handleHowItWorks} onHome={handleHome} />

      <section className="relative flex items-center justify-center bg-grid" style={{ paddingTop: 72, minHeight: "85vh", width: "100%" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `radial-gradient(circle at 50% 50%, transparent 0%, ${t.color.background.primary} 80%)` }} />

        <div className="relative z-10 text-center px-6 py-20 max-w-4xl hero-inner">
          <div className="inline-flex items-center justify-center gap-2 mb-8 px-4 py-1.5 font-bold rounded-full"
            style={{ border: `1px solid ${t.color.accentBorder}`, color: t.color.accent, fontSize: 10, letterSpacing: "0.1em" }}>
            <span className="live-dot rounded-full inline-block" style={{ width: 6, height: 6, background: t.color.accent }} />
            ZERO KNOWLEDGE BOUNTIES NOW LIVE
          </div>

          <h1 className="mb-8 heading-text flex flex-col items-center justify-center">
            <div className="flex gap-3 drop-shadow-lg">
              <span className="text-white">WORK</span>
              <span style={{ color: t.color.accent }}>PUBLICLY.</span>
            </div>
            <div className="flex gap-3 drop-shadow-lg">
              <span className="text-white">EARN</span>
              <span style={{ color: t.color.accent }}>PRIVATELY.</span>
            </div>
          </h1>

          <p className="mx-auto mb-10 leading-relaxed" style={{ color: "#999", fontSize: 15, maxWidth: 600, fontWeight: 400 }}>
            The bounty platform where your earnings stay yours. No surveillance.<br />
            No exposure. Powered by ZK-proofs for the sovereign freelancer.
          </p>

          <div className="flex gap-4 justify-center flex-wrap">
            <ConnectButton.Custom>
              {({ openConnectModal }) => (
                <button
                  onClick={openConnectModal}
                  className="font-bold uppercase"
                  style={{ background: t.color.accent, color: t.color.accentForeground, padding: "16px 36px", fontSize: t.font.size.text.sm, border: "none", cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", borderRadius: 2 }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = t.color.accentHover; e.currentTarget.style.transform = "translateY(-1px)"; }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = t.color.accent; e.currentTarget.style.transform = "translateY(0)"; }}
                >
                  START EARNING
                </button>
              )}
            </ConnectButton.Custom>

            <button
              onClick={handleBrowse}
              className="font-bold uppercase"
              style={{ background: "transparent", border: `1px solid ${t.color.accentBorderHover}`, color: t.color.accent, padding: "16px 36px", fontSize: t.font.size.text.sm, cursor: "pointer", fontFamily: "inherit", transition: "all 0.2s", borderRadius: 2 }}
              onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = t.color.accentSubtle; e.currentTarget.style.borderColor = t.color.accent; }}
              onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.borderColor = t.color.accentBorderHover; }}
            >
              BROWSE BOUNTIES →
            </button>
          </div>
        </div>
      </section>

      <section className="bg-grid relative" style={{ padding: "0 24px" }}>
        <div className="absolute inset-0 pointer-events-none" style={{ background: `linear-gradient(to bottom, transparent, ${t.color.background.primary} 80%)` }} />

        <div className="max-w-[1000px] mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" style={{ marginTop: "-50px" }}>
          {FEATURES.map((f: Feature) => (
            <div key={f.title} className="text-center p-8 transition-colors flex flex-col items-center justify-center relative overflow-hidden group rounded-md"
              style={{ background: t.color.background.overlay, border: `1px solid ${t.color.border.default}` }}
              onMouseEnter={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = t.color.accentBorder; }}
              onMouseLeave={(e: MouseEvent<HTMLDivElement>) => { e.currentTarget.style.borderColor = t.color.border.default; }}
            >
              <div className="absolute top-0 left-0 w-full h-[2px] opacity-0 group-hover:opacity-20 transition-opacity" style={{ background: `linear-gradient(to right, transparent, ${t.color.accent}, transparent)` }} />
              <div className="mb-4">{f.icon}</div>
              <h3 className="font-bold mb-3 uppercase" style={{ fontSize: t.font.size.text.sm, color: t.color.text.primary, letterSpacing: "0.05em" }}>{f.title}</h3>
              <p className="mx-auto leading-relaxed font-normal" style={{ fontSize: t.font.size.text.sm, color: t.color.text.secondary }}>{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section style={{ padding: "100px 24px 80px", background: t.color.background.primary }}>
        <div className="max-w-[1000px] mx-auto">
          <h2 className="text-center text-white mb-2 heading-sm" style={{ fontSize: 32 }}>
            AVAILABLE OPPORTUNITIES
          </h2>
          <p className="text-center mb-10 font-medium" style={{ color: t.color.text.secondary, fontSize: t.font.size.text.sm }}>
            Choose your role as Poster or Hunter to browse and apply
          </p>

          <div className="relative" style={{ border: `1px solid ${t.color.border.default}`, borderRadius: t.radius.md, overflow: "hidden", background: t.color.surface.card }}>
            <div className="flex flex-col" style={{ filter: "blur(4px)", opacity: 0.4, pointerEvents: "none", userSelect: "none" }}>
              {BOUNTIES.map((b: Bounty) => (
                <BountyCard key={b.id} title={b.title} prize={b.prize} tags={b.tags} deadline={b.deadline} apps={b.apps} />
              ))}
            </div>

            <div className="absolute inset-0 flex items-center justify-center p-4 backdrop-blur-[1px] cursor-pointer" onClick={handleBrowse}>
              <div className="text-center rounded-lg border p-8 shadow-2xl transition-all hover:-translate-y-1" style={{ background: t.color.surface.card, borderColor: t.color.border.default, maxWidth: 380 }}>
                <Key className="w-6 h-6 mx-auto mb-4" style={{ color: t.color.accent }} />
                <h3 className="font-bold mb-3 tracking-widest uppercase text-white" style={{ fontSize: t.font.size.text.sm }}>BROWSE BOUNTIES</h3>
                <p className="mb-6 leading-relaxed" style={{ fontSize: t.font.size.text.xs, color: t.color.text.secondary }}>
                  Choose your role (Poster or Hunter) to unlock the board and start earning privately.
                </p>
                <button
                  type="button"
                  onClick={(e: MouseEvent<HTMLButtonElement>) => { e.stopPropagation(); handleBrowse(); }}
                  className="w-full font-bold uppercase transition-colors"
                  style={{ background: t.color.accent, color: t.color.accentForeground, padding: "12px 20px", border: "none", fontSize: t.font.size.caption.md, letterSpacing: "0.1em", cursor: "pointer", borderRadius: 2 }}
                  onMouseEnter={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = t.color.accentHover; }}
                  onMouseLeave={(e: MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.background = t.color.accent; }}
                >
                  Choose Role & Browse
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer style={{ borderTop: `1px solid ${t.color.background.tertiary}`, padding: "30px 24px", background: t.color.background.primary, marginTop: "auto" }}>
        <div className="max-w-[1000px] mx-auto flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-2">
            <img src={logo} alt="DarkEarn" className="h-6 w-auto" />
          </div>
          <div className="flex gap-6">
            {["TWITTER", "DISCORD", "GITHUB", "DOCS"].map((link: string) => (
              <a key={link} href="#" className="font-semibold uppercase"
                style={{ fontSize: t.font.size.caption.md, color: t.color.secondaryDark, letterSpacing: "0.1em", textDecoration: "none", transition: "color 0.2s" }}
                onMouseEnter={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = t.color.accent; }}
                onMouseLeave={(e: MouseEvent<HTMLAnchorElement>) => { e.currentTarget.style.color = t.color.secondaryDark; }}
              >{link}</a>
            ))}
          </div>
          <span style={{ fontSize: t.font.size.caption.md, color: "#444", fontWeight: 500 }}>
            © 2025 DARKEARN_PROTOCOL. ALL PRIVACY RESERVED.
          </span>
        </div>
      </footer>
    </div>
  );
};

export default LoginPage;
