// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "forge-std/Script.sol";
import "../src/Eldorado.sol"; // Assure-toi que le chemin d'import est correct

contract DeployEldo is Script {
    function run() external {
        // Remplace ces adresses/valeurs par celles que tu veux utiliser
        address vrfCoordinator = 0x8103B0A8A00be2DDC778e6e7eaa21791Cd364625;
        address linkToken = 0x779877A7B0D9E8603169DdbD7836e478b4624789;
        address eldToken = 0xae1056bB5fd8EF47f324B39831ca8db14573014f; // ⚠️ Ton token ELD sur Sepolia
        bytes32 keyHash = 0x6c3699283bda56ad74f6b855546325b68d482e983852a07f8b8e05d2a8f0c3f7;
        uint256 fee = 0.1 ether; // 0.1 LINK

        vm.startBroadcast();

        Eldorado eldo = new Eldorado(vrfCoordinator, linkToken, eldToken, keyHash, fee);

        console.log("Eldorado:", address(eldo));

        vm.stopBroadcast();
    }
}
