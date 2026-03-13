// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/access/Ownable.sol";

/// @title SkillRegistry - Records skill completions from bounty work
/// @notice 3+ completions in a category = verified badge. Only BountyEscrow can record.
contract SkillRegistry is Ownable {
    // --- State ---
    address public bountyEscrow;

    // contributor => categoryId => completion count
    mapping(address => mapping(uint256 => uint256)) public completions;

    // contributor => list of categories they have completions in (for enumeration)
    mapping(address => uint256[]) private _contributorCategories;
    mapping(address => mapping(uint256 => bool)) private _hasCategoryEntry;

    uint256 public constant VERIFICATION_THRESHOLD = 3;
    uint256 public constant MAX_CATEGORY_ID = 5;

    // --- Events ---
    event CompletionRecorded(
        address indexed contributor,
        uint256 indexed categoryId,
        uint256 newCount
    );
    event BountyEscrowSet(address indexed bountyEscrow);

    // --- Errors ---
    error OnlyBountyEscrow();
    error BountyEscrowAlreadySet();
    error InvalidCategoryId();
    error ZeroAddress();

    constructor() Ownable(msg.sender) {}

    /// @notice Set the BountyEscrow address (callable once by owner)
    function setBountyEscrow(address _bountyEscrow) external onlyOwner {
        if (_bountyEscrow == address(0)) revert ZeroAddress();
        if (bountyEscrow != address(0)) revert BountyEscrowAlreadySet();
        bountyEscrow = _bountyEscrow;
        emit BountyEscrowSet(_bountyEscrow);
    }

    /// @notice Record a skill completion for a contributor
    /// @dev Only callable by the BountyEscrow contract
    function recordCompletion(
        address _contributor,
        uint256 _categoryId
    ) external {
        if (msg.sender != bountyEscrow) revert OnlyBountyEscrow();
        if (_categoryId > MAX_CATEGORY_ID) revert InvalidCategoryId();

        completions[_contributor][_categoryId]++;

        // Track category for enumeration
        if (!_hasCategoryEntry[_contributor][_categoryId]) {
            _hasCategoryEntry[_contributor][_categoryId] = true;
            _contributorCategories[_contributor].push(_categoryId);
        }

        emit CompletionRecorded(
            _contributor,
            _categoryId,
            completions[_contributor][_categoryId]
        );
    }

    /// @notice Check if a contributor has a verified badge in a category
    function isSkillVerified(
        address _contributor,
        uint256 _categoryId
    ) external view returns (bool) {
        return completions[_contributor][_categoryId] >= VERIFICATION_THRESHOLD;
    }

    /// @notice Get all verified skill category IDs for a contributor
    function getVerifiedSkills(
        address _contributor
    ) external view returns (uint256[] memory) {
        uint256[] memory allCategories = _contributorCategories[_contributor];
        uint256 count = 0;

        // First pass: count verified categories
        for (uint256 i = 0; i < allCategories.length; i++) {
            if (
                completions[_contributor][allCategories[i]] >=
                VERIFICATION_THRESHOLD
            ) {
                count++;
            }
        }

        // Second pass: populate result array
        uint256[] memory verified = new uint256[](count);
        uint256 idx = 0;
        for (uint256 i = 0; i < allCategories.length; i++) {
            if (
                completions[_contributor][allCategories[i]] >=
                VERIFICATION_THRESHOLD
            ) {
                verified[idx++] = allCategories[i];
            }
        }

        return verified;
    }

    /// @notice Get exact completion count in a category for a contributor
    function getCompletionsInCategory(
        address _contributor,
        uint256 _categoryId
    ) external view returns (uint256) {
        return completions[_contributor][_categoryId];
    }
}
