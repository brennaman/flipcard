import type { Deck, FlashCard, Category, DeckInput, FlashCardInput, CategoryInput, DeckShare, Permission } from '@/types';
import { isSupabaseConfigured } from './supabase';
import { createSupabaseServerClient } from './supabase-server';
import { store } from './store';
import { randomUUID } from 'crypto';

// ─── Decks ────────────────────────────────────────────────────────────────────

export async function getDeck(deckId: string): Promise<Deck | null> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();
    if (error) console.error('[getDeck] Supabase error:', JSON.stringify(error));
    return data ?? null;
  }
  return store.decks.get(deckId) ?? null;
}

export async function createDeck(input: DeckInput, userId?: string | null): Promise<Deck> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('decks')
      .insert({ name: input.name, description: input.description ?? null, user_id: userId ?? null })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const deck: Deck = {
    id,
    name: input.name,
    description: input.description ?? null,
    created_at: now,
    updated_at: now,
    user_id: null,
    is_private: false,
  };
  store.decks.set(id, deck);
  return deck;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(deckId: string): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('categories')
      .select('*')
      .eq('deck_id', deckId)
      .order('name', { ascending: true });
    return data ?? [];
  }
  return Array.from(store.categories.values())
    .filter((c) => c.deck_id === deckId)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export async function createCategory(deckId: string, input: CategoryInput): Promise<Category> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('categories')
      .insert({ deck_id: deckId, name: input.name, color: input.color })
      .select()
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const id = randomUUID();
  const category: Category = {
    id,
    deck_id: deckId,
    name: input.name,
    color: input.color,
    created_at: new Date().toISOString(),
  };
  store.categories.set(id, category);
  return category;
}

export async function deleteCategory(deckId: string, categoryId: string): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.from('categories').delete().eq('id', categoryId).eq('deck_id', deckId);
    return;
  }
  store.categories.delete(categoryId);
  // Null out category_id on associated cards
  Array.from(store.flashcards.values()).forEach((card) => {
    if (card.category_id === categoryId) {
      card.category_id = null;
      card.category = undefined;
    }
  });
}

// ─── Flashcards ───────────────────────────────────────────────────────────────

export async function getCards(deckId: string): Promise<FlashCard[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('flashcards')
      .select('*, category:categories(*)')
      .eq('deck_id', deckId)
      .order('sort_order', { ascending: true });
    return data ?? [];
  }
  const categories = new Map(
    Array.from(store.categories.values()).map((c) => [c.id, c])
  );
  return Array.from(store.flashcards.values())
    .filter((c) => c.deck_id === deckId)
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((card) => ({
      ...card,
      category: card.category_id ? categories.get(card.category_id) : undefined,
    }));
}

export async function createCard(deckId: string, input: FlashCardInput): Promise<FlashCard> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const existing = await getCards(deckId);
    const sort_order = existing.length;
    const { data, error } = await supabase
      .from('flashcards')
      .insert({ deck_id: deckId, ...input, sort_order })
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const id = randomUUID();
  const now = new Date().toISOString();
  const existing = Array.from(store.flashcards.values()).filter((c) => c.deck_id === deckId);
  const category = input.category_id ? store.categories.get(input.category_id) : undefined;
  const card: FlashCard = {
    id,
    deck_id: deckId,
    title: input.title,
    content: input.content,
    category_id: input.category_id,
    sort_order: existing.length,
    created_at: now,
    updated_at: now,
    category,
  };
  store.flashcards.set(id, card);
  return card;
}

export async function updateCard(
  deckId: string,
  cardId: string,
  input: FlashCardInput
): Promise<FlashCard> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data, error } = await supabase
      .from('flashcards')
      .update({ ...input, updated_at: new Date().toISOString() })
      .eq('id', cardId)
      .eq('deck_id', deckId)
      .select('*, category:categories(*)')
      .single();
    if (error) throw new Error(error.message);
    return data;
  }
  const existing = store.flashcards.get(cardId);
  if (!existing) throw new Error('Card not found');
  const category = input.category_id ? store.categories.get(input.category_id) : undefined;
  const updated: FlashCard = {
    ...existing,
    title: input.title,
    content: input.content,
    category_id: input.category_id,
    category,
    updated_at: new Date().toISOString(),
  };
  store.flashcards.set(cardId, updated);
  return updated;
}

export async function deleteCard(deckId: string, cardId: string): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await supabase.from('flashcards').delete().eq('id', cardId).eq('deck_id', deckId);
    return;
  }
  store.flashcards.delete(cardId);
}

export async function reorderCards(deckId: string, cardIds: string[]): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    await Promise.all(
      cardIds.map((id, index) =>
        supabase
          .from('flashcards')
          .update({ sort_order: index })
          .eq('id', id)
          .eq('deck_id', deckId)
      )
    );
    return;
  }
  cardIds.forEach((id, index) => {
    const card = store.flashcards.get(id);
    if (card && card.deck_id === deckId) {
      store.flashcards.set(id, { ...card, sort_order: index });
    }
  });
}

// ─── Privacy & Sharing ────────────────────────────────────────────────────────

export async function updateDeckPrivacy(deckId: string, isPrivate: boolean): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { error } = await supabase
      .from('decks')
      .update({ is_private: isPrivate })
      .eq('id', deckId);
    if (error) throw new Error(error.message);
    return;
  }
  const deck = store.decks.get(deckId);
  if (deck) store.decks.set(deckId, { ...deck, is_private: isPrivate });
}

export async function getDeckShares(deckId: string): Promise<DeckShare[]> {
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase
      .from('deck_shares')
      .select('*')
      .eq('deck_id', deckId)
      .order('created_at', { ascending: true });
    return data ?? [];
  }
  return [];
}

export async function addDeckShare(
  deckId: string,
  input: { email?: string; permission: Permission; generateToken?: boolean }
): Promise<DeckShare> {
  if (!isSupabaseConfigured) throw new Error('Sharing not available in local mode');
  const supabase = await createSupabaseServerClient();

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payload: Record<string, any> = { deck_id: deckId, permission: input.permission };

  if (input.email) {
    payload.email = input.email;
    // Look up whether the user has already signed in
    const { data: profile } = await supabase
      .from('profiles')
      .select('id')
      .eq('email', input.email)
      .maybeSingle();
    if (profile) {
      payload.user_id = profile.id;
      payload.accepted_at = new Date().toISOString();
    }
  }

  if (input.generateToken) {
    payload.token = randomUUID();
  }

  const { data, error } = await supabase
    .from('deck_shares')
    .insert(payload)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function removeDeckShare(shareId: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from('deck_shares').delete().eq('id', shareId);
}

export async function updateDeckSharePermission(
  shareId: string,
  permission: Permission
): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createSupabaseServerClient();
  const { error } = await supabase
    .from('deck_shares')
    .update({ permission })
    .eq('id', shareId);
  if (error) throw new Error(error.message);
}

export async function getShareByToken(token: string): Promise<DeckShare | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('deck_shares')
    .select('*')
    .eq('token', token)
    .maybeSingle();
  return data ?? null;
}

export async function acceptInviteByToken(
  token: string,
  userId: string
): Promise<DeckShare | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  // Find the unclaimed share
  const { data: share } = await supabase
    .from('deck_shares')
    .select('*')
    .eq('token', token)
    .is('accepted_at', null)
    .maybeSingle();
  if (!share) return null;
  // Claim it
  const { data, error } = await supabase
    .from('deck_shares')
    .update({ user_id: userId, accepted_at: new Date().toISOString() })
    .eq('id', share.id)
    .select()
    .single();
  if (error) throw new Error(error.message);
  return data;
}

export async function getUserPermission(
  deckId: string,
  userId: string
): Promise<Permission | null> {
  if (!isSupabaseConfigured) return null;
  const supabase = await createSupabaseServerClient();
  const { data } = await supabase
    .from('deck_shares')
    .select('permission')
    .eq('deck_id', deckId)
    .eq('user_id', userId)
    .not('accepted_at', 'is', null)
    .maybeSingle();
  return (data?.permission as Permission) ?? null;
}

export async function upsertProfile(userId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createSupabaseServerClient();
  await supabase.from('profiles').upsert({ id: userId, email }, { onConflict: 'id' });
}

export async function claimPendingEmailShares(userId: string, email: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createSupabaseServerClient();
  await supabase
    .from('deck_shares')
    .update({ user_id: userId, accepted_at: new Date().toISOString() })
    .eq('email', email)
    .is('user_id', null)
    .is('accepted_at', null);
}

export async function getOwnedDecks(): Promise<Deck[]> {
  if (!isSupabaseConfigured) {
    return Array.from(store.decks.values())
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('decks')
    .select('*')
    .eq('user_id', user.id)
    .order('updated_at', { ascending: false });
  return data ?? [];
}

export async function getSharedDecks(): Promise<{ deck: Deck; permission: Permission }[]> {
  if (!isSupabaseConfigured) return [];
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];
  const { data } = await supabase
    .from('deck_shares')
    .select('permission, deck:decks(*)')
    .eq('user_id', user.id)
    .not('accepted_at', 'is', null)
    .order('accepted_at', { ascending: false });
  return (data ?? [])
    .filter((row) => row.deck)
    .map((row) => ({ deck: row.deck as unknown as Deck, permission: row.permission as Permission }));
}
