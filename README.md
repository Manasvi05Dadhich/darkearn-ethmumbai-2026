DarkEarn 🛡️
First Dollar. But Private.

A privacy-first bounty marketplace on Base where your earnings, identity, and payment destination are mathematically hidden — not just visually.# DarkEarn 🛡️
### *First Dollar. But Private.*

> A privacy-first bounty marketplace on Base where your earnings, identity, and payment destination are mathematically hidden — not just visually.


---

## The Problem

Your income is permanently public on every Web3 platform.

You complete a $5,000 bounty on Superteam or Dework. The payment hits your wallet. Now anyone, forever, can go to Etherscan and see:

- Every job you have ever been paid for
- Exactly how much each one paid
- Which company or protocol paid you
- How frequently you work

Employers lowball you because they already know what you earned last time. Competitors track your clients. Your entire financial history is a public ledger entry.

**DarkEarn fixes this.** Your ENS identity and your payment are mathematically separated using ERC-5564 stealth addresses. Nobody can connect what you earned to who you are.

---

## What Is DarkEarn

A bounty marketplace on Base — exactly like First Dollar — but with a full privacy layer built in from day one.

Three ways to work:

**1. Post a Bounty** — Lock funds in BitGo. Post publicly. Hunters apply anonymously. Pay privately.

**2. Reverse Bidding** — Hunters post their rate and availability. Posters come to them. Power dynamic flipped.

**3. Private Bids** — Posters headhunt specific contributors via ECIES encrypted on-chain messages.

---

## Privacy Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         WHAT IS PUBLIC                          │
│         ENS name · Band badge · Skill badges · Prize amounts    │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                         WHAT IS PRIVATE                         │
│   Earnings · Work history · Payment destination · Clients ·     │
│   Application identity (until poster reveals) · Work content    │
└─────────────────────────────────────────────────────────────────┘
```

| Privacy Feature | How It Works |
|----------------|-------------|
| Hidden earnings | Earnings tab blurred by default, only visible to owner |
| Anonymous applications | Hunters appear as Applicant #N until poster reveals |
| Encrypted work submissions | Fileverse dDocs — only poster's wallet can decrypt |
| Private bounty briefs | Fileverse dDocs — only accepted applicant can read |
| Stealth payments | ERC-5564 — payment address has zero on-chain link to ENS wallet |
| ZK reputation | Noir circuit proves band without revealing which bounties completed |
| Private bids | ECIES encrypted on-chain — only recipient can read |

---

## Architecture

```
darkearn/
│
├── circuits/            ← Noir ZK reputation circuit
│   └── reputation_score/
│       ├── src/main.nr  ← Band 0-4 logic enforced by math
│       └── Prover.toml
│
├── contracts/           ← Solidity smart contracts (Base Sepolia)
│   └── src/
│       ├── HonkVerifier.sol        ← Auto-generated ZK verifier
│       ├── ReputationNFT.sol       ← Soulbound ERC-721, one per ENS
│       ├── SkillRegistry.sol       ← Auto-records skills on approval
│       ├── BountyEscrow.sol        ← Full platform logic
│       └── ERC5564Announcer.sol    ← Stealth address announcements
│
├── bitgo/               ← Node.js payment service
│   └── src/
│       ├── index.ts           ← Express server
│       ├── walletService.ts   ← MPC wallet creation
│       ├── lockService.ts     ← Fund locking before bounty posts
│       ├── webhookServer.ts   ← Policy enforcement via ReputationNFT
│       └── eventListener.ts   ← PaymentClaimed → release to stealth address
│
└── frontend/            ← React app (Vite + wagmi + TailwindCSS)
    └── src/
        ├── lib/stealth.ts     ← Full ERC-5564 implementation
        ├── lib/zkProver.ts    ← Barretenberg WASM proof generation
        ├── lib/fileverse.ts   ← Encrypted document creation
        └── ...
```

---

## How Payments Work

```
                    BEFORE (every other platform)
Poster Wallet ──────────────────────────────► Hunter's ENS Wallet
                         visible on Etherscan forever


                    AFTER (DarkEarn)
Poster BitGo Wallet                          Stealth Address
        │                                    (mathematically derived,
        │   BitGo webhook checks             no on-chain link to ENS)
        │   winner's ReputationNFT               ▲
        └────────────────────────────────────────┘
                 one-time stealth address
                 announced via ERC-5564
                 hunter scans with viewing key
                 spends with existing wallet
```

### ERC-5564 Stealth Address Flow

1. Hunter derives spending + viewing keys from wallet signature (once)
2. Hunter's stealth meta-address stored in ENS text record
3. On payment claim — stealth address computed from hunter's meta-address
4. BitGo sends funds to stealth address
5. ERC5564Announcer emits announcement on-chain
6. Hunter scans announcements with viewing key — finds their payment
7. Hunter spends using existing wallet — no new private key needed

---

## ZK Reputation System

```
Private inputs (never revealed):        Public output:
┌─────────────────────────────┐        ┌──────────────┐
│ completions on DarkEarn     │        │              │
│ approval rate (%)           │──────► │  score_band  │
│ dispute rate (%)            │  Noir  │    0 to 4    │
│ account age (days)          │        │              │
└─────────────────────────────┘        └──────────────┘
```

| Band | Requirements |
|------|-------------|
| 0 | Exists on DarkEarn, 1+ days |
| 1 | 3+ completions, 70%+ approval, 7+ days |
| 2 | 8+ completions, 80%+ approval, 14+ days |
| 3 | 15+ completions, 85%+ approval, 30+ days |
| 4 | 25+ completions, 92%+ approval, 60+ days |

Cannot fake your band in either direction. The circuit enforces honesty mathematically.

---

## Smart Contracts

| Contract | Address (Base Sepolia) | Purpose |
|----------|----------------------|---------|
| HonkVerifier | `0x...` | Auto-generated ZK proof verifier |
| ReputationNFT | `0x...` | Soulbound ERC-721 reputation profile |
| SkillRegistry | `0x...` | On-chain skill credentials |
| BountyEscrow | `0x...` | Full bounty lifecycle |
| ERC5564Announcer | `0x...` | Stealth payment announcements |

> Contract addresses updated after deployment

---

## Tech Stack

### ZK Layer
- **Noir 0.38+** — ZK circuit language
- **Barretenberg (bb)** — Proof generation + Solidity verifier generation  
- **bb.js** — Runs ZK proofs in browser via WASM

### Smart Contracts
- **Solidity 0.8.24** — Contract language
- **Foundry** — Compile, test, deploy
- **OpenZeppelin 5.0** — ERC721, Ownable, Base64
- **ERC-5564** — Stealth address standard

### BitGo Service
- **Node.js 20** — Runtime
- **TypeScript** — Type safety
- **@bitgo/sdk-api** — MPC wallet management
- **@bitgo/sdk-coin-eth** — ETH operations
- **Express.js** — Webhook + API server
- **ethers.js v6** — Contract reading + signature verification

### Frontend
- **React 18 + Vite** — UI framework + build tool
- **wagmi v2 + viem** — Wallet connection + contract hooks
- **TailwindCSS** — Styling
- **@noble/secp256k1** — EC point math for stealth addresses
- **@tanstack/react-query** — Data fetching
- **ethers.js v6** — Stealth address math

### External Services
- **Alchemy** — Base Sepolia + Ethereum Sepolia RPC
- **BitGo Testnet** — MPC institutional custody
- **Fileverse** — End-to-end encrypted documents on IPFS
- **Pinata** — IPFS pinning
- **ENS Sepolia** — Name resolution + stealth meta-address storage

---

## Getting Started

### Prerequisites

```bash
# Node.js 20
nvm install 20 && nvm use 20

# pnpm
npm install -g pnpm

# Foundry
curl -L https://foundry.paradigm.xyz | bash && foundryup

# Nargo (Noir)
curl -L https://raw.githubusercontent.com/noir-lang/noirup/main/install | bash && noirup

# Verify
node --version    # v20.x.x
forge --version   # forge 0.x.x
nargo --version   # nargo 0.38.x
bb --version      # bb 0.x.x
```

### Environment Setup

Create `.env` in root:

```env
# RPC
BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_BASE_SEPOLIA_RPC=https://base-sepolia.g.alchemy.com/v2/YOUR_KEY
VITE_SEPOLIA_RPC=https://eth-sepolia.g.alchemy.com/v2/YOUR_KEY

# Wallets
DEPLOYER_PRIVATE_KEY=0x...
DEMO_POSTER_PRIVATE_KEY=0x...
DEMO_HUNTER_PRIVATE_KEY=0x...

# BitGo
BITGO_ACCESS_TOKEN=your_long_lived_token
BITGO_WALLET_PASSPHRASE=your_passphrase
BITGO_ENTERPRISE_ID=your_enterprise_id

# Services
VITE_BITGO_SERVICE_URL=https://darkearn-bitgo.up.railway.app
VITE_PINATA_JWT=your_pinata_jwt
VITE_PINATA_GATEWAY=https://your-gateway.mypinata.cloud

# Basescan
BASESCAN_API_KEY=your_key
```

---

## Build & Deploy

### Phase 1 — ZK Circuit

```bash
cd circuits/reputation_score

# Run tests (all 5 must pass)
nargo test

# Compile + generate proof
nargo compile
nargo execute
bb prove -b ./target/reputation_score.json -w ./target/reputation_score.gz -o ./target

# Generate Solidity verifier
bb write_vk -b ./target/reputation_score.json -o ./target --oracle_hash keccak
bb write_solidity_verifier -k ./target/vk -o ./target/ReputationVerifier.sol

# Copy to contracts
cp ./target/ReputationVerifier.sol ../../contracts/src/
```

### Phase 2 — Smart Contracts

```bash
cd contracts

# Install dependencies
forge install OpenZeppelin/openzeppelin-contracts --no-commit

# Run all tests (53 must pass)
forge test -vvv

# Deploy to Base Sepolia
forge script script/DeployAll.s.sol \
  --rpc-url $BASE_SEPOLIA_RPC \
  --private-key $DEPLOYER_PRIVATE_KEY \
  --broadcast \
  --verify \
  --etherscan-api-key $BASESCAN_API_KEY

# Copy ABIs to frontend
./copyAbis.sh
```

### Phase 3 — BitGo Service

```bash
cd bitgo
pnpm install

# Run tests
pnpm test

# Development (with localtunnel for demo)
pnpm dev

# In another terminal
npx localtunnel --port 3001 --subdomain darkearn-bitgo
# URL: https://darkearn-bitgo.loca.lt

# Production deploy
railway login && railway up
```

### Phase 4 — Frontend

```bash
cd frontend
pnpm install

# Copy circuit artifacts
cp ../circuits/reputation_score/target/reputation_score.json public/circuits/

# Development
pnpm dev

# Production build
pnpm build

# Deploy to Vercel
vercel --prod
```

---

## User Flows

### For Posters (need ENS + profile)
```
Connect MetaMask → Enter ENS name → Verify ownership (Ethereum Sepolia)
→ Mint Band 0 ReputationNFT → Fund BitGo wallet → Lock funds
→ Post bounty (with optional private Fileverse brief) → Review anonymous applicants
→ Reveal identity → Accept → Review encrypted Fileverse submission
→ Approve work → Skill auto-recorded on-chain
```

### For Hunters (wallet only — no ENS required)
```
Connect MetaMask → Browse bounties → Apply anonymously
→ Wait for acceptance → Receive private brief via Fileverse
→ Submit encrypted work via Fileverse → Wait for approval
→ Set up stealth keys (two signatures, once) → Claim payment
→ Stealth address announced on-chain → Scan for payment
→ Spend from stealth address via existing wallet
```

### For Reverse Bidding
```
Hunter posts service listing (rate + skills, anonymous)
→ Poster browses listings → Clicks Hire
→ Locks funds in BitGo → Sends private brief
→ Standard bounty flow begins
```

---

## Sponsor Integrations

### BitGo — $2,000
- MPC hot wallet creation per poster
- Fund locking before any bounty goes live (fake bounties impossible)
- Webhook policy enforces ZK reputation check before every payment
- Automated payment release on `PaymentClaimed` event
- Dispute resolution — automated 50/50 fund splits

### ENS — $2,000
- ENS is the entire identity layer — alice.eth replaces 0x addresses everywhere
- ENS ownership verified against Ethereum Sepolia registry at mint time
- Soulbound ReputationNFT permanently bound to ENS name
- Hunter's stealth meta-address stored as ENS text record `stealth-meta-address`
- Public profiles at `/profile/alice.eth` — zero sensitive data exposed
- Private bids use ENS public key resolver for ECIES encryption

### Fileverse — $1,000
- Work submissions: encrypted dDocs on IPFS — only poster's wallet decrypts
- Private bounty briefs: encrypted — only accepted applicant can read
- Build What Big Tech Won't — complete replacement for Google Docs surveillance in professional work

### Base — $1,050
- All 5 contracts deployed on Base Sepolia
- ERC-5564 stealth addresses — first implementation on Base
- Privacy track + DeFi 2.0 new primitives

---

## Running Tests

```bash
# ZK circuit tests
cd circuits/reputation_score && nargo test

# Contract tests
cd contracts && forge test -vvv

# BitGo service tests
cd bitgo && pnpm test

# Frontend tests
cd frontend && pnpm test
```

Expected results:
```
ZK circuit:  5/5 tests pass
Contracts:  53/53 tests pass
BitGo:       8/8 tests pass
Frontend:   12/12 tests pass
```

---

## Project Structure Deep Dive

```
frontend/src/
├── lib/
│   ├── stealth.ts      ← Full ERC-5564 implementation
│   │                      generateStealthKeys()
│   │                      generateStealthAddress()
│   │                      checkAnnouncementForHunter()
│   │                      computeStealthPrivateKey()
│   ├── zkProver.ts     ← Reads chain → generates proof in browser WASM
│   ├── fileverse.ts    ← Create + retrieve encrypted Fileverse dDocs
│   ├── encryption.ts   ← ECIES bid encryption/decryption
│   └── ensVerifier.ts  ← ENS ownership check on Ethereum Sepolia
│
├── hooks/
│   ├── useBounties.ts
│   ├── useReputationNFT.ts
│   ├── useSkills.ts
│   ├── useMyApplications.ts
│   ├── useStealthKeys.ts       ← Derives + caches stealth keys
│   ├── useStealthPayments.ts   ← Scans announcements for hunter's payments
│   └── useBids.ts
│
└── pages/Dashboard/
    ├── Overview.tsx
    ├── Applications.tsx    ← Submit work + claim payment flows
    ├── BidInbox.tsx        ← ECIES decryption in browser
    ├── Reputation.tsx      ← ZK band upgrade
    ├── Skills.tsx          ← Auto-populated from SkillRegistry
    ├── Earnings.tsx        ← Blurred by default
    ├── PostBounty.tsx      ← BitGo lock + Fileverse brief
    ├── MyPostedBounties.tsx ← Anonymous applicant reveal flow
    ├── FindContributors.tsx ← Reverse bidding directory
    └── Payments.tsx        ← Stealth address scanner
```

---

## Demo Script (90 seconds)

```
01. Open DarkEarn — show "Work Publicly. Earn Privately."
02. Browse Bounties without connecting — fully public board
03. Connect wallet → bounty board with Funds Verified badges
04. Open bounty detail — show private brief lock icon
05. Apply → 2s ZK proof spinner → "Submitted as Applicant #3"
06. Switch to poster view → see Applicant #1, #2 — no names
07. Reveal Identity → accept → "Private brief shared via Fileverse"
08. Hunter: My Applications → Submit Work → Fileverse doc created
09. Poster: Review Submission → Fileverse opens (only poster can read)
10. Approve Work → SkillRegistry updated automatically on-chain
11. Hunter: Claim Payment → stealth keys → stealth address generated
12. BitGo dashboard shows balance drop
13. Basescan shows payment to fresh address — no link to ENS wallet
14. Open /profile/alice.eth in incognito → band + skills only, zero financial data
```

---

## Future Scope

**AI Agents competing alongside humans**

A marketplace where both humans and AI agents compete for work side by side. An agent sees a $500 Solidity audit bounty, applies, completes the work, submits via Fileverse, and receives payment to its stealth address — zero human intervention.

Reverse bidding extends naturally here too. An AI agent posts its capabilities and rate. Posters hire it directly. The agent's payment history is as private as a human hunter's — the stealth address standard applies identically.

**Yield-bearing escrow**

Prize funds deposited into Aave on Base while bounty is active. Hunter receives prize + yield. The world's first yield-bearing freelance escrow.

**Cross-chain bounties**

Post bounties from any chain. Complete work. Receive payment on your preferred chain via stealth address.

---

## Security Considerations

- `applications` mapping is `private` — wallet addresses never readable externally
- `tokenIdToMinter` is `private` — no public ENS-to-wallet linkage
- `addressToTokenId` is `private` — no public wallet-to-ENS reverse lookup
- `claimPayment()` reverts if recipient equals caller's wallet (privacy enforcement)
- ZK proof inputs are private — band is public, history is not
- Stealth addresses have zero on-chain link to ENS wallet
- Fileverse documents encrypted — DarkEarn servers cannot read work content

---

## Team

Built for **ETHMumbai 2026**

---

## License

MIT

---

## Acknowledgements

- [First Dollar](https://firstdollar.xyz) — inspiration for the bounty marketplace model
- [Noir](https://noir-lang.org) — ZK circuit language
- [ERC-5564](https://eips.ethereum.org/EIPS/eip-5564) — stealth address standard
- [BitGo](https://bitgo.com) — institutional custody infrastructure
- [Fileverse](https://fileverse.io) — encrypted decentralized documents
- [ENS](https://ens.domains) — decentralized naming system
- [Base](https://base.org) — L2 network

---

<div align="center">
  <strong>DarkEarn — Your work. Your money. Nobody else's business.</strong>
</div>
