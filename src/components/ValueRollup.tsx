"use client";
import { useEffect, useRef, useState } from "react";
import type { Rollup } from "@/lib/ranking";

function useCountUp(target: number, ms = 900): number {
  const [n, setN] = useState(0);
  const raf = useRef<number>(0);
  useEffect(() => {
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / ms);
      const eased = 1 - Math.pow(1 - t, 3);
      setN(target * eased);
      if (t < 1) raf.current = requestAnimationFrame(tick);
      else setN(target);
    };
    raf.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf.current);
  }, [target, ms]);
  return n;
}

export function ValueRollup({ data }: { data: Rollup }) {
  const cash = useCountUp(data.flatCashback);
  const hours = useCountUp(data.hoursSaved);
  const stores = useCountUp(data.storeCount);
  return (
    <div className="rollup">
      <div>
        <div className="n acc">S${Math.round(cash)}</div>
        <div className="l">in flat cashback bounties across your plan</div>
      </div>
      <div>
        <div className="n">~{Math.round(hours)} hrs</div>
        <div className="l">of research &amp; comparison saved</div>
      </div>
      <div>
        <div className="n">{Math.round(stores)}</div>
        <div className="l">
          things sorted{data.blindSpotCount ? `, ${data.blindSpotCount} you'd have missed` : ""}
        </div>
      </div>
    </div>
  );
}
