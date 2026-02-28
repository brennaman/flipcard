'use server';

import { revalidatePath } from 'next/cache';
import {
  createDeck, createCard, updateCard, deleteCard, createCategory, deleteCategory, reorderCards,
  updateDeckPrivacy, addDeckShare, removeDeckShare, updateDeckSharePermission, acceptInviteByToken,
} from '@/lib/data';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import type { DeckInput, FlashCardInput, CategoryInput, Deck, FlashCard, Category, DeckShare, Permission } from '@/types';

// ─── Deck ─────────────────────────────────────────────────────────────────────

export async function createDeckAction(input: DeckInput): Promise<Deck> {
  let userId: string | null = null;
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    userId = user?.id ?? null;
  }
  return createDeck(input, userId);
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

export async function reorderCardsAction(deckId: string, cardIds: string[]): Promise<void> {
  await reorderCards(deckId, cardIds);
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

// ─── Privacy & Sharing ────────────────────────────────────────────────────────

export async function updateDeckPrivacyAction(deckId: string, isPrivate: boolean): Promise<void> {
  await updateDeckPrivacy(deckId, isPrivate);
  revalidatePath(`/deck/${deckId}`);
}

export async function addDeckShareAction(
  deckId: string,
  input: { email?: string; permission: Permission; generateToken?: boolean }
): Promise<DeckShare> {
  const share = await addDeckShare(deckId, input);
  revalidatePath(`/deck/${deckId}`);
  return share;
}

export async function removeDeckShareAction(deckId: string, shareId: string): Promise<void> {
  await removeDeckShare(shareId);
  revalidatePath(`/deck/${deckId}`);
}

export async function updateDeckSharePermissionAction(
  deckId: string,
  shareId: string,
  permission: Permission
): Promise<void> {
  await updateDeckSharePermission(shareId, permission);
  revalidatePath(`/deck/${deckId}`);
}

export async function acceptInviteByTokenAction(deckId: string, token: string): Promise<void> {
  if (!isSupabaseConfigured) return;
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) throw new Error('Not signed in');
  await acceptInviteByToken(token, user.id);
  revalidatePath(`/deck/${deckId}`);
}
