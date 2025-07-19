#!/bin/bash

# Exit si une commande échoue
set -e

# 1. Lancer l'API Laravel
echo "Démarrage de l'API Laravel..."
cd api
php artisan migrate --force
php artisan serve &
API_PID=$!
cd ..

# 2. Démarrer Anvil (fork Hardhat)
echo "Démarrage d'Anvil..."
cd backend
anvil --port 8545 &
ANVIL_PID=$!
sleep 3 # petit délai pour laisser Anvil démarrer

# 3. Déployer les contrats
echo "Déploiement des smart contracts..."
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --private-key 0x2a871d0798f97d79848a013d4936a73bf4cc922c825d33c1cf7073dff6d409c6 --broadcast --legacy

# 4. Copier le fichier d'adresses vers le frontend
echo "Copie du fichier deployedAddresses.json vers le frontend..."
cp script/output/deployedAddresses.json ../frontend/public/

# 5. Lancer le frontend
echo "Lancement du frontend..."
cd ../frontend
npm run dev &
FRONT_PID=$!

# 6. Lancer le dashboard admin
echo "Lancement du dashboard admin..."
cd ../admin-dashboard
npm run dev &
ADMIN_PID=$!

# 7. Instructions pour quitter proprement
echo ""
echo "Tout est lancé. Pour tout arrêter :"
echo "  kill $API_PID $ANVIL_PID $FRONT_PID $ADMIN_PID"
