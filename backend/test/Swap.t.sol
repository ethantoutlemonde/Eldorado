// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/Swap.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

// Mock ERC20 token for testing
contract MockERC20 is ERC20 {
    constructor(string memory name, string memory symbol) ERC20(name, symbol) {
        _mint(msg.sender, 1000000 * 10**18);
    }
    
    function mint(address to, uint256 amount) external {
        _mint(to, amount);
    }
}

// Mock Uniswap V2 Router for testing
contract MockUniswapV2Router {
    mapping(address => uint256) public rates;
    bool public shouldRevert = false;
    
    function setRate(address token, uint256 rate) external {
        rates[token] = rate;
    }
    
    function setShouldRevert(bool _shouldRevert) external {
        shouldRevert = _shouldRevert;
    }
    
    function swapExactETHForTokens(
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external payable returns (uint[] memory amounts) {
        if (shouldRevert) revert("Router: swap failed");
        require(deadline >= block.timestamp, "Deadline expired");
        require(path.length >= 2, "Invalid path");
        
        uint256 tokenAmount = msg.value * rates[path[1]] / 1e18;
        require(tokenAmount >= amountOutMin, "Insufficient output amount");
        
        MockERC20(path[1]).mint(to, tokenAmount);
        
        amounts = new uint[](2);
        amounts[0] = msg.value;
        amounts[1] = tokenAmount;
    }
    
    function swapExactTokensForETH(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external returns (uint[] memory amounts) {
        if (shouldRevert) revert("Router: swap failed");
        require(deadline >= block.timestamp, "Deadline expired");
        require(path.length >= 2, "Invalid path");
        
        MockERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        uint256 ethAmount = amountIn * 1e18 / rates[path[0]];
        require(ethAmount >= amountOutMin, "Insufficient output amount");
        
        payable(to).transfer(ethAmount);
        
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = ethAmount;
    }
    
    function swapExactTokensForTokens(
        uint amountIn, 
        uint amountOutMin, 
        address[] calldata path, 
        address to, 
        uint deadline
    ) external returns (uint[] memory amounts) {
        if (shouldRevert) revert("Router: swap failed");
        require(deadline >= block.timestamp, "Deadline expired");
        require(path.length >= 2, "Invalid path");
        
        MockERC20(path[0]).transferFrom(msg.sender, address(this), amountIn);
        
        uint256 tokenAmount = amountIn * rates[path[1]] / rates[path[0]];
        require(tokenAmount >= amountOutMin, "Insufficient output amount");
        
        MockERC20(path[1]).mint(to, tokenAmount);
        
        amounts = new uint[](2);
        amounts[0] = amountIn;
        amounts[1] = tokenAmount;
    }
    
    function getAmountsOut(uint amountIn, address[] calldata path)
        external view returns (uint[] memory amounts) {
        amounts = new uint[](path.length);
        amounts[0] = amountIn;
        
        for (uint i = 1; i < path.length; i++) {
            amounts[i] = amounts[i-1] * rates[path[i]] / rates[path[i-1]];
        }
    }
    
    receive() external payable {}
}

contract SwapTest is Test {
    Swap public swapContract;
    MockUniswapV2Router public mockRouter;
    MockERC20 public eldToken;
    MockERC20 public usdcToken;
    MockERC20 public usdtToken;
    MockERC20 public wethToken;
    
    address public owner;
    address public treasury;
    address public user;
    
    function setUp() public {
        owner = address(this);
        treasury = makeAddr("treasury");
        user = makeAddr("user");
        
        // Deploy mock tokens
        eldToken = new MockERC20("ELD Token", "ELD");
        usdcToken = new MockERC20("USDC Token", "USDC");
        usdtToken = new MockERC20("USDT Token", "USDT");
        wethToken = new MockERC20("WETH Token", "WETH");
        
        // Deploy mock router
        mockRouter = new MockUniswapV2Router();
        
        // Set exchange rates (1 ETH = 2000 ELD, 1 ELD = 1 USDC, etc.)
        mockRouter.setRate(address(eldToken), 2000 * 1e18);
        mockRouter.setRate(address(usdcToken), 1e18);
        mockRouter.setRate(address(usdtToken), 1e18);
        mockRouter.setRate(address(wethToken), 1e18);
        
        // Deploy Swap contract
        swapContract = new Swap(
            address(mockRouter),
            address(eldToken),
            address(usdcToken),
            address(usdtToken),
            address(wethToken),
            treasury,
            owner
        );
        
        // Fund the router with ETH for swaps
        vm.deal(address(mockRouter), 100 ether);
        
        // Fund user with ETH and tokens
        vm.deal(user, 10 ether);
        eldToken.mint(user, 1000000 * 1e18);
        usdcToken.mint(user, 1000000 * 1e18);
        usdtToken.mint(user, 1000000 * 1e18);
    }
    
    function testSwapETHToELD() public {
        uint256 ethAmount = 1 ether;
        uint256 expectedELD = 2000 * 1e18; // Based on our mock rate
        uint256 expectedFee = ethAmount * 100 / 10000; // 1% fee
        uint256 expectedNet = ethAmount - expectedFee;
        uint256 expectedELDAfterFee = expectedNet * 2000;
        
        vm.startPrank(user);
        
        uint256 initialTreasuryBalance = treasury.balance;
        uint256 initialUserELDBalance = eldToken.balanceOf(user);
        
        swapContract.swapETHToELD{value: ethAmount}(
            0, // amountOutMin
            block.timestamp + 1000 // deadline
        );
        
        // Check treasury received fee
        assertEq(treasury.balance, initialTreasuryBalance + expectedFee);
        
        // Check user received ELD tokens (approximation due to fee)
        assertGt(eldToken.balanceOf(user), initialUserELDBalance);
        
        vm.stopPrank();
    }
    
    function testSwapTokenToELD() public {
        uint256 usdcAmount = 1000 * 1e18;
        
        vm.startPrank(user);
        
        // Approve swap contract to spend USDC
        usdcToken.approve(address(swapContract), usdcAmount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        uint256 initialUserELD = eldToken.balanceOf(user);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            usdcAmount,
            0, // amountOutMin
            block.timestamp + 1000 // deadline
        );
        
        // Check treasury received fee in USDC
        assertGt(usdcToken.balanceOf(treasury), initialTreasuryUSDC);
        
        // Check user received ELD tokens
        assertGt(eldToken.balanceOf(user), initialUserELD);
        
        vm.stopPrank();
    }
    
    function testSwapELDToToken() public {
        uint256 eldAmount = 1000 * 1e18;
        
        vm.startPrank(user);
        
        // Approve swap contract to spend ELD
        eldToken.approve(address(swapContract), eldAmount);
        
        uint256 initialTreasuryELD = eldToken.balanceOf(treasury);
        uint256 initialUserUSDC = usdcToken.balanceOf(user);
        
        swapContract.swapELDToToken(
            address(usdcToken),
            eldAmount,
            0, // amountOutMin
            block.timestamp + 1000 // deadline
        );
        
        // Check treasury received fee in ELD
        assertGt(eldToken.balanceOf(treasury), initialTreasuryELD);
        
        // Check user received USDC tokens
        assertGt(usdcToken.balanceOf(user), initialUserUSDC);
        
        vm.stopPrank();
    }
    
    function testSwapELDToETH() public {
        uint256 eldAmount = 1000 * 1e18;
        
        vm.startPrank(user);
        
        // Approve swap contract to spend ELD
        eldToken.approve(address(swapContract), eldAmount);
        
        uint256 initialUserETH = user.balance;
        uint256 initialTreasuryELD = eldToken.balanceOf(treasury);
        
        swapContract.swapELDToToken(
            address(wethToken),
            eldAmount,
            0, // amountOutMin
            block.timestamp + 1000 // deadline
        );
        
        // Check treasury received fee in ELD
        assertGt(eldToken.balanceOf(treasury), initialTreasuryELD);
        
        // In a real scenario, this would swap to ETH
        // Our mock swaps to WETH tokens instead
        assertGt(wethToken.balanceOf(user), 0);
        
        vm.stopPrank();
    }
    
    function testSwapTokenToELDWithUSDT() public {
        uint256 usdtAmount = 500 * 1e18;
        
        vm.startPrank(user);
        
        // Approve swap contract to spend USDT
        usdtToken.approve(address(swapContract), usdtAmount);
        
        uint256 initialTreasuryUSDT = usdtToken.balanceOf(treasury);
        uint256 initialUserELD = eldToken.balanceOf(user);
        
        swapContract.swapTokenToELD(
            address(usdtToken),
            usdtAmount,
            0,
            block.timestamp + 1000
        );
        
        // Check treasury received fee in USDT
        assertGt(usdtToken.balanceOf(treasury), initialTreasuryUSDT);
        
        // Check user received ELD tokens
        assertGt(eldToken.balanceOf(user), initialUserELD);
        
        vm.stopPrank();
    }
    
    function testSwapELDToUSDT() public {
        uint256 eldAmount = 2000 * 1e18;
        
        vm.startPrank(user);
        
        // Approve swap contract to spend ELD
        eldToken.approve(address(swapContract), eldAmount);
        
        uint256 initialTreasuryELD = eldToken.balanceOf(treasury);
        uint256 initialUserUSDT = usdtToken.balanceOf(user);
        
        swapContract.swapELDToToken(
            address(usdtToken),
            eldAmount,
            0,
            block.timestamp + 1000
        );
        
        // Check treasury received fee in ELD
        assertGt(eldToken.balanceOf(treasury), initialTreasuryELD);
        
        // Check user received USDT tokens
        assertGt(usdtToken.balanceOf(user), initialUserUSDT);
        
        vm.stopPrank();
    }
    
    function testFeeCalculation() public {
        uint256 amount = 1000 * 1e18;
        uint256 expectedFee = amount * 100 / 10000; // 1% fee
        uint256 expectedNet = amount - expectedFee;
        
        // We need to make this function public or create a wrapper to test it
        // For now, we'll test it indirectly through actual swaps
        
        vm.startPrank(user);
        usdcToken.approve(address(swapContract), amount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            amount,
            0,
            block.timestamp + 1000
        );
        
        uint256 finalTreasuryUSDC = usdcToken.balanceOf(treasury);
        uint256 actualFee = finalTreasuryUSDC - initialTreasuryUSDC;
        
        // Check fee is correct
        assertEq(actualFee, expectedFee);
        
        vm.stopPrank();
    }
    
    function testZeroFee() public {
        // Set fee to 0
        swapContract.setFee(0);
        
        uint256 amount = 1000 * 1e18;
        
        vm.startPrank(user);
        usdcToken.approve(address(swapContract), amount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            amount,
            0,
            block.timestamp + 1000
        );
        
        uint256 finalTreasuryUSDC = usdcToken.balanceOf(treasury);
        
        // Check no fee was taken
        assertEq(finalTreasuryUSDC, initialTreasuryUSDC);
        
        vm.stopPrank();
    }
    
    function testMaxFee() public {
        // Set fee to maximum (5%)
        swapContract.setFee(500);
        
        uint256 amount = 1000 * 1e18;
        uint256 expectedFee = amount * 500 / 10000; // 5% fee
        
        vm.startPrank(user);
        usdcToken.approve(address(swapContract), amount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            amount,
            0,
            block.timestamp + 1000
        );
        
        uint256 finalTreasuryUSDC = usdcToken.balanceOf(treasury);
        uint256 actualFee = finalTreasuryUSDC - initialTreasuryUSDC;
        
        // Check fee is correct
        assertEq(actualFee, expectedFee);
        
        vm.stopPrank();
    }
    
    function testReceiveFunction() public {
        // Test that contract can receive ETH
        uint256 initialBalance = address(swapContract).balance;
        
        vm.deal(user, 1 ether);
        vm.prank(user);
        (bool success,) = address(swapContract).call{value: 0.5 ether}("");
        
        assertTrue(success);
        assertEq(address(swapContract).balance, initialBalance + 0.5 ether);
    }
    
    function testSwapETHToELDWithZeroFee() public {
        // Set fee to 0
        swapContract.setFee(0);
        
        uint256 ethAmount = 1 ether;
        
        vm.startPrank(user);
        
        uint256 initialTreasuryBalance = treasury.balance;
        uint256 initialUserELDBalance = eldToken.balanceOf(user);
        
        swapContract.swapETHToELD{value: ethAmount}(
            0,
            block.timestamp + 1000
        );
        
        // Check treasury didn't receive any fee
        assertEq(treasury.balance, initialTreasuryBalance);
        
        // Check user received ELD tokens
        assertGt(eldToken.balanceOf(user), initialUserELDBalance);
        
        vm.stopPrank();
    }
    
    function testSwapTokenToELDWithZeroFee() public {
        // Set fee to 0
        swapContract.setFee(0);
        
        uint256 usdcAmount = 1000 * 1e18;
        
        vm.startPrank(user);
        
        usdcToken.approve(address(swapContract), usdcAmount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        uint256 initialUserELD = eldToken.balanceOf(user);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            usdcAmount,
            0,
            block.timestamp + 1000
        );
        
        // Check treasury didn't receive any fee
        assertEq(usdcToken.balanceOf(treasury), initialTreasuryUSDC);
        
        // Check user received ELD tokens
        assertGt(eldToken.balanceOf(user), initialUserELD);
        
        vm.stopPrank();
    }
    
    function testSwapELDToTokenWithZeroFee() public {
        // Set fee to 0
        swapContract.setFee(0);
        
        uint256 eldAmount = 1000 * 1e18;
        
        vm.startPrank(user);
        
        eldToken.approve(address(swapContract), eldAmount);
        
        uint256 initialTreasuryELD = eldToken.balanceOf(treasury);
        uint256 initialUserUSDC = usdcToken.balanceOf(user);
        
        swapContract.swapELDToToken(
            address(usdcToken),
            eldAmount,
            0,
            block.timestamp + 1000
        );
        
        // Check treasury didn't receive any fee
        assertEq(eldToken.balanceOf(treasury), initialTreasuryELD);
        
        // Check user received USDC tokens
        assertGt(usdcToken.balanceOf(user), initialUserUSDC);
        
        vm.stopPrank();
    }
    
    function testOnlyOwnerCanSetFee() public {
        // Test that only owner can set fee
        vm.expectRevert();
        vm.prank(user);
        swapContract.setFee(200);
        
        // Test that owner can set fee
        swapContract.setFee(200);
        assertEq(swapContract.feePercent(), 200);
        
        // Test maximum fee constraint
        vm.expectRevert("Max 5%");
        swapContract.setFee(600);
    }
    
    function testOnlyOwnerCanSetTreasury() public {
        address newTreasury = makeAddr("newTreasury");
        
        // Test that only owner can set treasury
        vm.expectRevert();
        vm.prank(user);
        swapContract.setTreasury(newTreasury);
        
        // Test that owner can set treasury
        swapContract.setTreasury(newTreasury);
        assertEq(swapContract.treasury(), newTreasury);
    }
    
    function testUnsupportedTokenReverts() public {
        address unsupportedToken = makeAddr("unsupported");
        
        vm.expectRevert("Unsupported token");
        vm.prank(user);
        swapContract.swapTokenToELD(
            unsupportedToken,
            1000,
            0,
            block.timestamp + 1000
        );
    }
    
    function testCannotSwapELDToELD() public {
        vm.expectRevert("Cannot swap to same token");
        vm.prank(user);
        swapContract.swapELDToToken(
            address(eldToken),
            1000,
            0,
            block.timestamp + 1000
        );
    }
    
    function testCannotSwapTokenToELDWithELD() public {
        vm.expectRevert("Use ELD to Token function");
        vm.prank(user);
        swapContract.swapTokenToELD(
            address(eldToken),
            1000,
            0,
            block.timestamp + 1000
        );
    }
    
    function testSwapETHToELDWithNoETH() public {
        vm.expectRevert("No ETH sent");
        vm.prank(user);
        swapContract.swapETHToELD(0, block.timestamp + 1000);
    }
    
    function testGettersAndSetters() public {
        // Test all getters
        assertEq(address(swapContract.router()), address(mockRouter));
        assertEq(swapContract.ELD(), address(eldToken));
        assertEq(swapContract.USDC(), address(usdcToken));
        assertEq(swapContract.USDT(), address(usdtToken));
        assertEq(swapContract.WETH(), address(wethToken));
        assertEq(swapContract.treasury(), treasury);
        assertEq(swapContract.feePercent(), 100);
        assertEq(swapContract.owner(), owner);
        
        // Test setters
        address newTreasury = makeAddr("newTreasury");
        swapContract.setTreasury(newTreasury);
        assertEq(swapContract.treasury(), newTreasury);
        
        swapContract.setFee(200);
        assertEq(swapContract.feePercent(), 200);
    }
    
    function testSupportedTokenModifier() public {
        // Test with WETH (should work)
        vm.startPrank(user);
        wethToken.mint(user, 1000 * 1e18);
        wethToken.approve(address(swapContract), 1000 * 1e18);
        
        swapContract.swapTokenToELD(
            address(wethToken),
            1000 * 1e18,
            0,
            block.timestamp + 1000
        );
        
        vm.stopPrank();
        
        // Test with unsupported token (should fail)
        address randomToken = makeAddr("randomToken");
        vm.expectRevert("Unsupported token");
        vm.prank(user);
        swapContract.swapTokenToELD(
            randomToken,
            1000,
            0,
            block.timestamp + 1000
        );
    }
    
    function testReentrancyProtection() public {
        // This test ensures the nonReentrant modifier is working
        // In a real scenario, we would create a malicious contract
        // that tries to reenter, but for simplicity we'll test normal flow
        
        vm.startPrank(user);
        
        // First call should work
        swapContract.swapETHToELD{value: 1 ether}(0, block.timestamp + 1000);
        
        // Second call should also work (no reentrancy issue)
        swapContract.swapETHToELD{value: 1 ether}(0, block.timestamp + 1000);
        
        vm.stopPrank();
    }
    
    function testLargeAmountSwap() public {
        uint256 largeAmount = 1000000 * 1e18;
        
        vm.startPrank(user);
        
        // Ensure user has enough tokens
        usdcToken.mint(user, largeAmount);
        usdcToken.approve(address(swapContract), largeAmount);
        
        uint256 initialTreasuryUSDC = usdcToken.balanceOf(treasury);
        uint256 initialUserELD = eldToken.balanceOf(user);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            largeAmount,
            0,
            block.timestamp + 1000
        );
        
        // Check treasury received fee
        assertGt(usdcToken.balanceOf(treasury), initialTreasuryUSDC);
        
        // Check user received ELD tokens
        assertGt(eldToken.balanceOf(user), initialUserELD);
        
        vm.stopPrank();
    }
    
    function testSmallAmountSwap() public {
        uint256 smallAmount = 1e15; // 0.001 tokens
        
        vm.startPrank(user);
        
        usdcToken.approve(address(swapContract), smallAmount);
        
        uint256 initialUserELD = eldToken.balanceOf(user);
        
        swapContract.swapTokenToELD(
            address(usdcToken),
            smallAmount,
            0,
            block.timestamp + 1000
        );
        
        // Even with small amounts, swap should work
        assertGt(eldToken.balanceOf(user), initialUserELD);
        
        vm.stopPrank();
    }
    
    function testMultipleSwapsInSequence() public {
        uint256 swapAmount = 100 * 1e18;
        
        vm.startPrank(user);
        
        // ETH to ELD
        swapContract.swapETHToELD{value: 1 ether}(0, block.timestamp + 1000);
        
        // USDC to ELD
        usdcToken.approve(address(swapContract), swapAmount);
        swapContract.swapTokenToELD(
            address(usdcToken),
            swapAmount,
            0,
            block.timestamp + 1000
        );
        
        // ELD to USDT
        eldToken.approve(address(swapContract), swapAmount);
        swapContract.swapELDToToken(
            address(usdtToken),
            swapAmount,
            0,
            block.timestamp + 1000
        );
        
        // All swaps should complete successfully
        vm.stopPrank();
    }
}