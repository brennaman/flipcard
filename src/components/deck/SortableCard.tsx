'use client';

import { motion } from 'framer-motion';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { FlashCard } from './FlashCard';
import type { FlashCard as FlashCardType } from '@/types';

interface SortableCardProps {
  card: FlashCardType;
  index: number;
  onClick: () => void;
  onEdit: () => void;
  onDelete: () => void;
  dragEnabled: boolean;
  canEdit: boolean;
  canDelete: boolean;
  tabIndex?: number;
  onFocus?: () => void;
  onKeyDown?: React.KeyboardEventHandler<HTMLButtonElement>;
  cardRef?: React.RefCallback<HTMLButtonElement>;
}

export function SortableCard({
  card,
  index,
  onClick,
  onEdit,
  onDelete,
  dragEnabled,
  canEdit,
  canDelete,
  tabIndex,
  onFocus,
  onKeyDown,
  cardRef,
}: SortableCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: card.id, disabled: !dragEnabled });

  const maxStaggerDelay = 0.4;
  const delay = Math.min(index * 0.05, maxStaggerDelay);

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay, ease: 'easeOut' }}
      className="group"
    >
      <div
        ref={setNodeRef}
        {...(dragEnabled ? attributes : {})}
        {...(dragEnabled ? listeners : {})}
        tabIndex={-1}
        style={{
          transform: CSS.Transform.toString(transform),
          transition,
          zIndex: isDragging ? 10 : undefined,
          position: 'relative',
        }}
        className={dragEnabled ? 'cursor-grab active:cursor-grabbing' : undefined}
      >
        <FlashCard
          card={card}
          onClick={onClick}
          onEdit={onEdit}
          onDelete={onDelete}
          isDragging={isDragging}
          canEdit={canEdit}
          canDelete={canDelete}
          tabIndex={tabIndex}
          onFocus={onFocus}
          onKeyDown={onKeyDown}
          cardRef={cardRef}
        />
      </div>
    </motion.div>
  );
}
