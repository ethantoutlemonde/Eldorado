// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SlotMachine.sol";
import "../src/EldoradoToken.sol";

contract SlotMachineTest is Test {
    EldoradoToken token;
    SlotMachine slot;
    address owner = address(0xABCD);
    address player = address(0xBEEF);

    uint64 subscriptionId = 1;
    address vrfCoordinator = address(0xCAFE);
    bytes32 keyHash = bytes32("keyhash");

    function setUp() public {
        vm.startPrank(owner);
        token = new EldoradoToken(1_000_000 ether);
        slot = new SlotMachine(address(token), subscriptionId, vrfCoordinator, keyHash);

        // Fund the slot machine contract with tokens
        token.approve(address(slot), 100_000 ether);
        slot.fund(100_000 ether);
        vm.stopPrank();

        // Mint some tokens to player and approve the slot machine
        vm.startPrank(owner);
        token.mint(player, 100 ether);
        vm.stopPrank();

        vm.startPrank(player);
        token.approve(address(slot), 100 ether);
    }

    function testSpinRevertIfBetTooLow() public {
        vm.prank(player);
        vm.expectRevert("Bet below minimum");
        slot.spin(0);
    }

    function testSpinSuccessAndWinAndWithdraw() public {
        vm.prank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);

        // Simulate Chainlink VRF callback
        uint256 ;
        // Force reels to be equal to symbol 1 (for winning)
        randomWords[0] = 1;
        randomWords[1] = 1;
        randomWords[2] = 1;

        // Call fulfillRandomWords directly since VRF is off-chain
        slot.fulfillRandomWords(requestId, randomWords);

        // Check player balance in contract
        uint256 expectedMultiplier = 2 * (1 + 1); // symbol 1 multiplier = (1+1)*2 = 4
        uint256 expectedWin = betAmount * expectedMultiplier;
        uint256 playerBalance = slot.playerBalances(player);
        assertEq(playerBalance, expectedWin);

        // Player withdraws winnings
        uint256 before = token.balanceOf(player);
        vm.prank(player);
        slot.withdraw();
        uint256 after = token.balanceOf(player);
        assertEq(after - before, expectedWin);
    }

    function testWithdrawRevertIfNoBalance() public {
        vm.prank(player);
        vm.expectRevert("Nothing to withdraw");
        slot.withdraw();
    }

    function testFundAndWithdrawBankrollByOwner() public {
        vm.prank(owner);
        uint256 initialBalance = token.balanceOf(owner);

        uint256 amount = 500 ether;
        token.approve(address(slot), amount);
        slot.fund(amount);

        uint256 contractBalance = token.balanceOf(address(slot));
        assertGe(contractBalance, amount);

        vm.prank(owner);
        slot.withdrawBankroll(amount);

        uint256 afterBalance = token.balanceOf(owner);
        assertEq(afterBalance, initialBalance - amount + amount);
    }

    function testOnlyOwnerFunctions() public {
        vm.prank(player);
        vm.expectRevert("Not owner");
        slot.fund(10 ether);

        vm.prank(player);
        vm.expectRevert("Not owner");
        slot.withdrawBankroll(10 ether);
    }
}
