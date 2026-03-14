// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "forge-std/Test.sol";
import "../src/SkillRegistry.sol";

contract SkillRegistryTest is Test {
    SkillRegistry public registry;

    address public owner = makeAddr("owner");
    address public escrow = makeAddr("escrow");
    address public alice = makeAddr("alice");
    address public bob = makeAddr("bob");
    address public random = makeAddr("random");

    function setUp() public {
        vm.prank(owner);
        registry = new SkillRegistry();

        vm.prank(owner);
        registry.setBountyEscrow(escrow);
    }

    function test_authorizedCallSucceeds() public {
        vm.prank(escrow);
        registry.recordCompletion(alice, 0);

        assertEq(registry.getCompletionsInCategory(alice, 0), 1);
    }

    function test_unauthorizedCallReverts() public {
        vm.prank(random);
        vm.expectRevert(SkillRegistry.OnlyBountyEscrow.selector);
        registry.recordCompletion(alice, 0);
    }

    // Test 3: isSkillVerified returns false below 3 completions
    function test_notVerifiedBelow3() public {
        vm.startPrank(escrow);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        vm.stopPrank();

        assertFalse(registry.isSkillVerified(alice, 0));
    }

    // Test 4: isSkillVerified returns true at exactly 3 completions
    function test_verifiedAtExactly3() public {
        vm.startPrank(escrow);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        vm.stopPrank();

        assertTrue(registry.isSkillVerified(alice, 0));
    }

    // Test 5: isSkillVerified returns true above 3 completions
    function test_verifiedAbove3() public {
        vm.startPrank(escrow);
        for (uint256 i = 0; i < 5; i++) {
            registry.recordCompletion(alice, 0);
        }
        vm.stopPrank();

        assertTrue(registry.isSkillVerified(alice, 0));
    }

    // Test 6: getVerifiedSkills returns correct category list
    function test_getVerifiedSkillsCorrect() public {
        vm.startPrank(escrow);
        // 3 completions in Solidity (0) - verified
        for (uint256 i = 0; i < 3; i++) {
            registry.recordCompletion(alice, 0);
        }
        // 2 completions in Cairo (1) - NOT verified
        registry.recordCompletion(alice, 1);
        registry.recordCompletion(alice, 1);
        // 4 completions in Frontend (2) - verified
        for (uint256 i = 0; i < 4; i++) {
            registry.recordCompletion(alice, 2);
        }
        vm.stopPrank();

        uint256[] memory verified = registry.getVerifiedSkills(alice);
        assertEq(verified.length, 2);
        assertEq(verified[0], 0); // Solidity
        assertEq(verified[1], 2); // Frontend
    }

    // Test 7: getCompletionsInCategory returns accurate count
    function test_completionCountAccurate() public {
        vm.startPrank(escrow);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        registry.recordCompletion(alice, 0);
        vm.stopPrank();

        assertEq(registry.getCompletionsInCategory(alice, 0), 5);
        assertEq(registry.getCompletionsInCategory(alice, 1), 0); // different category
    }
}
