import { Layers } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  isFiltered?: boolean;
  onAddCard?: () => void;
}

export function EmptyState({ isFiltered = false, onAddCard }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <Layers className="w-12 h-12 text-surface-300 dark:text-surface-600 mb-4" />
      <h3 className="text-xl font-semibold text-surface-700 dark:text-surface-300">
        {isFiltered ? 'No cards in this category' : 'No cards yet'}
      </h3>
      <p className="text-sm text-surface-400 mt-1 max-w-xs">
        {isFiltered
          ? 'Try selecting a different category or create a new card.'
          : 'Create your first flashcard to get started.'}
      </p>
      {!isFiltered && onAddCard && (
        <Button onClick={onAddCard} className="mt-6">
          Add Your First Card
        </Button>
      )}
    </div>
  );
}
