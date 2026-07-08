'use client';

interface ProgressBarProps {
  percentage: number;
  size?: 'sm' | 'md';
}

export function ProgressBar({ percentage, size = 'md' }: ProgressBarProps) {
  const clamped = Math.min(100, Math.max(0, percentage));
  const height = size === 'sm' ? 'h-1.5' : 'h-2.5';

  return (
    <div className={`w-full bg-secondary rounded-full ${height}`}>
      <div
        className={`${height} rounded-full transition-all duration-500 ${
          clamped >= 100 ? 'bg-green-500' : 'bg-primary'
        }`}
        style={{ width: `${clamped}%` }}
      />
    </div>
  );
}
