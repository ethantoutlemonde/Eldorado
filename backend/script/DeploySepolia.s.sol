// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.20;

import "forge-std/Script.sol";
import "forge-std/console.sol";

import "../src/MockERC20.sol";
import "../src/EldoradoToken.sol";
import "../src/Swap.sol";

contract DeploySepolia is Script {
    function run() external {
        vm.startBroadcast();

        // 1. Déploiement des tokens mockés
        MockERC20 usdc = new MockERC20("Mock USD Coin", "USDC", 1_000_000 ether);
        MockERC20 usdt = new MockERC20("Mock Tether USD", "USDT", 1_000_000 ether);

        // 2. Adresse WETH réelle sur Sepolia
        address weth = 0xfFf9976782d46CC05630D1f6eBAb18b2324d6B14;

        // 3. Adresse du router UniswapV2 sur Sepolia
        address router = 0xeE567Fe1712Faf6149d80dA1E6934E354124CfE3;

        // 4. Déploiement du token ELDORADO
        EldoradoToken eld = new EldoradoToken(100_000_000 * 10 ** 18);
        eld.transfer(0x19a762e00dd1F5F0fcC308782b9ad2A7B127DF93, 30_000_000 ether);
        eld.transfer(0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, 1_000_000 ether); // Transfert de 1M ELD à l'adresse
        eld.transfer(0xEa418210e9A56D3BeeE8677DC748Bb89FB599b59, 1_000_000 ether); // Transfert de 1M ELD à l'adresse

        // 5. Déploiement du contrat Swap
        Swap swap = new Swap(
            router,
            address(eld),
            address(usdc),
            address(usdt),
            weth,
            msg.sender, // trésor
            msg.sender  // admin
        );

        // 6. Logs
        console.log("USDC:", address(usdc));
        console.log("USDT:", address(usdt));
        console.log("ELD:", address(eld));
        console.log("Swap:", address(swap));

        // 7. Export JSON
        string memory json = string.concat(
            "{\n",
            '  "USDC": "', vm.toString(address(usdc)), '",\n',
            '  "USDT": "', vm.toString(address(usdt)), '",\n',
            '  "ELDORADO": "', vm.toString(address(eld)), '",\n',
            '  "SWAP": "', vm.toString(address(swap)), '"\n',
            "}"
        );

        vm.writeFile("./script/output/sepoliaAddresses.json", json);

        vm.stopBroadcast();
    }
}


// forge script script/DeploySepolia.s.sol:DeploySepolia --rpc-url https://sepolia.infura.io/v3/30a821291d5f47b4bbb8c23c05ba000f --private-key $env:PRIVATE_KEY --broadcast --gas-price 20000000000
