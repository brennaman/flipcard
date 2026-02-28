'use client';

import { Tag } from '@/components/ui/Tag';
import { CardContextMenu } from './CardContextMenu';
import type { FlashCard as FlashCardType } from '@/types';

const colorMap: Record<string, 'blue' | 'emerald' | 'amber' | 'violet' | 'slate'> = {
  blue: 'blue',
  emerald: 'emerald',
  amber: 'amber',
  violet: 'violet',
  slate: 'slate',
};

interface FlashCardProps {
  card: FlashCardType;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  isDragging?: boolean;
  canEdit: boolean;
  canDelete: boolean;
  tabIndex?: number;
  onFocus?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  cardRef?: React.RefCallback<HTMLButtonElement>;
}

export function FlashCard({ card, onClick, onEdit, onDelete, isDragging, canEdit, canDelete, tabIndex, onFocus, onKeyDown, cardRef }: FlashCardProps) {
  return (
    <div className={`relative${isDragging ? ' opacity-40' : ''}`}>
      <button
        ref={cardRef}
        onClick={onClick}
        onFocus={onFocus}
        onKeyDown={onKeyDown}
        tabIndex={tabIndex}
        aria-label={`View details for ${card.title}`}
        aria-expanded={false}
        className="w-full h-28 flex flex-col items-center justify-center p-3
                   bg-surface-0 dark:bg-surface-800
                   border border-surface-200 dark:border-surface-700
                   rounded-xl shadow-sm
                   hover:shadow-md hover:border-primary-200 dark:hover:border-primary-700
                   hover:scale-[1.02] active:scale-[0.98]
                   transition-all duration-200
                   focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2
                   text-center cursor-pointer"
      >
        <span className="text-sm font-semibold text-surface-700 dark:text-surface-100 text-balance leading-snug">
          {card.title}
        </span>
        {card.category && (
          <div className="mt-auto pt-2">
            <Tag
              label={card.category.name}
              color={colorMap[card.category.color] ?? 'blue'}
            />
          </div>
        )}
      </button>

      {(canEdit || canDelete) && <CardContextMenu onEdit={onEdit} onDelete={onDelete} canEdit={canEdit} canDelete={canDelete} />}
    </div>
  );
}
