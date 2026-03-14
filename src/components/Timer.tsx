import { useEffect, useRef, useState } from "react";
import { formatTime } from "@/lib/session";

interface Props {
  totalSeconds: number;
  onExpire: () => void;
  paused?: boolean;
  onTick?: (remaining: number) => void;
}

export default function Timer({ totalSeconds, onExpire, paused = false, onTick }: Props) {
  const [remaining, setRemaining] = useState(totalSeconds);

  const onExpireRef = useRef(onExpire);
  const onTickRef = useRef(onTick);
  useEffect(() => { onExpireRef.current = onExpire; }, [onExpire]);
  useEffect(() => { onTickRef.current = onTick; }, [onTick]);

  useEffect(() => {
    setRemaining(totalSeconds);
  }, [totalSeconds]);

  useEffect(() => {
    if (paused || remaining <= 0) return;
    const id = setInterval(() => {
      setRemaining((r) => {
        const next = r - 1;
        onTickRef.current?.(next);
        if (next <= 0) {
          clearInterval(id);
          onExpireRef.current();
        }
        return next;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [paused, remaining]);

  const pct = totalSeconds > 0 ? (remaining / totalSeconds) * 100 : 0;
  const isUrgent = remaining <= 30;
  const isWarning = remaining <= 60 && remaining > 30;

  const color = isUrgent ? "text-red-400" : isWarning ? "text-amber-400" : "text-emerald-400";
  const ringColor = isUrgent ? "stroke-red-500" : isWarning ? "stroke-amber-500" : "stroke-emerald-500";

  const size = 40;
  const r = 15;
  const circumference = 2 * Math.PI * r;

  return (
    <div className="flex items-center gap-2" aria-label={`الوقت المتبقي: ${formatTime(remaining)}`}>
      <div className="relative w-10 h-10 flex-shrink-0">
        <svg className="-rotate-90 w-full h-full" viewBox={`0 0 ${size} ${size}`}>
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="3" />
          <circle
            cx={size / 2} cy={size / 2} r={r} fill="none"
            className={ringColor} strokeWidth="3" strokeLinecap="round"
            strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
            style={{ transition: "stroke-dasharray 0.8s linear" }}
          />
        </svg>
      </div>
      <span className={`font-mono font-bold text-sm tabular-nums ${color} ${isUrgent ? "animate-pulse" : ""}`}>
        {formatTime(remaining)}
      </span>
    </div>
  );
}
