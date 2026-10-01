import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle } from 'lucide-react';

interface TimerHeaderProps {
  durationMinutes: number;
  startedAt?: string;
  onTimeExpired: () => void;
}

export const TimerHeader: React.FC<TimerHeaderProps> = ({
  durationMinutes,
  startedAt,
  onTimeExpired
}) => {
  const calculateSecondsRemaining = () => {
    if (startedAt) {
      const startedMs = new Date(startedAt).getTime();
      const endMs = startedMs + durationMinutes * 60 * 1000;
      return Math.max(0, Math.floor((endMs - Date.now()) / 1000));
    }
    return durationMinutes * 60;
  };

  const [secondsRemaining, setSecondsRemaining] = useState<number>(calculateSecondsRemaining);

  useEffect(() => {
    setSecondsRemaining(calculateSecondsRemaining());
  }, [startedAt, durationMinutes]);

  useEffect(() => {
    if (secondsRemaining <= 0) {
      onTimeExpired();
      return;
    }

    const timer = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          onTimeExpired();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [secondsRemaining, onTimeExpired]);

  const mins = Math.floor(secondsRemaining / 60);
  const secs = secondsRemaining % 60;
  const isWarning = secondsRemaining < 300; // Under 5 mins warning

  return (
    <div
      className={`flex items-center gap-2.5 px-4 py-2 rounded-xl font-mono font-bold text-sm tracking-wider transition-all duration-300 ${
        isWarning
          ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/30 animate-pulse'
          : 'bg-slate-800 text-blue-400 border border-slate-700'
      }`}
    >
      {isWarning ? <AlertTriangle className="h-4 w-4" /> : <Clock className="h-4 w-4" />}
      <span>⏱ {String(mins).padStart(2, '0')}:{String(secs).padStart(2, '0')}</span>
    </div>
  );
};
