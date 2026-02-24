import { cn } from '@/lib/utils';

type TagColor = 'blue' | 'emerald' | 'amber' | 'violet' | 'slate';

interface TagProps {
  label: string;
  color?: TagColor;
  interactive?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const colorClasses: Record<TagColor, { base: string; selected: string; hover: string }> = {
  blue: {
    base: 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-300',
    selected: 'bg-primary-500 text-white',
    hover: 'hover:bg-primary-50 dark:hover:bg-primary-900/50',
  },
  emerald: {
    base: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300',
    selected: 'bg-emerald-600 text-white',
    hover: 'hover:bg-emerald-50 dark:hover:bg-emerald-900/50',
  },
  amber: {
    base: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300',
    selected: 'bg-amber-500 text-white',
    hover: 'hover:bg-amber-50 dark:hover:bg-amber-900/50',
  },
  violet: {
    base: 'bg-violet-100 text-violet-700 dark:bg-violet-900/30 dark:text-violet-300',
    selected: 'bg-violet-600 text-white',
    hover: 'hover:bg-violet-50 dark:hover:bg-violet-900/50',
  },
  slate: {
    base: 'bg-surface-100 text-surface-600 dark:bg-surface-800 dark:text-surface-400',
    selected: 'bg-surface-600 text-white',
    hover: 'hover:bg-surface-50 dark:hover:bg-surface-700',
  },
};

export function Tag({
  label,
  color = 'blue',
  interactive = false,
  selected = false,
  onClick,
  className,
}: TagProps) {
  const { base, selected: selectedClass, hover } = colorClasses[color] ?? colorClasses.blue;

  if (interactive) {
    return (
      <button
        onClick={onClick}
        className={cn(
          'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium transition-colors duration-150',
          selected ? selectedClass : cn(base, hover),
          className
        )}
      >
        {label}
      </button>
    );
  }

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        base,
        className
      )}
    >
      {label}
    </span>
  );
}
