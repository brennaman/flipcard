import { Plus } from 'lucide-react';

interface AddCardButtonProps {
  onClick: () => void;
}

export function AddCardButton({ onClick }: AddCardButtonProps) {
  return (
    <button
      onClick={onClick}
      className="h-28 flex flex-col items-center justify-center gap-1.5
                 rounded-xl border-2 border-dashed border-surface-300 dark:border-surface-600
                 text-surface-400 dark:text-surface-500 bg-transparent
                 hover:border-primary-300 dark:hover:border-primary-600
                 hover:text-primary-500 dark:hover:text-primary-400
                 hover:bg-primary-50/50 dark:hover:bg-primary-950/20
                 transition-colors duration-200
                 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
      aria-label="Add new card"
    >
      <Plus className="w-5 h-5" />
      <span className="text-xs font-medium">Add Card</span>
    </button>
  );
}
