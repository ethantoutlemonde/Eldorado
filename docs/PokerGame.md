# 🃏 Documentation du Jeu de Poker - Eldorado

## 📌 Introduction
Le Poker d'Eldorado est un jeu de **Texas Hold'em** entièrement décentralisé, où les joueurs peuvent s'affronter en utilisant leurs cryptos. Le jeu repose sur un **smart contract Solidity** qui gère les mises, la distribution des cartes et la résolution des tours.

Chaque partie est transparente et sécurisée grâce à **Chainlink VRF** pour garantir un tirage des cartes aléatoire et vérifiable.

---

## 🛠️ Fonctionnement du Jeu

### 🔄 Déroulement d'une Partie
1. **Connexion au casino** : Le joueur se connecte via WalletConnect.
2. **Création d'une table** : Un joueur peut créer une table de Poker et fixer le montant de la blind.
3. **Rejoindre une table** : Les joueurs peuvent rejoindre une table ouverte en payant la mise d’entrée.
4. **Distribution des cartes** : Le smart contract utilise **Chainlink VRF** pour distribuer deux cartes à chaque joueur.
5. **Tours de mise** : Comme au Texas Hold'em, chaque tour suit ces étapes :
   - **Preflop** : Premier tour de mise avant l'affichage du flop.
   - **Flop** : Trois cartes communes sont révélées.
   - **Turn** : Une quatrième carte est ajoutée.
   - **River** : Une cinquième carte est ajoutée.
   - **Showdown** : Comparaison des mains pour déterminer le gagnant.
6. **Résolution et paiement** : Le smart contract compare les mains et transfère les gains au gagnant.

---

## 🔥 Règles du Poker (Texas Hold’em)
- Chaque joueur reçoit **2 cartes privées**.
- **5 cartes communes** sont révélées progressivement.
- Les joueurs forment la meilleure **combinaison de 5 cartes**.
- Différents types de mises : **Check, Call, Raise, Fold**.
- La meilleure main remporte le **pot**.

### 🏆 Classement des Mains
| Rang | Main | Description |
|------|------|-------------|
| 1 | **Quinte Flush Royale** | 10, J, Q, K, A de la même couleur |
| 2 | **Quinte Flush** | Cinq cartes consécutives de la même couleur |
| 3 | **Carré** | Quatre cartes de même valeur |
| 4 | **Full House** | Trois cartes d'une valeur + deux d'une autre |
| 5 | **Couleur (Flush)** | Cinq cartes de la même couleur |
| 6 | **Quinte (Straight)** | Cinq cartes consécutives |
| 7 | **Brelan** | Trois cartes de même valeur |
| 8 | **Double Paire** | Deux paires différentes |
| 9 | **Paire** | Deux cartes de même valeur |
| 10 | **Carte Haute** | Aucune combinaison |

---

## 🔗 Smart Contract Solidity

### 📜 Contrat `Poker.sol`
```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@chainlink/contracts/src/v0.8/VRFConsumerBase.sol";

contract Poker is VRFConsumerBase {
    struct Player {
        address payable playerAddress;
        uint256 chips;
        uint256[] hand;
    }

    mapping(address => Player) public players;
    uint256[] public communityCards;
    bytes32 public keyHash;
    uint256 public fee;
    
    event CardsDealt(address indexed player, uint256[] hand);
    event CommunityCardsDealt(uint256[] communityCards);
    event WinnerDeclared(address indexed winner, uint256 amount);
    
    constructor(address vrfCoordinator, address linkToken, bytes32 _keyHash, uint256 _fee)
        VRFConsumerBase(vrfCoordinator, linkToken) {
        keyHash = _keyHash;
        fee = _fee;
    }

    function joinGame() external payable {
        require(msg.value > 0, "Fonds insuffisants pour entrer dans la partie");
        players[msg.sender] = Player(payable(msg.sender), msg.value, new uint256[](2));
    }

    function dealCards() external {
        require(LINK.balanceOf(address(this)) >= fee, "Fonds LINK insuffisants");
        requestRandomness(keyHash, fee);
    }

    function fulfillRandomness(bytes32 requestId, uint256 randomness) internal override {
        uint256 ;
        hand[0] = randomness % 52;
        hand[1] = (randomness / 52) % 52;
        players[msg.sender].hand = hand;
        emit CardsDealt(msg.sender, hand);
    }
}
```

---

## 🖥️ Interface Utilisateur (Frontend)

### Fonctionnalités UI/UX
- **Liste des tables disponibles** avec mises et places restantes.
- **Affichage des cartes et actions possibles** (Check, Call, Raise, Fold).
- **Chat intégré** pour l'interaction entre joueurs.
- **Historique des parties et des gains**.
- **Intégration WalletConnect** pour la gestion des mises en crypto.

### Exemple de Code (React + Wagmi)
```tsx
import { useContractWrite } from 'wagmi';
import { ethers } from 'ethers';

const joinPokerGame = async (amount: string) => {
  const contract = new ethers.Contract(POKER_ADDRESS, POKER_ABI, signer);
  await contract.joinGame({ value: ethers.utils.parseEther(amount) });
};
```

---

## 📜 Sécurité & Contraintes Techniques
- **Utilisation de Chainlink VRF** pour garantir un tirage de cartes aléatoire et impartial.
- **Gestion de bankroll** pour éviter la fraude.
- **Tests unitaires Foundry** pour garantir la stabilité des smart contracts.
- **Gnosis SAFE** pour sécuriser les fonds du casino.
- **Mécanisme anti-collusion** pour éviter la triche entre joueurs.

---

## 📌 Conclusion
Le Poker d'Eldorado offre une **expérience décentralisée et transparente** en combinant la blockchain Ethereum, Chainlink VRF et Gnosis SAFE. Ce système assure un **jeu sécurisé, équitable et sans triche** pour tous les participants. 🃏💰

