# Deployement sur Sepolia

Ce guide explique comment déployer les contrats sur le réseau Sepolia et mettre à jour le frontend.

1. Assurez‑vous d’avoir configuré les variables d’environnement pour Foundry :
   - `SEPOLIA_RPC_URL`
   - `PRIVATE_KEY`

2. Lancez le script de déploiement :

```bash
cd backend
forge script script/DeploySepolia.s.sol \
  --rpc-url $SEPOLIA_RPC_URL --private-key $PRIVATE_KEY \
  --broadcast --legacy
```

3. Une fois le déploiement terminé, un fichier `sepoliaAddresses.json` est généré dans `backend/script/output`. Copiez‑le dans `frontend/public/` :

```bash
cp script/output/sepoliaAddresses.json ../frontend/public/deployedAddresses.json
```

4. Le frontend utilise automatiquement ce fichier pour connaître les adresses des contrats. Définissez également `NEXT_PUBLIC_API_URL` dans un fichier `.env.local` à la racine du dossier `frontend` pour pointer vers votre API Laravel.
