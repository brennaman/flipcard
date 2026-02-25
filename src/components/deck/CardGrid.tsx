'use client';

import { useState, useTransition, useRef, useCallback, useEffect } from 'react';
import {
  DndContext,
  DragEndEvent,
  PointerSensor,
  useSensor,
  useSensors,
  closestCenter,
} from '@dnd-kit/core';
import {
  SortableContext,
  rectSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { SortableCard } from './SortableCard';
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
  reorderCardsAction,
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

  // ─── Roving tabindex ─────────────────────────────────────────────────────────
  // Tracks which item in the grid is the Tab "entry point".
  // ADD_CARD_INDEX = filteredCards.length (the Add Card button).
  const [focusedIndex, setFocusedIndex] = useState(0);

  // ─── Refs for keyboard navigation ────────────────────────────────────────────
  const gridRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const addCardButtonRef = useRef<HTMLButtonElement | null>(null);
  // Remembers which card to refocus after closing the detail view
  const detailRestoreFocusRef = useRef<HTMLButtonElement | null>(null);

  const filteredCards = selectedCategory
    ? cards.filter((c) => c.category_id === selectedCategory)
    : cards;

  // Keep cardRefs array in sync with filteredCards length
  useEffect(() => {
    cardRefs.current = cardRefs.current.slice(0, filteredCards.length);
  }, [filteredCards.length]);

  // Reset roving tabindex to first card whenever the filter changes
  useEffect(() => {
    setFocusedIndex(0);
  }, [selectedCategory]);

  // ─── DnD sensors ─────────────────────────────────────────────────────────────
  // Only pointer/touch drag — keyboard navigation is handled by our own arrow key logic
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 8 },
    })
  );

  const isDragEnabled = selectedCategory === null;

  // ─── Keyboard navigation ─────────────────────────────────────────────────────
  const getColumnCount = useCallback((): number => {
    const grid = gridRef.current;
    if (!grid) return 1;
    const cols = getComputedStyle(grid)
      .getPropertyValue('grid-template-columns')
      .trim()
      .split(' ')
      .filter(Boolean).length;
    return cols || 1;
  }, []);

  const handleCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
      const total = filteredCards.length;
      const cols = getColumnCount();
      let nextIndex: number | null = null;
      let focusAdd = false;

      switch (e.key) {
        case 'ArrowRight':
          e.preventDefault();
          if (index < total - 1) nextIndex = index + 1;
          else focusAdd = true;
          break;
        case 'ArrowLeft':
          e.preventDefault();
          if (index > 0) nextIndex = index - 1;
          break;
        case 'ArrowDown':
          e.preventDefault();
          if (index + cols < total) nextIndex = index + cols;
          else if (index < total - 1) focusAdd = true;
          break;
        case 'ArrowUp':
          e.preventDefault();
          if (index - cols >= 0) nextIndex = index - cols;
          break;
        default:
          return;
      }

      if (nextIndex !== null) {
        setFocusedIndex(nextIndex);
        cardRefs.current[nextIndex]?.focus();
      } else if (focusAdd) {
        setFocusedIndex(total); // Add Card button lives at index = total
        addCardButtonRef.current?.focus();
      }
    },
    [filteredCards.length, getColumnCount]
  );

  const handleAddCardKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLButtonElement>) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        const last = filteredCards.length - 1;
        if (last >= 0) {
          setFocusedIndex(last);
          cardRefs.current[last]?.focus();
        }
      }
    },
    [filteredCards.length]
  );

  // ─── DnD reorder ─────────────────────────────────────────────────────────────
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = cards.findIndex((c) => c.id === active.id);
    const newIndex = cards.findIndex((c) => c.id === over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    const prevCards = cards;
    const reordered = arrayMove(cards, oldIndex, newIndex);
    setCards(reordered);

    startTransition(async () => {
      try {
        await reorderCardsAction(deckId, reordered.map((c) => c.id));
      } catch {
        setCards(prevCards);
        showToast('Failed to save order', 'error');
      }
    });
  };

  // ─── Click grid background to focus first card ───────────────────────────
  const handleGridClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!(e.target as HTMLElement).closest('button')) {
      setFocusedIndex(0);
      cardRefs.current[0]?.focus();
    }
  };

  // ─── Redirect focus to first card when grid container is focused ──────────
  // Handles the skip-nav link jumping to #card-grid — instead of landing on
  // the container div, we send focus straight to the first card.
  const handleGridFocus = (e: React.FocusEvent<HTMLDivElement>) => {
    if (e.target === e.currentTarget) {
      setFocusedIndex(0);
      cardRefs.current[0]?.focus();
    }
  };

  // ─── Card CRUD ───────────────────────────────────────────────────────────────
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

  const handleOpenCard = (card: FlashCardType, index: number) => {
    detailRestoreFocusRef.current = cardRefs.current[index] ?? null;
    setActiveCard(card);
  };

  const handleCloseDetail = () => {
    setActiveCard(null);
    // Return focus to the card that was opened, after the overlay unmounts
    requestAnimationFrame(() => {
      detailRestoreFocusRef.current?.focus();
    });
  };

  const handleSaveCard = async (input: Parameters<typeof createCardAction>[1]) => {
    if (editCard) {
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
    setCards((prev) => prev.filter((c) => c.id !== deleteTarget.id));
    const target = deleteTarget;
    setDeleteTarget(null);
    setDeleteLoading(false);

    try {
      await deleteCardAction(deckId, target.id);
      showToast('Card deleted');
    } catch {
      setCards((prev) => [...prev, target].sort((a, b) => a.sort_order - b.sort_order));
      showToast('Something went wrong', 'error');
    }
  };

  const handleCreateCategory = async (name: string, color: string) => {
    const cat = await createCategoryAction(deckId, { name, color });
    setCategories((prev) => [...prev, cat].sort((a, b) => a.name.localeCompare(b.name)));
    return cat;
  };

  const addCardTabIndex = focusedIndex === filteredCards.length ? 0 : -1;

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
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={filteredCards.map((c) => c.id)}
            strategy={rectSortingStrategy}
          >
            <div
              ref={gridRef}
              id="card-grid"
              tabIndex={-1}
              onClick={handleGridClick}
              onFocus={handleGridFocus}
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 focus:outline-none"
            >
              {filteredCards.map((card, index) => (
                <SortableCard
                  key={card.id}
                  card={card}
                  index={index}
                  onClick={() => handleOpenCard(card, index)}
                  onEdit={() => handleEditCard(card)}
                  onDelete={() => handleDeleteCard(card)}
                  dragEnabled={isDragEnabled}
                  tabIndex={focusedIndex === index ? 0 : -1}
                  onFocus={() => setFocusedIndex(index)}
                  onKeyDown={(e) => handleCardKeyDown(e, index)}
                  cardRef={(el) => { cardRefs.current[index] = el; }}
                />
              ))}
              <AddCardButton
                ref={addCardButtonRef}
                onClick={handleAddCard}
                onKeyDown={handleAddCardKeyDown}
                onFocus={() => setFocusedIndex(filteredCards.length)}
                tabIndex={addCardTabIndex}
              />
            </div>
          </SortableContext>
        </DndContext>
      )}

      {/* Card detail overlay */}
      <CardDetail card={activeCard} onClose={handleCloseDetail} />

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
