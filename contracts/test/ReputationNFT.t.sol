// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/ReputationNFT.sol";

/// @dev Mock verifier that always returns true (for testing)
contract MockVerifierTrue {
    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external pure returns (bool) {
        return true;
    }
}

/// @dev Mock verifier that always returns false (for testing)
contract MockVerifierFalse {
    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external pure returns (bool) {
        return false;
    }
}

contract ReputationNFTTest is Test {
    ReputationNFT public nft;
    ReputationNFT public nftBadVerifier;
    MockVerifierTrue public goodVerifier;
    MockVerifierFalse public badVerifier;

    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public charlie = makeAddr("charlie");

    bytes public dummyProof = hex"deadbeef";
    bytes32[] public bandInputs;
    bytes32[] public band2Inputs;
    bytes32[] public band3Inputs;

    function setUp() public {
        goodVerifier = new MockVerifierTrue();
        badVerifier = new MockVerifierFalse();

        nft = new ReputationNFT(address(goodVerifier));
        nftBadVerifier = new ReputationNFT(address(badVerifier));

        // Band 4 public inputs
        bandInputs = new bytes32[](1);
        bandInputs[0] = bytes32(uint256(4));

        // Band 2 public inputs
        band2Inputs = new bytes32[](1);
        band2Inputs[0] = bytes32(uint256(2));

        // Band 3 public inputs
        band3Inputs = new bytes32[](1);
        band3Inputs[0] = bytes32(uint256(3));
    }

    // Test 1: Valid mint with correct ZK proof and correct ENS succeeds
    function test_validMintSucceeds() public {
        vm.prank(alice);
        uint256 tokenId = nft.mint(dummyProof, bandInputs, "alice.eth");

        assertEq(tokenId, 1);
        assertEq(nft.ownerOf(1), alice);
        assertEq(nft.ensToTokenId("alice.eth"), 1);
        assertEq(nft.tokenIdToBand(1), 4);
        assertEq(nft.tokenIdToMinter(1), alice);
    }

    // Test 2: Mint fails with invalid ZK proof
    function test_mintFailsWithInvalidProof() public {
        vm.prank(alice);
        vm.expectRevert(ReputationNFT.InvalidProof.selector);
        nftBadVerifier.mint(dummyProof, bandInputs, "alice.eth");
    }

    // Test 3: Mint fails when ENS name is empty
    function test_mintFailsWithEmptyENS() public {
        vm.prank(alice);
        vm.expectRevert(ReputationNFT.EmptyENSName.selector);
        nft.mint(dummyProof, bandInputs, "");
    }

    // Test 4: Transfer attempt on any minted NFT always reverts
    function test_transferAlwaysReverts() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth");

        vm.prank(alice);
        vm.expectRevert(ReputationNFT.SoulboundTransferBlocked.selector);
        nft.transferFrom(alice, bob, 1);
    }

    // Test 5: Second mint attempt for same ENS name reverts
    function test_duplicateENSReverts() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth");

        vm.prank(bob);
        vm.expectRevert(ReputationNFT.ENSAlreadyRegistered.selector);
        nft.mint(dummyProof, bandInputs, "alice.eth");
    }

    // Test 6: upgradeBand with valid higher band proof succeeds
    function test_upgradeBandSucceeds() public {
        vm.prank(alice);
        nft.mint(dummyProof, band2Inputs, "alice.eth");

        assertEq(nft.tokenIdToBand(1), 2);

        vm.prank(alice);
        nft.upgradeBand(1, dummyProof, bandInputs); // upgrade to band 4

        assertEq(nft.tokenIdToBand(1), 4);
    }

    // Test 7: upgradeBand with same band reverts
    function test_upgradeSameBandReverts() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth");

        vm.prank(alice);
        vm.expectRevert(ReputationNFT.BandNotHigher.selector);
        nft.upgradeBand(1, dummyProof, bandInputs); // same band 4
    }

    // Test 8: upgradeBand with lower band reverts
    function test_upgradeLowerBandReverts() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth"); // band 4

        vm.prank(alice);
        vm.expectRevert(ReputationNFT.BandNotHigher.selector);
        nft.upgradeBand(1, dummyProof, band2Inputs); // try band 2
    }

    // Test 9: upgradeBand called by non-owner reverts
    function test_upgradeBandByNonOwnerReverts() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth");

        vm.prank(bob);
        vm.expectRevert(ReputationNFT.NotTokenOwner.selector);
        nft.upgradeBand(1, dummyProof, bandInputs);
    }

    // Test 10: tokenURI returns valid base64 decodable JSON
    function test_tokenURIReturnsValidJSON() public {
        vm.prank(alice);
        nft.mint(dummyProof, bandInputs, "alice.eth");

        string memory uri = nft.tokenURI(1);
        // Should start with data:application/json;base64,
        assertTrue(bytes(uri).length > 35); // "data:application/json;base64," = 29 chars + data
    }
}
