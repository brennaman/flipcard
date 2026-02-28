import { notFound, redirect } from 'next/navigation';
import { Lock } from 'lucide-react';
import { getDeck, getCards, getCategories, getDeckShares, getShareByToken, acceptInviteByToken, getUserPermission } from '@/lib/data';
import { DeckHeader } from '@/components/deck/DeckHeader';
import { CardGrid } from '@/components/deck/CardGrid';
import { LocalModeBanner } from '@/components/LocalModeBanner';
import { AuthButton } from '@/components/AuthButton';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { DeckPermissions } from '@/types';

interface PageProps {
  params: Promise<{ deckId: string }>;
  searchParams: Promise<{ token?: string }>;
}

export default async function DeckPage({ params, searchParams }: PageProps) {
  const { deckId } = await params;
  const { token: inviteToken } = await searchParams;

  // Get current user
  let userId: string | null = null;
  let userEmail: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
    userEmail = user?.email ?? null;
  }

  // If signed in with an invite token, accept it and redirect to clean URL
  if (userId && inviteToken) {
    await acceptInviteByToken(inviteToken, userId);
    redirect(`/deck/${deckId}`);
  }

  // Fetch deck — RLS will return null if private and user lacks access
  const deck = await getDeck(deckId);

  if (!deck) {
    // Check if an invite token is valid — if so, show sign-in prompt instead of 404
    if (inviteToken) {
      const share = await getShareByToken(inviteToken);
      if (share && share.deck_id === deckId) {
        return <InviteSignInPage deckId={deckId} token={inviteToken} />;
      }
    }
    notFound();
  }

  // Compute permissions
  let permissions: DeckPermissions;
  if (!isSupabaseConfigured) {
    permissions = { isOwner: true, canEdit: true, canDelete: true, canShare: true };
  } else if (userId && userId === deck.user_id) {
    permissions = { isOwner: true, canEdit: true, canDelete: true, canShare: true };
  } else if (userId) {
    const perm = await getUserPermission(deckId, userId);
    permissions = {
      isOwner: false,
      canEdit: perm === 'editor' || perm === 'manager',
      canDelete: perm === 'manager',
      canShare: false,
    };
  } else {
    permissions = { isOwner: false, canEdit: false, canDelete: false, canShare: false };
  }

  const [cards, categories, shares] = await Promise.all([
    getCards(deckId),
    getCategories(deckId),
    permissions.canShare ? getDeckShares(deckId) : Promise.resolve([]),
  ]);

  void userEmail; // unused but available for future use

  return (
    <div>
      {!isSupabaseConfigured && <LocalModeBanner />}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeckHeader deck={deck} permissions={permissions} shares={shares} />
        <CardGrid deckId={deckId} initialCards={cards} initialCategories={categories} permissions={permissions} />
      </main>
    </div>
  );
}

function InviteSignInPage({ deckId, token }: { deckId: string; token: string }) {
  const redirectPath = `/deck/${deckId}?token=${token}`;
  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="flex justify-center mb-4">
          <Lock className="w-12 h-12 text-surface-300 dark:text-surface-600" />
        </div>
        <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300">
          You&apos;ve been invited
        </h2>
        <p className="mt-2 text-base text-surface-400">
          Sign in to accept your invite and view this deck.
        </p>
        <div className="mt-6 flex justify-center">
          <AuthButton user={null} redirectPath={redirectPath} />
        </div>
      </div>
    </main>
  );
}

export async function generateMetadata({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const deck = await getDeck(deckId);
  if (!deck) return { title: 'Deck not found — FlipCard' };
  return {
    title: `${deck.name} — FlipCard`,
    description: deck.description ?? `A FlipCard deck: ${deck.name}`,
  };
}
