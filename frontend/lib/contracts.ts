import { CONTRACT_ADDRESSES } from "@/constants/addresses";
import { erc20Abi } from "@/abis/erc20";
import { swapAbi } from "@/abis/swap";

export const EldoradoToken = {
  address: CONTRACT_ADDRESSES.EldoradoToken as `0x${string}`,
  abi: erc20Abi,
} as const;

export const Swap = {
  address: CONTRACT_ADDRESSES.Swap as `0x${string}`,
  abi: swapAbi,
} as const;
