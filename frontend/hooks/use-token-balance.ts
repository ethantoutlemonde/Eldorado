"use client";

import { useAccount, useContractRead } from "wagmi";
import { formatUnits } from "viem";
import { erc20Abi } from "@/abis/erc20";

export function useTokenBalance(token: `0x${string}`, decimals = 18) {
  const { address } = useAccount();
  const readResult = useContractRead({
    address: token,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    watch: true,
  });

  const balance =
    typeof readResult.data === "bigint"
      ? formatUnits(readResult.data, decimals)
      : "0";

  return { ...readResult, balance };
}
