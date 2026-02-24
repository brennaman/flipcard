'use client';

import { useState } from 'react';
import { X } from 'lucide-react';

export function LocalModeBanner() {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="mx-auto max-w-7xl mt-4 px-4 sm:px-6 lg:px-8">
      <div className="flex items-start justify-between gap-3 px-4 py-2 rounded-lg border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-950/30">
        <p className="text-sm text-amber-800 dark:text-amber-200">
          <span className="mr-1">🟡</span>
          <strong>Running in local mode</strong> — data is stored in memory and will reset on
          server restart. Connect Supabase for persistent storage.
        </p>
        <button
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="shrink-0 mt-0.5 text-amber-600 dark:text-amber-400 hover:text-amber-800 dark:hover:text-amber-200 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
