'use client';

import { useEffect, useRef, useState } from 'react';
import { MoreVertical, Pencil, Trash2 } from 'lucide-react';

interface CardContextMenuProps {
  onEdit: () => void;
  onDelete: () => void;
  canEdit: boolean;
  canDelete: boolean;
}

export function CardContextMenu({ onEdit, onDelete, canEdit, canDelete }: CardContextMenuProps) {
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  return (
    <div
      ref={menuRef}
      className="absolute top-3 right-3 z-10"
      onClick={(e) => e.stopPropagation()}
    >
      <button
        aria-label="Card options"
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation();
          setOpen((v) => !v);
        }}
        className="w-8 h-8 p-1.5 flex items-center justify-center rounded-lg
                   text-surface-400 hover:text-surface-600 dark:hover:text-surface-300
                   hover:bg-surface-100 dark:hover:bg-surface-700
                   opacity-0 group-hover:opacity-100 focus-visible:opacity-100
                   transition-opacity duration-150
                   focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500"
      >
        <MoreVertical className="w-4 h-4" />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 py-1 min-w-[140px]
                     bg-surface-0 dark:bg-surface-800
                     border border-surface-200 dark:border-surface-700
                     rounded-lg shadow-lg z-20"
        >
          {canEdit && (
            <button
              onClick={() => { setOpen(false); onEdit(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm
                         text-surface-700 dark:text-surface-300
                         hover:bg-surface-50 dark:hover:bg-surface-700
                         transition-colors duration-100"
            >
              <Pencil className="w-4 h-4" />
              Edit
            </button>
          )}
          {canDelete && (
            <button
              onClick={() => { setOpen(false); onDelete(); }}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm
                         text-error hover:bg-red-50 dark:hover:bg-red-950/30
                         transition-colors duration-100"
            >
              <Trash2 className="w-4 h-4" />
              Delete
            </button>
          )}
        </div>
      )}
    </div>
  );
}
