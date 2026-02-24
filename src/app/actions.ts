'use server';

import { revalidatePath } from 'next/cache';
import { createDeck, createCard, updateCard, deleteCard, createCategory, deleteCategory } from '@/lib/data';
import type { DeckInput, FlashCardInput, CategoryInput, Deck, FlashCard, Category } from '@/types';

// ─── Deck ─────────────────────────────────────────────────────────────────────

export async function createDeckAction(input: DeckInput): Promise<Deck> {
  return createDeck(input);
}

// ─── Cards ────────────────────────────────────────────────────────────────────

export async function createCardAction(deckId: string, input: FlashCardInput): Promise<FlashCard> {
  const card = await createCard(deckId, input);
  revalidatePath(`/deck/${deckId}`);
  return card;
}

export async function updateCardAction(
  deckId: string,
  cardId: string,
  input: FlashCardInput
): Promise<FlashCard> {
  const card = await updateCard(deckId, cardId, input);
  revalidatePath(`/deck/${deckId}`);
  return card;
}

export async function deleteCardAction(deckId: string, cardId: string): Promise<void> {
  await deleteCard(deckId, cardId);
  revalidatePath(`/deck/${deckId}`);
}

// ─── Categories ───────────────────────────────────────────────────────────────

export async function createCategoryAction(
  deckId: string,
  input: CategoryInput
): Promise<Category> {
  const category = await createCategory(deckId, input);
  revalidatePath(`/deck/${deckId}`);
  return category;
}

export async function deleteCategoryAction(deckId: string, categoryId: string): Promise<void> {
  await deleteCategory(deckId, categoryId);
  revalidatePath(`/deck/${deckId}`);
}
