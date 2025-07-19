"use client"

import { useEffect, useState } from "react"

interface AnimatedNumberProps {
  value: number
  duration?: number
  decimals?: number
}

export default function AnimatedNumber({ value, duration = 1000, decimals = 0 }: AnimatedNumberProps) {
  const [display, setDisplay] = useState(0)

  useEffect(() => {
    let start = 0
    const startTime = Date.now()

    const tick = () => {
      const progress = Math.min((Date.now() - startTime) / duration, 1)
      const current = start + progress * (value - start)
      setDisplay(parseFloat(current.toFixed(decimals)))
      if (progress < 1) {
        requestAnimationFrame(tick)
      }
    }

    tick()
  }, [value, duration, decimals])

  return <span>{display.toLocaleString(undefined, { minimumFractionDigits: decimals, maximumFractionDigits: decimals })}</span>
}
