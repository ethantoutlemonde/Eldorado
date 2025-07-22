// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Withdraw.sol";

contract DeployFaucet is Script {
    function run() external {
        vm.startBroadcast();

        address eldAddress = 0xae1056bB5fd8EF47f324B39831ca8db14573014f;
        Withdraw faucet = new Withdraw(eldAddress);

        vm.stopBroadcast();
    }
}
