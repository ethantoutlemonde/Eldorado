// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/SlotMachine.sol";
import "../src/EldoradoToken.sol";

// Mock VRF Coordinator pour les tests
contract MockVRFCoordinator {
    uint256 private _requestId = 1;
    
    function requestRandomWords(
        bytes32,
        uint64,
        uint16,
        uint32,
        uint32
    ) external returns (uint256) {
        return _requestId++;
    }
}

// Contrat de test qui hérite de SlotMachine pour exposer fulfillRandomWords
contract TestableSlotMachine is SlotMachine {
    constructor(
        address _token,
        uint64 _subscriptionId,
        address _vrfCoordinator,
        bytes32 _keyHash
    ) SlotMachine(_token, _subscriptionId, _vrfCoordinator, _keyHash) {}

    // Expose fulfillRandomWords pour les tests
    function testFulfillRandomWords(uint256 requestId, uint256[] memory randomWords) external {
        fulfillRandomWords(requestId, randomWords);
    }
}

contract SlotMachineTest is Test {
    EldoradoToken token;
    TestableSlotMachine slot;
    MockVRFCoordinator mockCoordinator;
    address owner = address(0xABCD);
    address player = address(0xBEEF);
    address player2 = address(0xDEAD);

    uint64 subscriptionId = 1;
    bytes32 keyHash = bytes32("keyhash");

    function setUp() public {
        vm.startPrank(owner);
        token = new EldoradoToken(1_000_000 ether);
        mockCoordinator = new MockVRFCoordinator();
        slot = new TestableSlotMachine(address(token), subscriptionId, address(mockCoordinator), keyHash);

        // Fund the slot machine contract with tokens
        token.approve(address(slot), 100_000 ether);
        slot.fund(100_000 ether);
        vm.stopPrank();

        // Mint some tokens to players and approve the slot machine
        vm.startPrank(owner);
        token.mint(player, 100 ether);
        token.mint(player2, 100 ether);
        vm.stopPrank();

        vm.startPrank(player);
        token.approve(address(slot), 100 ether);
        vm.stopPrank();
        
        vm.startPrank(player2);
        token.approve(address(slot), 100 ether);
        vm.stopPrank();
    }

    // Test cases pour spin()
    function testSpinRevertIfBetTooLow() public {
        vm.expectRevert("Bet below minimum");
        vm.prank(player);
        slot.spin(0.5 ether); // Below minimum of 1 ether
    }

    function testSpinRevertIfInsufficientBalance() public {
        vm.startPrank(player);
        token.transfer(owner, 100 ether); // Transfer all tokens away
        vm.expectRevert("ERC20: transfer amount exceeds balance");
        slot.spin(1 ether);
        vm.stopPrank();
    }

    function testSpinRevertIfInsufficientApproval() public {
        vm.startPrank(player);
        token.approve(address(slot), 0); // Remove approval
        vm.expectRevert("ERC20: insufficient allowance");
        slot.spin(1 ether);
        vm.stopPrank();
    }

    function testSpinSuccess() public {
        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 balanceBefore = token.balanceOf(player);
        
        uint256 requestId = slot.spin(betAmount);
        
        // Verify token transfer
        assertEq(token.balanceOf(player), balanceBefore - betAmount);
        assertEq(token.balanceOf(address(slot)), 100_000 ether + betAmount);
        
        // Verify mappings
        assertEq(slot.requestToPlayer(requestId), player);
        assertEq(slot.requestToBetAmount(requestId), betAmount);
        
        vm.stopPrank();
    }

    function testSpinMultipleBets() public {
        vm.startPrank(player);
        uint256 requestId1 = slot.spin(1 ether);
        uint256 requestId2 = slot.spin(2 ether);
        
        assertEq(slot.requestToPlayer(requestId1), player);
        assertEq(slot.requestToPlayer(requestId2), player);
        assertEq(slot.requestToBetAmount(requestId1), 1 ether);
        assertEq(slot.requestToBetAmount(requestId2), 2 ether);
        vm.stopPrank();
    }

    // Test cases pour fulfillRandomWords()
    function testFulfillRandomWordsWinningCombination() public {
        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);
        vm.stopPrank();

        // Simulate VRF response with winning combination (all 0s)
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 0; // Will become symbol 0
        randomWords[1] = 0; // Will become symbol 0
        randomWords[2] = 0; // Will become symbol 0

        // Call fulfillRandomWords directly (simulating VRF callback)
        slot.testFulfillRandomWords(requestId, randomWords);

        // Calculate expected win (symbol 0 has multiplier 2)
        uint256 expectedWin = betAmount * 2;
        assertEq(slot.playerBalances(player), expectedWin);
    }

    function testFulfillRandomWordsLosingCombination() public {
        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);
        vm.stopPrank();

        // Simulate VRF response with losing combination
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 0; // Symbol 0
        randomWords[1] = 1; // Symbol 1
        randomWords[2] = 2; // Symbol 2

        slot.testFulfillRandomWords(requestId, randomWords);

        // No win expected
        assertEq(slot.playerBalances(player), 0);
    }

    function testFulfillRandomWordsHighValueWin() public {
        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);
        vm.stopPrank();

        // Simulate VRF response with high-value winning combination (all 15s)
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 15; // Symbol 15
        randomWords[1] = 15; // Symbol 15
        randomWords[2] = 15; // Symbol 15

        slot.testFulfillRandomWords(requestId, randomWords);

        // Symbol 15 has multiplier 32 (15+1)*2
        uint256 expectedWin = betAmount * 32;
        assertEq(slot.playerBalances(player), expectedWin);
    }

    function testFulfillRandomWordsInsufficientBankroll() public {
        // Drain most of the bankroll
        vm.startPrank(owner);
        slot.withdrawBankroll(99_900 ether);
        vm.stopPrank();

        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);
        vm.stopPrank();

        // Try to win more than available bankroll
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 15; // High multiplier symbol
        randomWords[1] = 15;
        randomWords[2] = 15;

        slot.testFulfillRandomWords(requestId, randomWords);

        // Should not win anything due to insufficient bankroll
        assertEq(slot.playerBalances(player), 0);
    }

    function testFulfillRandomWordsInvalidRequest() public {
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 0;
        randomWords[1] = 0;
        randomWords[2] = 0;

        vm.expectRevert("Invalid request");
        slot.testFulfillRandomWords(999, randomWords); // Invalid request ID
    }

    // Test cases pour withdraw()
    function testWithdrawSuccess() public {
        // Setup a win first
        vm.startPrank(player);
        uint256 betAmount = 10 ether;
        uint256 requestId = slot.spin(betAmount);
        vm.stopPrank();

        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 0;
        randomWords[1] = 0;
        randomWords[2] = 0;

        slot.testFulfillRandomWords(requestId, randomWords);

        uint256 winAmount = betAmount * 2;
        uint256 balanceBefore = token.balanceOf(player);

        vm.prank(player);
        slot.withdraw();

        assertEq(token.balanceOf(player), balanceBefore + winAmount);
        assertEq(slot.playerBalances(player), 0);
    }

    function testWithdrawRevertIfNoBalance() public {
        vm.expectRevert("Nothing to withdraw");
        vm.prank(player);
        slot.withdraw();
    }

    function testWithdrawMultiplePlayersIndependently() public {
        // Player 1 wins
        vm.startPrank(player);
        uint256 requestId1 = slot.spin(5 ether);
        vm.stopPrank();

        // Player 2 wins
        vm.startPrank(player2);
        uint256 requestId2 = slot.spin(10 ether);
        vm.stopPrank();

        // Both get winning combinations
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 1; // Symbol 1, multiplier 4
        randomWords[1] = 1;
        randomWords[2] = 1;

        slot.testFulfillRandomWords(requestId1, randomWords);
        slot.testFulfillRandomWords(requestId2, randomWords);

        uint256 expectedWin1 = 5 ether * 4;
        uint256 expectedWin2 = 10 ether * 4;

        assertEq(slot.playerBalances(player), expectedWin1);
        assertEq(slot.playerBalances(player2), expectedWin2);

        // Each player withdraws independently
        uint256 balance1Before = token.balanceOf(player);
        uint256 balance2Before = token.balanceOf(player2);

        vm.prank(player);
        slot.withdraw();
        vm.prank(player2);
        slot.withdraw();

        assertEq(token.balanceOf(player), balance1Before + expectedWin1);
        assertEq(token.balanceOf(player2), balance2Before + expectedWin2);
    }

    // Test cases pour fund()
    function testFundSuccess() public {
        uint256 amount = 1000 ether;
        uint256 contractBalanceBefore = token.balanceOf(address(slot));

        vm.startPrank(owner);
        token.approve(address(slot), amount);
        slot.fund(amount);
        vm.stopPrank();

        assertEq(token.balanceOf(address(slot)), contractBalanceBefore + amount);
    }

    function testFundRevertIfNotOwner() public {
        vm.expectRevert("Not owner");
        vm.prank(player);
        slot.fund(1000 ether);
    }

    function testFundRevertIfInsufficientApproval() public {
        vm.startPrank(owner);
        token.approve(address(slot), 0);
        vm.expectRevert("ERC20: insufficient allowance");
        slot.fund(1000 ether);
        vm.stopPrank();
    }

    // Test cases pour withdrawBankroll()
    function testWithdrawBankrollSuccess() public {
        uint256 amount = 50_000 ether;
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        vm.prank(owner);
        slot.withdrawBankroll(amount);

        assertEq(token.balanceOf(owner), ownerBalanceBefore + amount);
        assertEq(token.balanceOf(address(slot)), 100_000 ether - amount);
    }

    function testWithdrawBankrollRevertIfNotOwner() public {
        vm.expectRevert("Not owner");
        vm.prank(player);
        slot.withdrawBankroll(1000 ether);
    }

    function testWithdrawBankrollRevertIfInsufficientBalance() public {
        vm.expectRevert("Insufficient balance");
        vm.prank(owner);
        slot.withdrawBankroll(200_000 ether); // More than available
    }

    function testWithdrawBankrollComplete() public {
        uint256 contractBalance = token.balanceOf(address(slot));
        uint256 ownerBalanceBefore = token.balanceOf(owner);

        vm.prank(owner);
        slot.withdrawBankroll(contractBalance);

        assertEq(token.balanceOf(owner), ownerBalanceBefore + contractBalance);
        assertEq(token.balanceOf(address(slot)), 0);
    }

    // Test cases pour les constantes et variables publiques
    function testConstants() public {
        assertEq(slot.SYMBOL_COUNT(), 16);
        assertEq(slot.minBetAmount(), 1 ether);
        assertEq(slot.owner(), owner);
        assertEq(address(slot.token()), address(token));
    }

    function testSymbolMultipliers() public {
        for (uint256 i = 0; i < 16; i++) {
            assertEq(slot.symbolMultipliers(i), (i + 1) * 2);
        }
    }

    // Test edge cases
    function testMinBetAmount() public {
        vm.startPrank(player);
        uint256 requestId = slot.spin(1 ether); // Exactly minimum
        assertGt(requestId, 0);
        vm.stopPrank();
    }

    function testModuloOperationInFulfillRandomWords() public {
        vm.startPrank(player);
        uint256 requestId = slot.spin(1 ether);
        vm.stopPrank();

        // Test with very large random numbers
        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = type(uint256).max; // Should become 15 after modulo
        randomWords[1] = type(uint256).max;
        randomWords[2] = type(uint256).max;

        slot.testFulfillRandomWords(requestId, randomWords);

        // All should be symbol 15 (type(uint256).max % 16 = 15)
        uint256 expectedWin = 1 ether * 32; // Symbol 15 multiplier
        assertEq(slot.playerBalances(player), expectedWin);
    }

    // Test events
    function testSpinRequestedEvent() public {
        vm.expectEmit(true, true, true, true);
        emit SlotMachine.SpinRequested(player, 1, 10 ether);
        
        vm.prank(player);
        slot.spin(10 ether);
    }

    function testSpinResultEvent() public {
        vm.startPrank(player);
        uint256 requestId = slot.spin(10 ether);
        vm.stopPrank();

        uint256[] memory randomWords = new uint256[](3);
        randomWords[0] = 5;
        randomWords[1] = 5;
        randomWords[2] = 5;

        uint256[3] memory expectedReels = [uint256(5), uint256(5), uint256(5)];
        uint256 expectedWin = 10 ether * 12; // Symbol 5 multiplier

        vm.expectEmit(true, true, true, true);
        emit SlotMachine.SpinResult(player, expectedReels, expectedWin);

        slot.testFulfillRandomWords(requestId, randomWords);
    }
}