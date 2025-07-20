// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";
import "../src/Swap.sol";
import "../src/EldoradoToken.sol";
import "../src/MockERC20.sol";
import "../src/MockRouter.sol";

/// @notice Script de déploiement sur le réseau Sepolia
contract DeploySepolia is Script {
    function run() external {
        vm.startBroadcast();

        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 1_000_000 * 10 ** 18);
        MockERC20 usdt = new MockERC20("Tether USD", "USDT", 1_000_000 * 10 ** 18);
        MockERC20 weth = new MockERC20("Wrapped ETH", "WETH", 1_000_000 * 10 ** 18);

        MockRouter router = new MockRouter();
        EldoradoToken eld = new EldoradoToken(1_000_000 * 10 ** 18);

        Swap swap = new Swap(
            address(router),
            address(eld),
            address(usdc),
            address(usdt),
            address(weth),
            msg.sender,
            msg.sender
        );

        console.log("USDC deployed at:", address(usdc));
        console.log("USDT deployed at:", address(usdt));
        console.log("WETH deployed at:", address(weth));
        console.log("Router deployed at:", address(router));
        console.log("EldoradoToken deployed at:", address(eld));
        console.log("Swap deployed at:", address(swap));

        vm.stopBroadcast();

        string memory json = string.concat(
            "{\n",
            '  "USDC": "', vm.toString(address(usdc)), '",\n',
            '  "USDT": "', vm.toString(address(usdt)), '",\n',
            '  "WETH": "', vm.toString(address(weth)), '",\n',
            '  "Router": "', vm.toString(address(router)), '",\n',
            '  "EldoradoToken": "', vm.toString(address(eld)), '",\n',
            '  "Swap": "', vm.toString(address(swap)), '"\n',
            "}\n"
        );

        string memory filePath = "./script/output/sepoliaAddresses.json";
        vm.writeFile(filePath, json);
    }
}
