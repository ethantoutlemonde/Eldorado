# 🎰 Eldorado - Machine à Sous Décentralisée

## 📌 Introduction
La machine à sous d'Eldorado est un jeu de hasard décentralisé basé sur la blockchain Ethereum. Son fonctionnement repose sur un **smart contract Solidity** et l'**Oracle Chainlink VRF** pour garantir l'aléatoire des tirages. 

L'objectif est simple : le joueur lance la machine et doit aligner **trois symboles identiques** sur une ligne pour gagner. Les gains varient en fonction des combinaisons obtenues.

---

## 🚀 Fonctionnement du Jeu
### 🔹 1. Connexion et Mise
- L'utilisateur se connecte avec **WalletConnect**.
- Il choisit le montant de sa mise en **ETH ou USDC**.
- Le smart contract vérifie que le solde du joueur est suffisant avant de valider la mise.

### 🔹 2. Lancement de la Machine
- Une demande de nombre aléatoire est envoyée à **Chainlink VRF**.
- L'oracle renvoie un résultat aléatoire utilisé pour générer trois symboles.
- Les symboles sont affichés sur la ligne centrale.

### 🔹 3. Calcul des Gains
- Si les trois symboles sont identiques, le joueur remporte un gain selon la table des paiements.
- Les fonds sont automatiquement versés au joueur en cas de victoire.
- Une commission de **5%** est envoyée au **trésor du casino** géré par **Gnosis SAFE**.

---

## 🎰 Table des Paiements

| Symboles Alignés | Multiplicateur de Mise |
|------------------|----------------------|
| 🌟 🌟 🌟 (Jackpot) | x100  |
| 💎 💎 💎 | x50   |
| 🍀 🍀 🍀 | x20   |
| 🌟 🍀 🌟 | x5    |
| Autres | x0 (Perdu) |

---

## 🛠️ Spécifications Techniques
### 🔹 Smart Contract Solidity
Le smart contract gère les mises, la génération des symboles et le paiement des gains.

#### Fonction Principale :
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract SlotMachine is VRFConsumerBase {
    uint256 private fee;
    bytes32 private keyHash;
    mapping(bytes32 => address) private requests;
    
    event SpinResult(address indexed player, uint8[3] symbols, uint256 payout);
    
    constructor(
        address vrfCoordinator,
        address linkToken,
        bytes32 _keyHash,
        uint256 _fee
    ) VRFConsumerBase(vrfCoordinator, linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }

    function spin() public payable {
        require(msg.value >= 0.01 ether, "Mise insuffisante");
        require(LINK.balanceOf(address(this)) >= fee, "Fonds LINK insuffisants");
        bytes32 requestId = requestRandomness(keyHash, fee);
        requests[requestId] = msg.sender;
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        address player = requests[requestId];
        uint8[3] memory symbols = [uint8(randomness % 5), uint8((randomness / 10) % 5), uint8((randomness / 100) % 5)];
        uint256 payout = calculatePayout(symbols);
        if (payout > 0) {
            payable(player).transfer(payout);
        }
        emit SpinResult(player, symbols, payout);
    }

    function calculatePayout(uint8[3] memory symbols) private pure returns (uint256) {
        if (symbols[0] == symbols[1] && symbols[1] == symbols[2]) {
            if (symbols[0] == 0) return 100 ether;
            if (symbols[0] == 1) return 50 ether;
            if (symbols[0] == 2) return 20 ether;
        }
        return 0;
    }
}
```

---

## 📊 Interface Utilisateur (Frontend)
### 🔹 Fonctionnalités
- **Bouton "Lancer"** : Envoie une transaction pour démarrer le spin.
- **Affichage dynamique** des rouleaux avec animation.
- **Historique des spins** pour suivre les résultats précédents.
- **Bouton de retrait** des gains gagnés.

### 🔹 Technologies
- **React (Next.js) + TypeScript** pour le frontend.
- **Tailwind CSS** pour le design.
- **Wagmi + ethers.js** pour la gestion des transactions blockchain.

---

## 🔍 Sécurité & Tests
### 🔹 Tests Unitaires
- **Tests Solidity avec Foundry** pour vérifier les gains et le bon fonctionnement du tirage.
- **Simulation d’attaques** pour tester la résistance aux tricheries.
- **Vérification du bon fonctionnement du VRF Chainlink**.

### 🔹 Mesures de Sécurité
- **Limite de mise minimale** pour éviter les abus.
- **VRF Chainlink pour garantir l’aléatoire**.
- **Gnosis SAFE pour stocker les fonds du casino**.

---

La machine à sous Eldorado offre une **expérience de jeu transparente et équitable** grâce à la blockchain et à Chainlink VRF. 
Les gains sont distribués automatiquement, et l’ensemble du système est vérifiable par les joueurs.
