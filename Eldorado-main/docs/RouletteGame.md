# 🎰 Documentation du Jeu de la Roulette - Eldorado

## 📌 Introduction
La roulette est l'un des jeux phares du casino d'Eldorado. Ce jeu repose sur l'utilisation de **Chainlink VRF** pour garantir un tirage aléatoire transparent et sécurisé.

Les joueurs peuvent placer leurs mises sur différents types de paris (numéro, couleur, pair/impair, etc.) et recevoir leurs gains en fonction des résultats.

---

## 🛠️ Fonctionnement du Jeu
### 🎡 Déroulement d'une partie
1. **Connexion au casino** : Le joueur se connecte avec WalletConnect.
2. **Sélection des mises** : Il choisit son type de pari et le montant à miser (ETH ou USDC).
3. **Validation et verrouillage** : Une fois confirmée, la mise est enregistrée dans le smart contract.
4. **Lancement de la roulette** : Un appel au **Chainlink VRF** est effectué pour générer un nombre aléatoire entre **0 et 36**.
5. **Affichage du résultat** : La roulette tourne et s'arrête sur un numéro aléatoire.
6. **Paiement des gains** : Si le joueur a gagné, le smart contract calcule et envoie automatiquement les gains.
7. **Mise à jour du trésor** : Une commission de 5% sur les gains est envoyée vers le Gnosis SAFE du casino.

---

## 🎲 Types de Paris et Gains

| Type de pari  | Explication  | Paiement |
|--------------|--------------|-----------|
| Numéro simple | Pari sur un numéro précis (ex: 7) | **x35** |
| Rouge / Noir | Pari sur la couleur de la case | **x2** |
| Pair / Impair | Pari sur la parité du numéro | **x2** |
| Manque / Passe | Pari sur 1-18 (manque) ou 19-36 (passe) | **x2** |
| Douzaine | Pari sur 1-12, 13-24 ou 25-36 | **x3** |
| Colonne | Pari sur une colonne entière | **x3** |
| Sixain | Pari sur six numéros consécutifs | **x6** |
| Carré | Pari sur quatre numéros | **x8** |
| Transversale | Pari sur trois numéros | **x11** |

---

## 🔗 Smart Contract Solidity

### 📜 Contrat `Roulette.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Roulette is VRFConsumerBase {
    address public owner;
    uint256 public fee;
    bytes32 public keyHash;
    mapping(address => uint256) public bets;
    
    event BetPlaced(address indexed player, uint256 amount, uint256 betType);
    event SpinResult(uint256 winningNumber);
    event Payout(address indexed player, uint256 amount);
    
    constructor(address vrfCoordinator, address linkToken, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(vrfCoordinator, linkToken) {
        owner = msg.sender;
        keyHash = _keyHash;
        fee = _fee;
    }

    function placeBet(uint256 betType) external payable {
        require(msg.value > 0, "Mise insuffisante");
        bets[msg.sender] = betType;
        emit BetPlaced(msg.sender, msg.value, betType);
    }

    function spinRoulette() external {
        require(LINK.balanceOf(address(this)) >= fee, "Fonds insuffisants");
        requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 winningNumber = randomness % 37;
        emit SpinResult(winningNumber);
    }
}
```

---

## 🖥️ Interface Utilisateur (Frontend)
### Fonctionnalités UI/UX
- Sélection intuitive des mises.
- Affichage en temps réel du tirage.
- Historique des parties jouées.
- Notifications des gains et des pertes.
- Intégration **WalletConnect** pour interagir avec le smart contract.

### Exemple de Code (React + Wagmi)
```tsx
import { useContractWrite } from 'wagmi';
import { ethers } from 'ethers';

const placeBet = async (betType: number, amount: string) => {
  const contract = new ethers.Contract(ROULETTE_ADDRESS, ROULETTE_ABI, signer);
  await contract.placeBet(betType, { value: ethers.utils.parseEther(amount) });
};
```

---

## 📜 Sécurité & Contraintes Techniques
- Utilisation de **Chainlink VRF** pour garantir un aléatoire vérifiable.
- **Limite de mise min/max** pour éviter les abus.
- **Tests unitaires avec Foundry** pour assurer l'intégrité du smart contract.
- **Gnosis SAFE** pour stocker les fonds du casino.

---

La roulette d'Eldorado garantit **équité et transparence** grâce à la blockchain Ethereum et Chainlink VRF. L’intégration avec WalletConnect et le paiement automatique assurent une **expérience fluide et sécurisée** pour les joueurs. 🎰💰

