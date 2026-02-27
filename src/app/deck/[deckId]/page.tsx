import { notFound } from 'next/navigation';
import { getDeck, getCards, getCategories } from '@/lib/data';
import { DeckHeader } from '@/components/deck/DeckHeader';
import { CardGrid } from '@/components/deck/CardGrid';
import { LocalModeBanner } from '@/components/LocalModeBanner';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

interface PageProps {
  params: { deckId: string };
}

export default async function DeckPage({ params }: PageProps) {
  const { deckId } = params;

  const [deck, cards, categories] = await Promise.all([
    getDeck(deckId),
    getCards(deckId),
    getCategories(deckId),
  ]);

  if (!deck) {
    notFound();
  }

  // Compute ownership: in local mode everyone is owner; in Supabase mode check user_id
  let isOwner = !isSupabaseConfigured;
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    isOwner = !!user && user.id === deck.user_id;
  }

  return (
    <div>
      {!isSupabaseConfigured && <LocalModeBanner />}

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <DeckHeader deck={deck} isOwner={isOwner} />
        <CardGrid deckId={deckId} initialCards={cards} initialCategories={categories} isOwner={isOwner} />
      </main>
    </div>
  );
}

export async function generateMetadata({ params }: PageProps) {
  const deck = await getDeck(params.deckId);
  if (!deck) return { title: 'Deck not found — FlipCard' };
  return {
    title: `${deck.name} — FlipCard`,
    description: deck.description ?? `A FlipCard deck: ${deck.name}`,
  };
}
