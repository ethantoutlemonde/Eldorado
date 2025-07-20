"use client";

import { useState } from "react";
import { useTokenBalance } from "@/hooks/use-token-balance";
import { useSwap } from "@/hooks/use-swap";
import { EldoradoToken } from "@/lib/contracts";

export function TokenBalanceSwap() {
  const { balance } = useTokenBalance(EldoradoToken.address);
  const { swap, isPending } = useSwap();
  const [amount, setAmount] = useState("0.01");

  const handleSwap = async () => {
    const deadline = BigInt(Math.floor(Date.now() / 1000) + 60 * 20);
    await swap(0n, deadline, amount);
  };

  return (
    <div className="space-y-4">
      <p>Your ELD Balance: {balance}</p>
      <input
        value={amount}
        onChange={(e) => setAmount(e.target.value)}
        className="text-black px-2 py-1 rounded"
      />
      <button
        onClick={handleSwap}
        disabled={isPending}
        className="bg-pink-500 px-4 py-2 rounded text-white"
      >
        {isPending ? "Swapping..." : "Swap"}
      </button>
    </div>
  );
}
