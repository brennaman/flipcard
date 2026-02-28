import { redirect } from 'next/navigation';
import Link from 'next/link';
import { Lock, Users } from 'lucide-react';
import { getOwnedDecks, getSharedDecks } from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { PrivacyBadge } from '@/components/deck/PrivacyBadge';
import type { Deck, Permission } from '@/types';

export const metadata = { title: 'My Decks — FlipCard' };

const PERMISSION_LABELS: Record<Permission, string> = {
  viewer: 'Viewer',
  editor: 'Editor',
  manager: 'Manager',
};

function DeckRow({ deck, badge }: { deck: Deck; badge?: React.ReactNode }) {
  return (
    <Link
      href={`/deck/${deck.id}`}
      className={
        'flex items-center gap-4 px-4 py-4 rounded-xl ' +
        'bg-surface-0 dark:bg-surface-800 ' +
        'border border-surface-200 dark:border-surface-700 ' +
        'hover:border-primary-300 dark:hover:border-primary-600 ' +
        'hover:shadow-sm transition-all duration-150 group'
      }
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="font-semibold text-surface-900 dark:text-surface-50 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
            {deck.name}
          </span>
          {deck.is_private && <PrivacyBadge />}
          {badge}
        </div>
        {deck.description && (
          <p className="mt-0.5 text-sm text-surface-500 dark:text-surface-400 truncate">
            {deck.description}
          </p>
        )}
      </div>
      <span className="text-xs text-surface-400 shrink-0">
        {new Date(deck.updated_at).toLocaleDateString()}
      </span>
    </Link>
  );
}

function PermissionBadge({ permission }: { permission: Permission }) {
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-surface-100 dark:bg-surface-700 text-surface-500 dark:text-surface-400">
      <Users className="w-3 h-3" />
      {PERMISSION_LABELS[permission]}
    </span>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <p className="text-sm text-surface-400 dark:text-surface-500 py-6 text-center">
      {message}
    </p>
  );
}

export default async function DecksPage() {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) redirect('/');
  }

  const [ownedDecks, sharedEntries] = await Promise.all([
    getOwnedDecks(),
    getSharedDecks(),
  ]);

  return (
    <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <h1 className="text-3xl font-bold tracking-tight text-surface-900 dark:text-surface-50 mb-8">
        My Decks
      </h1>

      {/* Owned decks */}
      <section className="mb-10">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
          Created by you
        </h2>
        {ownedDecks.length === 0 ? (
          <EmptyState message="You haven't created any decks yet." />
        ) : (
          <div className="flex flex-col gap-2">
            {ownedDecks.map((deck) => (
              <DeckRow key={deck.id} deck={deck} />
            ))}
          </div>
        )}
      </section>

      {/* Shared decks — only shown in Supabase mode */}
      {isSupabaseConfigured && (
        <section>
          <h2 className="text-sm font-semibold uppercase tracking-wider text-surface-400 dark:text-surface-500 mb-3">
            Shared with you
          </h2>
          {sharedEntries.length === 0 ? (
            <EmptyState message="No decks have been shared with you yet." />
          ) : (
            <div className="flex flex-col gap-2">
              {sharedEntries.map(({ deck, permission }) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  badge={<PermissionBadge permission={permission} />}
                />
              ))}
            </div>
          )}
        </section>
      )}
    </main>
  );
}
