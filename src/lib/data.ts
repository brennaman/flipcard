import type { Deck, FlashCard, Category, DeckInput, FlashCardInput, CategoryInput } from '@/types';
import { isSupabaseConfigured, getSupabaseClient } from './supabase';
import { store } from './store';
import { randomUUID } from 'crypto';

// ─── Decks ────────────────────────────────────────────────────────────────────

export async function getDeck(deckId: string): Promise<Deck | null> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseClient();
    const { data } = await supabase!
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .single();
    return data ?? null;
  }
  return store.decks.get(deckId) ?? null;
}

export async function createDeck(input: DeckInput): Promise<Deck> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase!
      .from('decks')
      .insert({ name: input.name, description: input.description ?? null })
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
  };
  store.decks.set(id, deck);
  return deck;
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function getCategories(deckId: string): Promise<Category[]> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseClient();
    const { data } = await supabase!
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
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase!
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
    const supabase = await getSupabaseClient();
    await supabase!.from('categories').delete().eq('id', categoryId).eq('deck_id', deckId);
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
    const supabase = await getSupabaseClient();
    const { data } = await supabase!
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
    const supabase = await getSupabaseClient();
    const existing = await getCards(deckId);
    const sort_order = existing.length;
    const { data, error } = await supabase!
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
    const supabase = await getSupabaseClient();
    const { data, error } = await supabase!
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
    const supabase = await getSupabaseClient();
    await supabase!.from('flashcards').delete().eq('id', cardId).eq('deck_id', deckId);
    return;
  }
  store.flashcards.delete(cardId);
}

export async function reorderCards(deckId: string, cardIds: string[]): Promise<void> {
  if (isSupabaseConfigured) {
    const supabase = await getSupabaseClient();
    await Promise.all(
      cardIds.map((id, index) =>
        supabase!
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
