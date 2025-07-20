// src/constants/addresses.ts
// Les adresses des contrats sont générées lors du déploiement
// et copiées dans le dossier `public` du frontend.
// On importe donc le fichier JSON pour récupérer dynamiquement
// les adresses selon l'environnement (Anvil, Sepolia, etc.).

import deployed from "../public/deployedAddresses.json";

export const CONTRACT_ADDRESSES = deployed as {
  Swap: string;
  EldoradoToken: string;
  USDC: string;
  USDT: string;
  WETH: string;
};

// Compatibilité avec les anciens noms
export const ELD = (deployed as any).EldoradoToken as string;
