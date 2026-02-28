import { Lock } from 'lucide-react';

export function PrivacyBadge() {
  return (
    <span
      title="Private deck"
      aria-label="Private deck"
      className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full
                 bg-surface-100 dark:bg-surface-700
                 text-surface-500 dark:text-surface-400
                 text-xs font-medium"
    >
      <Lock className="w-3 h-3" />
      Private
    </span>
  );
}
