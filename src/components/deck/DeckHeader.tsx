'use client';

import { useState } from 'react';
import { Link2, Check } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { Deck } from '@/types';

interface DeckHeaderProps {
  deck: Deck;
  isOwner: boolean;
}

export function DeckHeader({ deck, isOwner: _isOwner }: DeckHeaderProps) {
  const [copied, setCopied] = useState(false);

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback: select and copy
    }
  };

  return (
    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          {deck.name}
        </h1>
        {deck.description && (
          <p className="mt-1 text-base text-surface-500 dark:text-surface-400">
            {deck.description}
          </p>
        )}
      </div>
      <Button
        variant="secondary"
        onClick={copyLink}
        className="self-start sm:self-auto shrink-0 transition-all duration-150"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 mr-2 text-green-500" />
            Copied!
          </>
        ) : (
          <>
            <Link2 className="w-4 h-4 mr-2" />
            Copy Link
          </>
        )}
      </Button>
    </div>
  );
}
