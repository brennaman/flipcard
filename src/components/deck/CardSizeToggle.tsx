'use client';

type CardSize = 'sm' | 'md' | 'lg';

const OPTIONS: { value: CardSize; label: string }[] = [
  { value: 'sm', label: 'S' },
  { value: 'md', label: 'M' },
  { value: 'lg', label: 'L' },
];

interface CardSizeToggleProps {
  value: CardSize;
  onChange: (size: CardSize) => void;
}

export function CardSizeToggle({ value, onChange }: CardSizeToggleProps) {
  return (
    <div
      role="radiogroup"
      aria-label="Card size"
      className="inline-flex items-center gap-0.5 rounded-lg bg-surface-100 dark:bg-surface-800 p-0.5"
    >
      {OPTIONS.map((opt) => {
        const active = opt.value === value;
        return (
          <button
            key={opt.value}
            role="radio"
            aria-checked={active}
            aria-label={`${opt.label === 'S' ? 'Small' : opt.label === 'M' ? 'Medium' : 'Large'} cards`}
            onClick={() => onChange(opt.value)}
            className={`px-2.5 py-1 text-xs font-semibold rounded-md transition-all duration-150 ${
              active
                ? 'bg-surface-0 dark:bg-surface-700 text-surface-900 dark:text-surface-50 shadow-sm'
                : 'text-surface-400 dark:text-surface-500 hover:text-surface-600 dark:hover:text-surface-300'
            }`}
          >
            {opt.label}
          </button>
        );
      })}
    </div>
  );
}
