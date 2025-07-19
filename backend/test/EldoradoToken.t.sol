// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../src/EldoradoToken.sol";

contract EldoradoTokenTest is Test {
    EldoradoToken token;

    address alice = address(0x1);

    function setUp() public {
        token = new EldoradoToken(1000 ether);
    }

    function testInitialSupply() public view {
        assertEq(token.totalSupply(), 1000 ether);
        assertEq(token.balanceOf(address(this)), 1000 ether);
    }

    function testMint() public {
        token.mint(alice, 500 ether);
        assertEq(token.balanceOf(alice), 500 ether);
    }
}
