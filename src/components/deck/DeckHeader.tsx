'use client';

import { useState } from 'react';
import { Link2, Check, Share2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { PrivacyBadge } from './PrivacyBadge';
import { ShareModal } from './ShareModal';
import { isSupabaseConfigured } from '@/lib/supabase';
import type { Deck, DeckShare, DeckPermissions } from '@/types';

interface DeckHeaderProps {
  deck: Deck;
  permissions: DeckPermissions;
  shares: DeckShare[];
}

export function DeckHeader({ deck, permissions, shares }: DeckHeaderProps) {
  const [copied, setCopied] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

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
    <>
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 pb-6">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
              {deck.name}
            </h1>
            {deck.is_private && <PrivacyBadge />}
          </div>
          {deck.description && (
            <p className="mt-1 text-base text-surface-500 dark:text-surface-400">
              {deck.description}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
          {permissions.canShare && isSupabaseConfigured && (
            <Button
              variant="secondary"
              onClick={() => setShareOpen(true)}
              className="transition-all duration-150"
            >
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          )}
          <Button
            variant="secondary"
            onClick={copyLink}
            className="transition-all duration-150"
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
      </div>

      {permissions.canShare && isSupabaseConfigured && (
        <ShareModal
          open={shareOpen}
          onClose={() => setShareOpen(false)}
          deckId={deck.id}
          deck={deck}
          initialShares={shares}
        />
      )}
    </>
  );
}
