// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/BountyEscrow.sol";
import "../src/ReputationNFT.sol";
import "../src/SkillRegistry.sol";
import "../src/ERC5564Announcer.sol";

/// @dev Mock verifier for testing
contract MockVerifier {
    function verify(
        bytes calldata,
        bytes32[] calldata
    ) external pure returns (bool) {
        return true;
    }
}

contract BountyEscrowTest is Test {
    BountyEscrow public escrow;
    ReputationNFT public nft;
    SkillRegistry public registry;
    ERC5564Announcer public announcer;
    MockVerifier public verifier;

    address public deployer = makeAddr("deployer");
    address public poster = makeAddr("poster");
    address public hunter1 = makeAddr("hunter1");
    address public hunter2 = makeAddr("hunter2");
    address public random = makeAddr("random");
    address public freshWallet = makeAddr("freshWallet");

    bytes public dummyProof = hex"deadbeef";
    bytes32[] public bandInputs;
    bytes public dummyEphemeralPubKey = hex"02deadbeefcafebabe1234567890abcdef1234567890abcdef1234567890abcdef12";
    bytes public dummyViewTag = hex"ab";

    uint256 public futureDeadline;
    bytes32 public lockId = keccak256("lock-1");
    bytes32 public walletId = keccak256("wallet-1");

    function setUp() public {
        futureDeadline = block.timestamp + 30 days;

        bandInputs = new bytes32[](1);
        bandInputs[0] = bytes32(uint256(4));

        vm.startPrank(deployer);
        verifier = new MockVerifier();
        nft = new ReputationNFT(address(verifier));
        registry = new SkillRegistry();
        announcer = new ERC5564Announcer();
        escrow = new BountyEscrow(address(nft), address(registry), address(announcer));
        registry.setBountyEscrow(address(escrow));
        vm.stopPrank();

        // Mint ReputationNFTs for hunters
        vm.prank(hunter1);
        nft.mint(dummyProof, bandInputs, "hunter1.eth");

        vm.prank(hunter2);
        nft.mint(dummyProof, bandInputs, "hunter2.eth");
    }

    // =========================================================
    // HELPERS
    // =========================================================

    function _postBounty() internal returns (uint256) {
        return _postBountyWithBrief("");
    }

    function _postBountyWithBrief(
        string memory brief
    ) internal returns (uint256) {
        vm.prank(poster);
        return
            escrow.postBounty(
                BountyEscrow.PostBountyParams({
                    posterENS: "poster.eth",
                    title: "Build DApp",
                    description: "Build a DApp for DarkEarn",
                    categoryId: 0,
                    deadline: futureDeadline,
                    prizeAmount: 1 ether,
                    privateBriefFileverseId: brief,
                    bitgoWalletId: walletId,
                    bitgoLockId: lockId
                })
            );
    }

    function _applyAndAcceptHunter1(uint256 bountyId) internal {
        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "I can build this");

        vm.prank(poster);
        escrow.revealApplicant(bountyId, 1);

        vm.prank(poster);
        escrow.acceptApplication(bountyId, hunter1);
    }

    function _submitAndApprove(uint256 bountyId) internal {
        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        vm.prank(poster);
        escrow.approveWork(bountyId);
    }

    function _getBountyStatus(
        uint256 bountyId
    ) internal view returns (BountyEscrow.BountyStatus) {
        return escrow.getBountyStatus(bountyId);
    }

    // =========================================================
    // POST BOUNTY TESTS
    // =========================================================

    // Test 1: Post with valid params succeeds
    function test_postBountySucceeds() public {
        uint256 id = _postBounty();
        assertEq(id, 1);
        assertEq(
            uint256(_getBountyStatus(id)),
            uint256(BountyEscrow.BountyStatus.Open)
        );
    }

    // Test 2: Post with empty bitgoLockId reverts
    function test_postEmptyLockIdReverts() public {
        vm.prank(poster);
        vm.expectRevert(BountyEscrow.FundsNotLockedInBitGo.selector);
        escrow.postBounty(
            BountyEscrow.PostBountyParams({
                posterENS: "poster.eth",
                title: "Build DApp",
                description: "desc",
                categoryId: 0,
                deadline: futureDeadline,
                prizeAmount: 1 ether,
                privateBriefFileverseId: "",
                bitgoWalletId: walletId,
                bitgoLockId: bytes32(0)
            })
        );
    }

    // Test 3: Post with past deadline reverts
    function test_postPastDeadlineReverts() public {
        vm.prank(poster);
        vm.expectRevert(BountyEscrow.DeadlineInPast.selector);
        escrow.postBounty(
            BountyEscrow.PostBountyParams({
                posterENS: "poster.eth",
                title: "Build DApp",
                description: "desc",
                categoryId: 0,
                deadline: block.timestamp - 1,
                prizeAmount: 1 ether,
                privateBriefFileverseId: "",
                bitgoWalletId: walletId,
                bitgoLockId: lockId
            })
        );
    }

    // Test 4: Post with invalid categoryId reverts
    function test_postInvalidCategoryReverts() public {
        vm.prank(poster);
        vm.expectRevert(BountyEscrow.InvalidCategoryId.selector);
        escrow.postBounty(
            BountyEscrow.PostBountyParams({
                posterENS: "poster.eth",
                title: "Build DApp",
                description: "desc",
                categoryId: 6,
                deadline: futureDeadline,
                prizeAmount: 1 ether,
                privateBriefFileverseId: "",
                bitgoWalletId: walletId,
                bitgoLockId: lockId
            })
        );
    }

    // =========================================================
    // APPLICATION TESTS
    // =========================================================

    // Test 5: Apply with valid ReputationNFT succeeds anonymously
    function test_applySucceedsAnonymously() public {
        uint256 bountyId = _postBounty();

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "I can do this");

        // Verify anonymous view - no ENS name until revealed
        (
            uint256 applicantId,
            ,
            bool isRevealed,
            ,
            string memory ensName
        ) = escrow.getApplicant(bountyId, 1);
        assertEq(applicantId, 1);
        assertFalse(isRevealed);
        assertEq(bytes(ensName).length, 0); // NOT revealed
    }

    // Test 6: Apply without ReputationNFT reverts
    function test_applyWithoutNFTReverts() public {
        uint256 bountyId = _postBounty();

        vm.prank(random); // random has no NFT
        vm.expectRevert(BountyEscrow.NoReputationNFT.selector);
        escrow.applyToBounty(bountyId, "random.eth", "test");
    }

    // Test 7: Apply after deadline reverts
    function test_applyAfterDeadlineReverts() public {
        uint256 bountyId = _postBounty();

        vm.warp(futureDeadline + 1);
        vm.prank(hunter1);
        vm.expectRevert(BountyEscrow.DeadlinePassed.selector);
        escrow.applyToBounty(bountyId, "hunter1.eth", "test");
    }

    // Test 8: Apply twice same address same bounty reverts
    function test_applyTwiceReverts() public {
        uint256 bountyId = _postBounty();

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "first");

        vm.prank(hunter1);
        vm.expectRevert(BountyEscrow.AlreadyApplied.selector);
        escrow.applyToBounty(bountyId, "hunter1.eth", "second");
    }

    // Test 9: Poster reads applicant list - sees Applicant #1 and #2, no ENS names
    function test_applicantsAreAnonymous() public {
        uint256 bountyId = _postBounty();

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg1");

        vm.prank(hunter2);
        escrow.applyToBounty(bountyId, "hunter2.eth", "msg2");

        // Check both are anonymous
        (uint256 id1, , bool r1, , string memory ens1) = escrow.getApplicant(
            bountyId,
            1
        );
        (uint256 id2, , bool r2, , string memory ens2) = escrow.getApplicant(
            bountyId,
            2
        );

        assertEq(id1, 1);
        assertEq(id2, 2);
        assertFalse(r1);
        assertFalse(r2);
        assertEq(bytes(ens1).length, 0);
        assertEq(bytes(ens2).length, 0);
    }

    // =========================================================
    // REVEAL & ACCEPT TESTS
    // =========================================================

    // Test 10: revealApplicant by poster succeeds
    function test_revealByPosterSucceeds() public {
        uint256 bountyId = _postBounty();
        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.prank(poster);
        escrow.revealApplicant(bountyId, 1);

        (, , bool isRevealed, , string memory ensName) = escrow.getApplicant(
            bountyId,
            1
        );
        assertTrue(isRevealed);
        assertEq(keccak256(bytes(ensName)), keccak256(bytes("hunter1.eth")));
    }

    // Test 11: revealApplicant by non-poster reverts
    function test_revealByNonPosterReverts() public {
        uint256 bountyId = _postBounty();
        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.prank(random);
        vm.expectRevert(BountyEscrow.NotPoster.selector);
        escrow.revealApplicant(bountyId, 1);
    }

    // Test 12: acceptApplication after reveal succeeds
    function test_acceptAfterRevealSucceeds() public {
        uint256 bountyId = _postBountyWithBrief("fv-brief-123");

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.prank(poster);
        escrow.revealApplicant(bountyId, 1);

        vm.prank(poster);
        escrow.acceptApplication(bountyId, hunter1);

        (, , , bool isAccepted, ) = escrow.getApplicant(bountyId, 1);
        assertTrue(isAccepted);
    }

    // Test 13: acceptApplication without reveal reverts
    function test_acceptWithoutRevealReverts() public {
        uint256 bountyId = _postBounty();
        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.prank(poster);
        vm.expectRevert(BountyEscrow.NotRevealed.selector);
        escrow.acceptApplication(bountyId, hunter1);
    }

    // =========================================================
    // WORK SUBMISSION & APPROVAL TESTS
    // =========================================================

    // Test 14: submitWork by accepted winner succeeds
    function test_submitWorkByWinnerSucceeds() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");
    }

    // Test 15: submitWork by non-winner reverts
    function test_submitWorkByNonWinnerReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(random);
        vm.expectRevert(BountyEscrow.NotWinner.selector);
        escrow.submitWork(bountyId, "fv-doc-123");
    }

    // Test 16: approveWork by poster after submission succeeds
    function test_approveWorkSucceeds() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        _submitAndApprove(bountyId);

        assertEq(
            uint256(_getBountyStatus(bountyId)),
            uint256(BountyEscrow.BountyStatus.Completed)
        );

        // Verify skill was recorded
        assertEq(registry.getCompletionsInCategory(hunter1, 0), 1);
    }

    // Test 17: approveWork by non-poster reverts
    function test_approveByNonPosterReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        vm.prank(random);
        vm.expectRevert(BountyEscrow.NotPoster.selector);
        escrow.approveWork(bountyId);
    }

    // Test 18: approveWork when workSubmitted is false reverts
    function test_approveBeforeSubmitReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(poster);
        vm.expectRevert(BountyEscrow.WorkNotSubmitted.selector);
        escrow.approveWork(bountyId);
    }

    // =========================================================
    // PAYMENT TESTS
    // =========================================================

    // Test 19: claimPayment by winner with stealth address succeeds
    function test_claimPaymentSucceeds() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        _submitAndApprove(bountyId);

        vm.prank(hunter1);
        escrow.claimPayment(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);
    }

    // Test 20: claimPayment to own wallet reverts
    function test_claimPaymentToOwnWalletReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        _submitAndApprove(bountyId);

        vm.prank(hunter1);
        vm.expectRevert("Cannot pay your own wallet");
        escrow.claimPayment(bountyId, hunter1, dummyEphemeralPubKey, dummyViewTag);
    }

    // Test 21: claimPayment twice reverts
    function test_claimPaymentTwiceReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        _submitAndApprove(bountyId);

        vm.prank(hunter1);
        escrow.claimPayment(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);

        vm.prank(hunter1);
        vm.expectRevert(BountyEscrow.PaymentAlreadyMade.selector);
        escrow.claimPayment(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);
    }

    // Test 22: claimPayment by non-winner reverts
    function test_claimPaymentByNonWinnerReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);
        _submitAndApprove(bountyId);

        vm.prank(random);
        vm.expectRevert(BountyEscrow.NotWinner.selector);
        escrow.claimPayment(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);
    }

    // =========================================================
    // CANCEL & REFUND TESTS
    // =========================================================

    // Test 23: cancelBounty with zero applications succeeds
    function test_cancelWithZeroApplicantsSucceeds() public {
        uint256 bountyId = _postBounty();

        vm.prank(poster);
        escrow.cancelBounty(bountyId);

        assertEq(
            uint256(_getBountyStatus(bountyId)),
            uint256(BountyEscrow.BountyStatus.Cancelled)
        );
    }

    // Test 24: cancelBounty with existing applications reverts
    function test_cancelWithApplicantsReverts() public {
        uint256 bountyId = _postBounty();

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.prank(poster);
        vm.expectRevert(BountyEscrow.HasApplications.selector);
        escrow.cancelBounty(bountyId);
    }

    // Test 25: refundExpiredBounty before deadline reverts
    function test_refundBeforeDeadlineReverts() public {
        uint256 bountyId = _postBounty();

        vm.prank(poster);
        vm.expectRevert(BountyEscrow.DeadlineNotPassed.selector);
        escrow.refundExpiredBounty(bountyId);
    }

    // Test 26: refundExpiredBounty after deadline with zero applicants succeeds
    function test_refundExpiredSucceeds() public {
        uint256 bountyId = _postBounty();

        vm.warp(futureDeadline + 1);
        vm.prank(poster);
        escrow.refundExpiredBounty(bountyId);

        assertEq(
            uint256(_getBountyStatus(bountyId)),
            uint256(BountyEscrow.BountyStatus.Refunded)
        );
    }

    // Test 27: refundExpiredBounty after deadline with applicants reverts
    function test_refundExpiredWithApplicantsReverts() public {
        uint256 bountyId = _postBounty();

        vm.prank(hunter1);
        escrow.applyToBounty(bountyId, "hunter1.eth", "msg");

        vm.warp(futureDeadline + 1);
        vm.prank(poster);
        vm.expectRevert(BountyEscrow.HasApplications.selector);
        escrow.refundExpiredBounty(bountyId);
    }

    // =========================================================
    // DISPUTE TESTS
    // =========================================================

    // Test 28: raiseDispute before 7 days reverts
    function test_disputeBefore7DaysReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        // Try to dispute immediately (before 7 days)
        vm.prank(hunter1);
        vm.expectRevert(BountyEscrow.DisputeWindowNotPassed.selector);
        escrow.raiseDispute(bountyId);
    }

    // Test 29: raiseDispute after 7 days succeeds
    function test_disputeAfter7DaysSucceeds() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        vm.warp(block.timestamp + 7 days + 1);

        vm.prank(hunter1);
        escrow.raiseDispute(bountyId);

        assertEq(
            uint256(_getBountyStatus(bountyId)),
            uint256(BountyEscrow.BountyStatus.Disputed)
        );
    }

    // Test 30: resolveDispute before 48 hours reverts
    function test_resolveDisputeBefore48hReverts() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        vm.warp(block.timestamp + 7 days + 1);
        vm.prank(hunter1);
        escrow.raiseDispute(bountyId);

        // Try resolving immediately (before 48h)
        vm.prank(random);
        vm.expectRevert(BountyEscrow.DisputeResolutionTooEarly.selector);
        escrow.resolveDispute(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);
    }

    // Test 31: resolveDispute after 48 hours succeeds with 50/50 split
    function test_resolveDisputeAfter48hSucceeds() public {
        uint256 bountyId = _postBounty();
        _applyAndAcceptHunter1(bountyId);

        vm.prank(hunter1);
        escrow.submitWork(bountyId, "fv-doc-123");

        vm.warp(block.timestamp + 7 days + 1);
        vm.prank(hunter1);
        escrow.raiseDispute(bountyId);

        vm.warp(block.timestamp + 48 hours + 1);
        vm.prank(random);
        escrow.resolveDispute(bountyId, freshWallet, dummyEphemeralPubKey, dummyViewTag);

        assertEq(
            uint256(_getBountyStatus(bountyId)),
            uint256(BountyEscrow.BountyStatus.Refunded)
        );
    }

    // =========================================================
    // PRIVATE BID TEST
    // =========================================================

    // Test 32: sendPrivateBid emits correctly
    function test_sendPrivateBidEmits() public {
        bytes memory encryptedBid = hex"aabbccdd";

        vm.prank(poster);
        vm.expectEmit(true, true, false, true);
        emit BountyEscrow.PrivateBidSent(hunter1, poster, encryptedBid);
        escrow.sendPrivateBid(hunter1, encryptedBid);
    }
}
