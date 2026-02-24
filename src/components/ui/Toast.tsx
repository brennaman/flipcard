'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, AlertCircle } from 'lucide-react';
import type { ToastType } from '@/hooks/useToast';

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

interface ToastContainerProps {
  toasts: ToastItem[];
  onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col gap-2 sm:bottom-6 sm:right-6 max-sm:inset-x-4 max-sm:bottom-4">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={() => onRemove(toast.id)}
            className="flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg cursor-pointer
                       bg-surface-800 dark:bg-surface-100 text-surface-50 dark:text-surface-900
                       text-sm font-medium"
          >
            {toast.type === 'success' ? (
              <CheckCircle className="w-4 h-4 text-green-400 dark:text-green-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400 dark:text-red-600 shrink-0" />
            )}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
