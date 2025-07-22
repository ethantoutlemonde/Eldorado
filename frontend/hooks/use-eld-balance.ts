"use client";
import { useState, useEffect } from "react";
import { ethers } from "ethers";

const ELD_TOKEN_ADDRESS = "0xae1056bB5fd8EF47f324B39831ca8db14573014f";
const ABI = [
  "function balanceOf(address owner) view returns (uint256)",
  "function decimals() view returns (uint8)"
];

export function useEldBalance() {
  const [balance, setBalance] = useState(0);

  const fetchBalance = async () => {
      try {
        if (typeof window !== "undefined" && (window as any).ethereum) {
          const accounts = await (window as any).ethereum.request({ method: "eth_accounts" });
          if (accounts.length === 0) {
            setBalance(0);
            return;
          }
          const provider = new ethers.BrowserProvider((window as any).ethereum);
          const contract = new ethers.Contract(ELD_TOKEN_ADDRESS, ABI, provider);
          const raw = await contract.balanceOf(accounts[0]);
          const decimals = await contract.decimals();
          setBalance(parseFloat(ethers.formatUnits(raw, decimals)));
        } else {
          setBalance(0);
        }
      } catch (err) {
        console.error(err);
        setBalance(0);
      }
  };

  useEffect(() => {
    fetchBalance();

    if (typeof window !== "undefined" && (window as any).ethereum) {
      (window as any).ethereum.on("accountsChanged", fetchBalance);
      return () => {
        (window as any).ethereum.removeListener("accountsChanged", fetchBalance);
      };
    }
  }, []);

  return { balance, refresh: fetchBalance };
}
