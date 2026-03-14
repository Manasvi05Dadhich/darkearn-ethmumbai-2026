// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "./IERC5564Announcer.sol";

/**
 * @title ERC5564Announcer
 * @notice On-chain registry for stealth address payment announcements.
 *         Hunters scan these events to find incoming payments.
 */
contract ERC5564Announcer is IERC5564Announcer {
    function announce(
        uint256 schemeId,
        address stealthAddress,
        bytes calldata ephemeralPubKey,
        bytes calldata metadata
    ) external {
        emit Announcement(schemeId, stealthAddress, msg.sender, ephemeralPubKey, metadata);
    }
}
