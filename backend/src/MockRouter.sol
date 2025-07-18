// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

contract MockRouter {
    function swapExactETHForTokens(
        uint, 
        address[] calldata, 
        address, 
        uint
    ) external payable returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = msg.value;
        amounts[1] = msg.value;
        return amounts;
    }


    function swapExactTokensForETH(uint, uint, address[] calldata, address, uint) external returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = 1 ether;
        amounts[1] = 1 ether;
        return amounts;
    }

    function swapExactTokensForTokens(uint, uint, address[] calldata, address, uint) external returns (uint[] memory amounts) {
        amounts = new uint[](2);
        amounts[0] = 1 ether;
        amounts[1] = 1 ether;
        return amounts;
    }

    function getAmountsOut(uint amountIn, address[] calldata path) external pure returns (uint[] memory amounts) {
        amounts = new uint[](path.length);
        for (uint i = 0; i < path.length; i++) {
            amounts[i] = amountIn;
        }
        return amounts;
    }
}
