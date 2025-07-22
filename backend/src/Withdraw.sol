// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract Withdraw {
    address public owner;
    IERC20 public immutable eldToken;

    constructor(address _eldToken) {
        owner = msg.sender;
        eldToken = IERC20(_eldToken);
    }

    function requestTokens(uint256 amount) external {
        uint256 contractBalance = eldToken.balanceOf(address(this));
        require(amount > 0, "Amount must be > 0");
        require(contractBalance >= amount, "Not enough tokens in treasury");

        bool success = eldToken.transfer(msg.sender, amount);
        require(success, "Transfer failed");
    }

    function withdraw(uint256 amount) external {
        require(msg.sender == owner, "Only owner");
        bool success = eldToken.transfer(owner, amount);
        require(success, "Withdraw failed");
    }
}
