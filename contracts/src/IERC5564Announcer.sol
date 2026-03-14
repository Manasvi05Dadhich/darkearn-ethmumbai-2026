// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

/**
 * @title IERC5564Announcer
 * @notice Standard interface for stealth address announcements (ERC-5564)
 */
interface IERC5564Announcer {
    /**
     * @dev Emitted when a stealth address payment is announced
     * @param schemeId        Cryptographic scheme — 0 for secp256k1
     * @param stealthAddress  Where the funds were sent
     * @param caller          Who triggered the announcement
     * @param ephemeralPubKey Random public key for stealth address derivation
     * @param metadata        First byte is view tag for fast scanning
     */
    event Announcement(
        uint256 indexed schemeId,
        address indexed stealthAddress,
        address indexed caller,
        bytes ephemeralPubKey,
        bytes metadata
    );

    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external;
}
