'use client';

import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { Tag } from '@/components/ui/Tag';
import { MarkdownContent } from '@/components/ui/MarkdownEditor';
import type { FlashCard } from '@/types';

const colorMap: Record<string, 'blue' | 'emerald' | 'amber' | 'violet' | 'slate'> = {
  blue: 'blue',
  emerald: 'emerald',
  amber: 'amber',
  violet: 'violet',
  slate: 'slate',
};

interface CardDetailProps {
  card: FlashCard | null;
  onClose: () => void;
}

export function CardDetail({ card, onClose }: CardDetailProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (card) {
      document.addEventListener('keydown', handleKeyDown);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = '';
    };
  }, [card, onClose]);

  return (
    <AnimatePresence>
      {card && (
        <motion.div
          key={card.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 z-50 bg-surface-0 dark:bg-surface-900 overflow-y-auto"
          role="dialog"
          aria-modal="true"
          aria-label={`Details for ${card.title}`}
        >
          {/* Close button + ESC hint */}
          <div className="fixed top-6 right-6 flex items-center gap-2">
            <span className="hidden sm:inline-flex items-center gap-1 text-xs text-surface-300 dark:text-surface-600 select-none">
              <kbd className="px-1.5 py-0.5 rounded border border-surface-200 dark:border-surface-700 font-mono bg-surface-50 dark:bg-surface-800 text-surface-400 dark:text-surface-500">
                esc
              </kbd>
              to close
            </span>
            <button
              onClick={onClose}
              aria-label="Close detail view"
              className="w-11 h-11 flex items-center justify-center
                         rounded-full text-surface-400
                         hover:text-surface-600 dark:hover:text-surface-300
                         hover:bg-surface-100 dark:hover:bg-surface-800
                         transition-colors duration-150
                         focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-2"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.2, delay: 0.05, ease: 'easeOut' }}
            className="max-w-2xl mx-auto px-6 py-12 pt-20"
          >
            {card.category && (
              <div className="mb-3">
                <Tag
                  label={card.category.name}
                  color={colorMap[card.category.color] ?? 'blue'}
                />
              </div>
            )}

            <h1 className="text-4xl font-bold tracking-tight text-surface-900 dark:text-surface-50 mb-8">
              {card.title}
            </h1>

            <MarkdownContent content={card.content} />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
