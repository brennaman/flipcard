export interface Deck {
  id: string;
  name: string;
  description: string | null;
  created_at: string;
  updated_at: string;
  user_id?: string | null;
}

export interface Category {
  id: string;
  deck_id: string;
  name: string;
  color: string; // 'blue' | 'emerald' | 'amber' | 'violet' | 'slate'
  created_at: string;
}

export interface FlashCard {
  id: string;
  deck_id: string;
  title: string;
  content: string;
  category_id: string | null;
  sort_order: number;
  created_at: string;
  updated_at: string;
  category?: Category;
}

export interface DeckInput {
  name: string;
  description?: string;
}

export interface FlashCardInput {
  title: string;
  content: string;
  category_id: string | null;
}

export interface CategoryInput {
  name: string;
  color: string;
}
