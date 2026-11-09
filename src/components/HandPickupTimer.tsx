import React, { useId } from 'react';
import { Zap } from 'lucide-react';

interface HandPickupTimerProps {
  remainingMs: number;
  totalMs: number;
  running: boolean;
  bonus: boolean;
}

export function HandPickupTimer({ remainingMs, totalMs, running, bonus }: HandPickupTimerProps) {
  const gradientId = useId();
  const remaining = Math.max(0, Math.min(totalMs, remainingMs));
  const progress = totalMs > 0 ? remaining / totalMs : 0;
  const low = progress < 0.3;
  const tickCount = 60;
  const hiddenTicks = tickCount - Math.ceil(progress * tickCount);

  return (
    <div className={`hand-energy-ring ${low ? 'hand-energy-ring--low' : ''}`} data-running={running}
      role="progressbar" aria-label="Thời gian cho món rác" aria-valuemin={0} aria-valuemax={totalMs / 1000}
      aria-valuenow={Math.ceil(remaining / 1000)} aria-valuetext={`Còn ${Math.ceil(remaining / 1000)} giây${running ? '' : ', đang tạm dừng'}`}>
      <svg className="hand-energy-track" viewBox="0 0 120 120" aria-hidden="true">
        <defs>
          <linearGradient id={`${gradientId}-fuel`} gradientUnits="userSpaceOnUse" x1="60" y1="6" x2="60" y2="16">
            <stop offset="0" stopColor={low ? '#ffe0d9' : '#d1fae5'} />
            <stop offset="0.4" stopColor={low ? '#fb655c' : '#27db8b'} />
            <stop offset="1" stopColor={low ? '#ce3746' : '#059669'} />
          </linearGradient>
        </defs>
        <g className="hand-energy-fuel" stroke={`url(#${gradientId}-fuel)`} strokeWidth="1" strokeLinecap="round">
          {Array.from({ length: tickCount - hiddenTicks }, (_, offset) => {
            const index = hiddenTicks + offset;
            return <line key={index} className="hand-energy-tick" data-tick={index} x1="60" y1="7" x2="60" y2="15" transform={`rotate(${index * 360 / tickCount + 3} 60 60)`} />;
          })}
        </g>
      </svg>
      {low && <span className="hand-energy-sparks" aria-hidden="true"><Zap /><Zap /></span>}
      {bonus && <span className="hand-energy-bonus" aria-hidden="true">+10s</span>}
    </div>
  );
}