'use client';

import { useState, useTransition } from 'react';
import { FlashCard } from './FlashCard';
import { CardDetail } from './CardDetail';
import { CardForm } from './CardForm';
import { AddCardButton } from './AddCardButton';
import { CategoryFilter } from './CategoryFilter';
import { EmptyState } from './EmptyState';
import { ToastContainer } from '@/components/ui/Toast';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { useToast } from '@/hooks/useToast';
import type { FlashCard as FlashCardType, Category } from '@/types';
import {
  createCardAction,
  updateCardAction,
  deleteCardAction,
  createCategoryAction,
} from '@/app/actions';

interface CardGridProps {
  deckId: string;
  initialCards: FlashCardType[];
  initialCategories: Category[];
}

export function CardGrid({ deckId, initialCards, initialCategories }: CardGridProps) {
  const [cards, setCards] = useState<FlashCardType[]>(initialCards);
  const [categories, setCategories] = useState<Category[]>(initialCategories);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [activeCard, setActiveCard] = useState<FlashCardType | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [editCard, setEditCard] = useState<FlashCardType | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<FlashCardType | null>(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [, startTransition] = useTransition();
  const { toasts, showToast, removeToast } = useToast();

  const filteredCards = selectedCategory
    ? cards.filter((c) => c.category_id === selectedCategory)
    : cards;

  const handleAddCard = () => {
    setEditCard(null);
    setFormOpen(true);
  };

  const handleEditCard = (card: FlashCardType) => {
    setEditCard(card);
    setFormOpen(true);
  };

  const handleDeleteCard = (card: FlashCardType) => {
    setDeleteTarget(card);
  };

  const handleSaveCard = async (input: Parameters<typeof createCardAction>[1]) => {
    if (editCard) {
      // Optimistic update
      const optimistic = { ...editCard, ...input };
      const cat = categories.find((c) => c.id === input.category_id);
      optimistic.category = cat;
      setCards((prev) => prev.map((c) => (c.id === editCard.id ? optimistic : c)));

      startTransition(async () => {
        try {
          const updated = await updateCardAction(deckId, editCard.id, input);
          setCards((prev) => prev.map((c) => (c.id === editCard.id ? updated : c)));
          showToast('Card updated');
        } catch {
          // Roll back
          setCards((prev) => prev.map((c) => (c.id === editCard.id ? editCard : c)));
          showToast('Something went wrong', 'error');
        }
      });
    } else {
      startTransition(async () => {
        try {
          const created = await createCardAction(deckId, input);
          setCards((prev) => [...prev, created]);
          showToast('Card created');
        } catch {
          showToast('Something went wrong', 'error');
        }
      });
    }
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleteLoading(true);
    // Optimistic remove
    setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    const target = deleteTarget;
    setDeleteTarget(null);
    setDeleteLoading(false);

    try {
      await deleteCardAction(deckId, target.id);
      showToast('Card deleted');
    } catch {
      // Roll back
      setCards((prev) => [...prev, target].sort((a, b) => a.sort_order - b.sort_order));
      showToast('Something went wrong', 'error');
    }
  };

  const handleCreateCategory = async (name: string, color: string) => {
    const cat = await createCategoryAction(deckId, { name, color });
    setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    return cat;
  };

  return (
    <>
      {/* Category filter */}
      {categories.length > 0 && (
        <div className="mb-6">
          <CategoryFilter
            categories={categories}
            selected={selectedCategory}
            onSelect={setSelectedCategory}
            cardCount={cards.length}
            filteredCount={filteredCards.length}
          />
        </div>
      )}

      {/* Card grid */}
      {filteredCards.length === 0 && cards.length === 0 ? (
        <EmptyState onAddCard={handleAddCard} />
      ) : filteredCards.length === 0 ? (
        <EmptyState isFiltered />
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {filteredCards.map((card, index) => (
            <FlashCard
              key={card.id}
              card={card}
              index={index}
              onClick={() => setActiveCard(card)}
              onEdit={() => handleEditCard(card)}
              onDelete={() => handleDeleteCard(card)}
            />
          ))}
          <AddCardButton onClick={handleAddCard} />
        </div>
      )}

      {/* Card detail overlay */}
      <CardDetail card={activeCard} onClose={() => setActiveCard(null)} />

      {/* Card form modal */}
      <CardForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        onSave={handleSaveCard}
        onCreateCategory={handleCreateCategory}
        categories={categories}
        editCard={editCard}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Card"
        description={`Are you sure you want to delete "${deleteTarget?.title}"? This can't be undone.`}
        loading={deleteLoading}
      />

      {/* Toast notifications */}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  );
}
