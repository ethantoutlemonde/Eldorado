# Eldorado - Casino Décentralisé 🎰

## 📌 Contexte et Objectif du Projet
Eldorado est un casino décentralisé basé sur la blockchain, utilisant un **Oracle Chainlink** pour garantir un aléatoire vérifiable et transparent. Ce projet permet aux utilisateurs de placer des mises en ETH ou USDC sur une roulette décentralisée et de recevoir leurs gains en toute sécurité.

Le but est de proposer une alternative aux casinos traditionnels en s’appuyant sur la **blockchain Ethereum**, **Gnosis SAFE** pour la gestion des fonds et **WalletConnect** pour l’interaction des utilisateurs.

---

## 🚀 Technologies Utilisées

### 🔹 Smart Contracts (Backend Solidity)
- **Langage** : Solidity (v0.8.28)
- **Framework de développement** : Foundry
- **Génération de nombres aléatoires** : Chainlink VRF
- **Gestion des fonds** : Gnosis SAFE

### 🔹 Backend API
- **Framework** : Laravel (PHP)
- **Base de données** : SQLite (via migrations Laravel)
- **Gestion des utilisateurs et des transactions**

### 🔹 Frontend (Interface Utilisateur)
- **Framework** : React (ou Next.js) avec TypeScript
- **Styling** : Tailwind CSS
- **Connexion blockchain** : WalletConnect
- **Gestion d’état** : wagmi + ethers.js

### 🔹 Infrastructure et Outils
- **Tests unitaires** : Foundry pour les smart contracts
- **Déploiement** : Ethereum Testnet / Mainnet
- **Documentation** : Markdown + Diagrams pour l’architecture

---

## 📁 Architecture du Projet
Le projet est structuré en **quatre dossiers principaux** à la racine :

```
Eldorado/
│── 📂 docs/          # Documentation complète du projet
│      ├── README.md  # Guide utilisateur et développeur
│      ├── charte-graphique/  # Références UI/UX
│      ├── architecture.md  # Explication de l'architecture du projet
│
│── 📂 backend/       # Smart Contracts Solidity et tests unitaires
│      ├── contracts/  # Contrats intelligents (Solidity)
│      ├── test/  # Tests unitaires Foundry
│
│── 📂 front/         # Frontend React/Next.js avec WalletConnect
│      ├── src/  # Code source du frontend
│      ├── public/  # Assets statiques
│
│── 📂 Eldorado_api/  # API Laravel pour la gestion des transactions
│      ├── app/
│      ├── database/
│      ├── routes/
```

---

## 🎲 Fonctionnalités Principales

### 1️⃣ Smart Contract du Casino
- Contrat principal pour gérer les **mises, tirages et paiements**.
- Dépôts et retraits en **ETH ou USDC**.
- Vérification des mises avec des **limites min/max**.

### 2️⃣ Roulette avec Chainlink VRF
- Génération aléatoire vérifiable d’un numéro entre **0 et 36**.
- Transparence totale des résultats pour éviter toute triche.

### 3️⃣ Gestion des Gains et du Trésor
- Calcul automatique des **paiements** en fonction des mises.
- Stockage des pertes des joueurs dans le **trésor du casino**.
- **Commission de 5%** envoyée vers un **Gnosis SAFE**.

### 4️⃣ Interface Utilisateur (Frontend)
- **Connexion via WalletConnect** pour interagir avec le smart contract.
- Possibilité de **placer des mises** sur numéro, couleur, pair/impair.
- **Affichage en temps réel** des résultats de la roulette.
- **Retraits des gains** en ETH ou USDC.

---

## ✅ Contraintes Techniques
- **Solidity + Foundry** pour les smart contracts.
- **Chainlink VRF** pour assurer un aléatoire fiable.
- **Laravel + SQLite** pour le backend API.
- **React (Next.js) + Tailwind CSS** pour le frontend.
- **Gnosis SAFE** pour la gestion des fonds.
- **Tests unitaires Foundry** pour garantir la sécurité du smart contract.

---

## 📊 Évaluation du Projet

| Critères             | Poids  |
|----------------------|--------|
| 🛠️ Smart Contracts   | **40%** |
| 🎨 Frontend          | **30%** |
| 🧪 Tests & Déploiement | **20%** |
| 📄 Documentation     | **10%** |

### 🎁 Bonus (optionnels)
- Ajout d’autres jeux de casino (**Blackjack, Poker**).
- Intégration de **Chainlink Price Feeds** pour ajuster les paiements en stablecoins.
- Création d’un **token de fidélité** pour récompenser les joueurs.
- **Système de révélation de clé privée** en cas de pertes au poker, avec un **bonus quadruplé**.

---

## 🚀 Conclusion
Eldorado vise à offrir une **expérience utilisateur fluide et sécurisée** en combinant la **blockchain Ethereum, Chainlink VRF, Gnosis SAFE et WalletConnect**. L’objectif est de proposer un casino **transparent, sans triche et totalement décentralisé**.

Prêt à jouer ? 🎰💰

