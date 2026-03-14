import { baseSepolia } from "wagmi/chains";
import addresses from "./addresses.json";
import BountyEscrowABI from "./abi/BountyEscrow.json";
import ReputationNFTABI from "./abi/ReputationNFT.json";
import SkillRegistryABI from "./abi/SkillRegistry.json";
import type { Abi } from "viem";

export const CHAIN = baseSepolia;

export const CONTRACTS = {
    BountyEscrow: {
        address: addresses.BountyEscrow as `0x${string}`,
        abi: BountyEscrowABI as unknown as Abi,
    },
    ReputationNFT: {
        address: addresses.ReputationNFT as `0x${string}`,
        abi: ReputationNFTABI as unknown as Abi,
    },
    SkillRegistry: {
        address: addresses.SkillRegistry as `0x${string}`,
        abi: SkillRegistryABI as unknown as Abi,
    },
} as const;
