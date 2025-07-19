// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "../src/Swap.sol";
import "../src/EldoradoToken.sol";
import "../src/MockERC20.sol";
import "../src/MockRouter.sol";

contract Deploy is Script {
    function run() external {
        vm.startBroadcast();

        // Déploie Mock tokens
        MockERC20 usdc = new MockERC20("USD Coin", "USDC", 1_000_000 * 10 ** 18);
        MockERC20 usdt = new MockERC20("Tether USD", "USDT", 1_000_000 * 10 ** 18);
        MockERC20 weth = new MockERC20("Wrapped ETH", "WETH", 1_000_000 * 10 ** 18);

        // Déploie Mock router
        MockRouter router = new MockRouter();

        // Déploie Eldorado token
        EldoradoToken eld = new EldoradoToken(1_000_000 * 10 ** 18);

        // Déploie Swap avec les adresses mocks
        Swap swap = new Swap(
            address(router),
            address(eld),
            address(usdc),
            address(usdt),
            address(weth),
            msg.sender,
            msg.sender
        );

        console.log("Mock USDC deployed at:", address(usdc));
        console.log("Mock USDT deployed at:", address(usdt));
        console.log("Mock WETH deployed at:", address(weth));
        console.log("Mock Router deployed at:", address(router));
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

        // Sauvegarder dans un fichier JSON dans le dossier output
        string memory filePath = "./script/output/deployedAddresses.json";
        vm.writeFile(filePath, json);
    }
}



// deployed on ANVIL 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6

// forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --broadcast --legacy

// Contrat	Adresse déployée
// Mock USDC	0x700b6A60ce7EaaEA56F065753d8dcB9653dbAD35
// Mock USDT	0xA15BB66138824a1c7167f5E85b957d04Dd34E468
// Mock WETH	0xb19b36b1456E65E3A6D514D3F715f204BD59f431
// Mock Router	0x8ce361602B935680E8DeC218b820ff5056BeB7af
// EldoradoToken	0xe1Aa25618fA0c7A1CFDab5d6B456af611873b629
// Swap	0xe1DA8919f262Ee86f9BE05059C9280142CF23f48