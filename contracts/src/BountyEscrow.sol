// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./ReputationNFT.sol";
import "./SkillRegistry.sol";

/// @title BountyEscrow - Full DarkEarn bounty lifecycle
/// @notice Anonymous applications, privacy-enforced payments, dispute resolution
contract BountyEscrow {
    // --- Enums ---
    enum BountyStatus {
        Open,
        InProgress,
        Completed,
        Cancelled,
        Disputed,
        Refunded
    }

    // --- Structs ---
    struct Bounty {
        uint256 bountyId;
        address posterAddress;
        string posterENS;
        string title;
        string description;
        uint256 categoryId;
        uint256 deadline;
        uint256 prizeAmount;
        bytes32 publicBriefHash;
        string privateBriefFileverseId;
        bytes32 bitgoWalletId;
        bytes32 bitgoLockId;
        BountyStatus status;
        uint256 applicantCount;
        address winner;
        bool workSubmitted;
        bool paymentClaimed;
        uint256 disputeRaisedAt;
        string workFileverseId;
        uint256 workSubmittedAt;
    }

    struct Application {
        address applicantAddress;
        string applicantENS;
        string applicationMessage;
        uint256 applicantId;
        bool isRevealed;
        bool isAccepted;
    }

    // --- State ---
    ReputationNFT public immutable reputationNFT;
    SkillRegistry public immutable skillRegistry;

    uint256 public nextBountyId;
    mapping(uint256 => Bounty) internal _bounties;

    // bountyId => applicantId => Application
    mapping(uint256 => mapping(uint256 => Application)) public applications;
    // bountyId => applicant address => applicantId (for lookup)
    mapping(uint256 => mapping(address => uint256)) public applicantAddressToId;
    // bountyId => applicant address => has applied
    mapping(uint256 => mapping(address => bool)) public hasApplied;

    uint256 public constant DISPUTE_WINDOW = 7 days;
    uint256 public constant DISPUTE_RESOLUTION_DELAY = 48 hours;
    uint256 public constant MAX_CATEGORY_ID = 5;

    // --- Events ---
    event BountyPosted(uint256 indexed bountyId, address indexed poster);
    event ApplicationSubmitted(uint256 indexed bountyId, uint256 applicantId);
    event ApplicantRevealed(
        uint256 indexed bountyId,
        uint256 applicantId,
        string applicantENS
    );
    event ApplicationAccepted(uint256 indexed bountyId, address winner);
    event PrivateBriefShared(
        uint256 indexed bountyId,
        address indexed winner,
        string fileverseId
    );
    event WorkSubmitted(
        uint256 indexed bountyId,
        address indexed poster,
        string fileverseId
    );
    event WorkApproved(uint256 indexed bountyId, address indexed winner);
    event PaymentClaimed(
        uint256 indexed bountyId,
        address indexed winner,
        address recipient,
        uint256 amount
    );
    event BountyCancelled(uint256 indexed bountyId, bytes32 bitgoLockId);
    event BountyRefunded(uint256 indexed bountyId, bytes32 bitgoLockId);
    event DisputeRaised(
        uint256 indexed bountyId,
        address indexed hunter,
        uint256 disputeRaisedAt
    );
    event PrivateBidSent(
        address indexed contributor,
        address indexed poster,
        bytes encryptedBid
    );

    // --- Errors ---
    error FundsNotLockedInBitGo();
    error DeadlineInPast();
    error InvalidCategoryId();
    error BountyNotOpen();
    error DeadlinePassed();
    error NoReputationNFT();
    error AlreadyApplied();
    error NotPoster();
    error InvalidApplicantId();
    error NotRevealed();
    error AlreadyAccepted();
    error NotWinner();
    error BountyNotInProgress();
    error WorkNotSubmitted();
    error WorkAlreadySubmitted();
    error PaymentAlreadyMade();
    error BountyNotCompleted();
    error CannotPayENSWallet();
    error HasApplications();
    error DeadlineNotPassed();
    error NoApplicationsRequired();
    error DisputeWindowNotPassed();
    error InvalidDisputeStatus();
    error DisputeResolutionTooEarly();
    error BountyNotDisputed();
    error EmptyTitle();
    error EmptyPosterENS();

    constructor(address _reputationNFT, address _skillRegistry) {
        reputationNFT = ReputationNFT(_reputationNFT);
        skillRegistry = SkillRegistry(_skillRegistry);
        nextBountyId = 1;
    }

    // =========================================================
    // POSTING
    // =========================================================

    // --- Input Structs ---
    struct PostBountyParams {
        string posterENS;
        string title;
        string description;
        uint256 categoryId;
        uint256 deadline;
        uint256 prizeAmount;
        string privateBriefFileverseId;
        bytes32 bitgoWalletId;
        bytes32 bitgoLockId;
    }

    function postBounty(
        PostBountyParams calldata p
    ) external returns (uint256) {
        if (bytes(p.posterENS).length == 0) revert EmptyPosterENS();
        if (bytes(p.title).length == 0) revert EmptyTitle();
        if (p.bitgoLockId == bytes32(0)) revert FundsNotLockedInBitGo();
        if (p.deadline <= block.timestamp) revert DeadlineInPast();
        if (p.categoryId > MAX_CATEGORY_ID) revert InvalidCategoryId();

        uint256 bountyId = nextBountyId++;

        Bounty storage b = _bounties[bountyId];
        b.bountyId = bountyId;
        b.posterAddress = msg.sender;
        b.posterENS = p.posterENS;
        b.title = p.title;
        b.description = p.description;
        b.categoryId = p.categoryId;
        b.deadline = p.deadline;
        b.prizeAmount = p.prizeAmount;
        b.publicBriefHash = keccak256(abi.encodePacked(p.description));
        b.privateBriefFileverseId = p.privateBriefFileverseId;
        b.bitgoWalletId = p.bitgoWalletId;
        b.bitgoLockId = p.bitgoLockId;
        b.status = BountyStatus.Open;

        emit BountyPosted(bountyId, msg.sender);

        return bountyId;
    }

    // =========================================================
    // APPLICATIONS (anonymous)
    // =========================================================

    function applyToBounty(
        uint256 _bountyId,
        string calldata _ensName,
        string calldata _message
    ) external {
        Bounty storage b = _bounties[_bountyId];
        if (b.status != BountyStatus.Open) revert BountyNotOpen();
        if (block.timestamp >= b.deadline) revert DeadlinePassed();
        if (reputationNFT.balanceOf(msg.sender) == 0) revert NoReputationNFT();
        if (hasApplied[_bountyId][msg.sender]) revert AlreadyApplied();

        b.applicantCount++;
        uint256 applicantId = b.applicantCount;

        Application storage app = applications[_bountyId][applicantId];
        app.applicantAddress = msg.sender;
        app.applicantENS = _ensName;
        app.applicationMessage = _message;
        app.applicantId = applicantId;

        applicantAddressToId[_bountyId][msg.sender] = applicantId;
        hasApplied[_bountyId][msg.sender] = true;

        // Event only shows bountyId and applicantId - NO identity data
        emit ApplicationSubmitted(_bountyId, applicantId);
    }

    // =========================================================
    // REVEAL & ACCEPT
    // =========================================================

    function revealApplicant(uint256 _bountyId, uint256 _applicantId) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.posterAddress) revert NotPoster();
        if (_applicantId == 0 || _applicantId > b.applicantCount)
            revert InvalidApplicantId();

        Application storage app = applications[_bountyId][_applicantId];
        app.isRevealed = true;

        emit ApplicantRevealed(_bountyId, _applicantId, app.applicantENS);
    }

    function acceptApplication(
        uint256 _bountyId,
        address _applicantAddress
    ) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.posterAddress) revert NotPoster();

        uint256 applicantId = applicantAddressToId[_bountyId][
            _applicantAddress
        ];
        if (applicantId == 0) revert InvalidApplicantId();

        Application storage app = applications[_bountyId][applicantId];
        if (!app.isRevealed) revert NotRevealed();
        if (app.isAccepted) revert AlreadyAccepted();

        app.isAccepted = true;
        b.status = BountyStatus.InProgress;
        b.winner = _applicantAddress;

        emit ApplicationAccepted(_bountyId, _applicantAddress);

        // Share private brief with winner if it exists
        if (bytes(b.privateBriefFileverseId).length > 0) {
            emit PrivateBriefShared(
                _bountyId,
                _applicantAddress,
                b.privateBriefFileverseId
            );
        }
    }

    // =========================================================
    // WORK SUBMISSION & APPROVAL
    // =========================================================

    function submitWork(
        uint256 _bountyId,
        string calldata _fileverseId
    ) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.winner) revert NotWinner();
        if (b.status != BountyStatus.InProgress) revert BountyNotInProgress();
        if (b.workSubmitted) revert WorkAlreadySubmitted();

        b.workSubmitted = true;
        b.workFileverseId = _fileverseId;
        b.workSubmittedAt = block.timestamp;

        // Event indexed by poster address so poster's frontend picks it up
        emit WorkSubmitted(_bountyId, b.posterAddress, _fileverseId);
    }

    function approveWork(uint256 _bountyId) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.posterAddress) revert NotPoster();
        if (!b.workSubmitted) revert WorkNotSubmitted();

        b.status = BountyStatus.Completed;

        // Auto-record skill completion
        skillRegistry.recordCompletion(b.winner, b.categoryId);

        emit WorkApproved(_bountyId, b.winner);
    }

    // =========================================================
    // PAYMENT (privacy enforced)
    // =========================================================

    function claimPayment(uint256 _bountyId, address _recipient) external {
        Bounty storage b = _bounties[_bountyId];
        if (b.status != BountyStatus.Completed) revert BountyNotCompleted();
        if (msg.sender != b.winner) revert NotWinner();
        if (b.paymentClaimed) revert PaymentAlreadyMade();

        // PRIVACY ENFORCEMENT: recipient must NOT be the winner's ENS-linked wallet
        // Look up winner's application to get their ENS name, then get their minter address
        uint256 winnerApplicantId = applicantAddressToId[_bountyId][b.winner];
        Application storage winnerApp = applications[_bountyId][
            winnerApplicantId
        ];
        uint256 winnerTokenId = reputationNFT.ensToTokenId(
            winnerApp.applicantENS
        );
        address ensWallet = reputationNFT.tokenIdToMinter(winnerTokenId);
        if (_recipient == ensWallet) revert CannotPayENSWallet();

        b.paymentClaimed = true;

        // BitGo service listens for this event and releases funds
        emit PaymentClaimed(_bountyId, b.winner, _recipient, b.prizeAmount);
    }

    // =========================================================
    // CANCEL & REFUND
    // =========================================================

    function cancelBounty(uint256 _bountyId) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.posterAddress) revert NotPoster();
        if (b.applicantCount > 0) revert HasApplications();
        if (b.status != BountyStatus.Open) revert BountyNotOpen();

        b.status = BountyStatus.Cancelled;
        emit BountyCancelled(_bountyId, b.bitgoLockId);
    }

    function refundExpiredBounty(uint256 _bountyId) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.posterAddress) revert NotPoster();
        if (block.timestamp <= b.deadline) revert DeadlineNotPassed();
        if (b.applicantCount > 0) revert HasApplications();
        if (b.status != BountyStatus.Open) revert BountyNotOpen();

        b.status = BountyStatus.Refunded;
        emit BountyRefunded(_bountyId, b.bitgoLockId);
    }

    // =========================================================
    // DISPUTES
    // =========================================================

    function raiseDispute(uint256 _bountyId) external {
        Bounty storage b = _bounties[_bountyId];
        if (msg.sender != b.winner) revert NotWinner();
        if (!b.workSubmitted) revert WorkNotSubmitted();
        if (b.status != BountyStatus.InProgress) revert InvalidDisputeStatus();
        if (block.timestamp < b.workSubmittedAt + DISPUTE_WINDOW)
            revert DisputeWindowNotPassed();

        b.status = BountyStatus.Disputed;
        b.disputeRaisedAt = block.timestamp;

        emit DisputeRaised(_bountyId, msg.sender, block.timestamp);
    }

    function resolveDispute(
        uint256 _bountyId,
        address _hunterFreshAddress
    ) external {
        Bounty storage b = _bounties[_bountyId];
        if (b.status != BountyStatus.Disputed) revert BountyNotDisputed();
        if (block.timestamp < b.disputeRaisedAt + DISPUTE_RESOLUTION_DELAY)
            revert DisputeResolutionTooEarly();

        b.status = BountyStatus.Refunded;

        uint256 halfPrize = b.prizeAmount / 2;

        // 50% to hunter's fresh address
        emit PaymentClaimed(
            _bountyId,
            b.winner,
            _hunterFreshAddress,
            halfPrize
        );
        // 50% refund signal to poster
        emit PaymentClaimed(
            _bountyId,
            b.posterAddress,
            b.posterAddress,
            halfPrize
        );
    }

    // =========================================================
    // PRIVATE BIDS
    // =========================================================

    function sendPrivateBid(
        address _contributor,
        bytes calldata _encryptedBid
    ) external {
        emit PrivateBidSent(_contributor, msg.sender, _encryptedBid);
    }

    // =========================================================
    // VIEW FUNCTIONS
    // =========================================================

    /// @notice Get anonymous applicant info (no identity unless revealed)
    function getApplicant(
        uint256 _bountyId,
        uint256 _applicantId
    )
        external
        view
        returns (
            uint256 applicantId,
            string memory message,
            bool isRevealed,
            bool isAccepted,
            string memory ensName
        )
    {
        Application storage app = applications[_bountyId][_applicantId];
        applicantId = app.applicantId;
        message = app.applicationMessage;
        isRevealed = app.isRevealed;
        isAccepted = app.isAccepted;
        // Only show ENS name if revealed
        if (app.isRevealed) {
            ensName = app.applicantENS;
        }
    }

    /// @notice Get bounty status
    function getBountyStatus(
        uint256 _bountyId
    ) external view returns (BountyStatus) {
        return _bounties[_bountyId].status;
    }

    /// @notice Get core bounty info
    function getBountyCore(
        uint256 _bountyId
    )
        external
        view
        returns (
            uint256 bountyId,
            address posterAddress,
            string memory posterENS,
            string memory title,
            uint256 categoryId,
            uint256 deadline,
            uint256 prizeAmount,
            BountyStatus status
        )
    {
        Bounty storage b = _bounties[_bountyId];
        return (
            b.bountyId,
            b.posterAddress,
            b.posterENS,
            b.title,
            b.categoryId,
            b.deadline,
            b.prizeAmount,
            b.status
        );
    }

    /// @notice Get bounty work and payment info
    function getBountyMeta(
        uint256 _bountyId
    )
        external
        view
        returns (
            address winner,
            bool workSubmitted,
            bool paymentClaimed,
            uint256 applicantCount,
            uint256 disputeRaisedAt,
            bytes32 bitgoLockId
        )
    {
        Bounty storage b = _bounties[_bountyId];
        return (
            b.winner,
            b.workSubmitted,
            b.paymentClaimed,
            b.applicantCount,
            b.disputeRaisedAt,
            b.bitgoLockId
        );
    }
}
