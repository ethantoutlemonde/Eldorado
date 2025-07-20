"use client";

import { useContractWrite } from "wagmi";
import { parseEther } from "viem";
import { swapAbi } from "@/abis/swap";
import { CONTRACT_ADDRESSES } from "@/constants/addresses";

export function useSwap() {
  const { writeAsync, data, isPending, error } = useContractWrite({
    address: CONTRACT_ADDRESSES.Swap as `0x${string}`,
    abi: swapAbi,
    functionName: "swapETHToELD",
  });

  async function swap(amountOutMin: bigint, deadline: bigint, ethAmount: string) {
    return writeAsync({
      args: [amountOutMin, deadline],
      value: parseEther(ethAmount),
    });
  }

  return { swap, data, isPending, error };
}
