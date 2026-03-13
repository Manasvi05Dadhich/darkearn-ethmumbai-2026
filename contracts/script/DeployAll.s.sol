// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Script.sol";
import "../src/ReputationVerifier.sol";
import "../src/ReputationNFT.sol";
import "../src/SkillRegistry.sol";
import "../src/BountyEscrow.sol";

/// @title DeployAll - Atomic deployment of all DarkEarn contracts
/// @notice Deploys in order: HonkVerifier -> ReputationNFT -> SkillRegistry -> BountyEscrow
/// @dev Run: forge script script/DeployAll.s.sol --rpc-url $BASE_SEPOLIA_RPC_URL --private-key $DEPLOYER_PRIVATE_KEY --broadcast
contract DeployAll is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Deploy HonkVerifier
        HonkVerifier verifier = new HonkVerifier();
        console.log("HonkVerifier deployed at:", address(verifier));

        // 2. Deploy ReputationNFT
        ReputationNFT nft = new ReputationNFT(address(verifier));
        console.log("ReputationNFT deployed at:", address(nft));

        // 3. Deploy SkillRegistry
        SkillRegistry registry = new SkillRegistry();
        console.log("SkillRegistry deployed at:", address(registry));

        // 4. Deploy BountyEscrow
        BountyEscrow escrow = new BountyEscrow(address(nft), address(registry));
        console.log("BountyEscrow deployed at:", address(escrow));

        // 5. Link SkillRegistry to BountyEscrow
        registry.setBountyEscrow(address(escrow));
        console.log("SkillRegistry linked to BountyEscrow");

        vm.stopBroadcast();

        // 6. Write all addresses atomically to addresses.json
        string memory json = string(
            abi.encodePacked(
                "{\n",
                '  "HonkVerifier": "',
                vm.toString(address(verifier)),
                '",\n',
                '  "ReputationNFT": "',
                vm.toString(address(nft)),
                '",\n',
                '  "SkillRegistry": "',
                vm.toString(address(registry)),
                '",\n',
                '  "BountyEscrow": "',
                vm.toString(address(escrow)),
                '"\n',
                "}"
            )
        );

        vm.writeFile("../addresses.json", json);
        console.log("addresses.json written with all 4 contract addresses");
    }
}
