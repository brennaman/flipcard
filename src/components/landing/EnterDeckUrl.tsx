'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/Button';

const UUID_RE = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/i;

function extractDeckId(input: string): string | null {
  const trimmed = input.trim();
  const match = trimmed.match(UUID_RE);
  return match ? match[0] : null;
}

export function EnterDeckUrl() {
  const router = useRouter();
  const [value, setValue] = useState('');
  const [error, setError] = useState('');

  const handleGo = () => {
    const id = extractDeckId(value);
    if (!id) {
      setError('Please enter a valid deck URL or ID');
      return;
    }
    router.push(`/deck/${id}`);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleGo();
  };

  return (
    <div>
      <p className="text-sm font-medium text-surface-600 dark:text-surface-400 mb-2">
        Have a deck link?
      </p>
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Paste deck URL or ID"
          value={value}
          onChange={(e) => { setValue(e.target.value); setError(''); }}
          onKeyDown={handleKeyDown}
          className="flex-1 px-3 py-2.5 rounded-lg border border-surface-200 dark:border-surface-600
                     bg-surface-0 dark:bg-surface-900 text-surface-800 dark:text-surface-100
                     placeholder:text-surface-400 text-base
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     transition-colors duration-150"
        />
        <Button onClick={handleGo} size="md" className="px-6">
          Go
        </Button>
      </div>
      {error && <p className="text-sm text-error mt-1.5">{error}</p>}
    </div>
  );
}
