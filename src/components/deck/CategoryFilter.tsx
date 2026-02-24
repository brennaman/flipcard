'use client';

import { Tag } from '@/components/ui/Tag';
import type { Category } from '@/types';

interface CategoryFilterProps {
  categories: Category[];
  selected: string | null;
  onSelect: (id: string | null) => void;
  cardCount: number;
  filteredCount: number;
}

const colorMap: Record<string, 'blue' | 'emerald' | 'amber' | 'violet' | 'slate'> = {
  blue: 'blue',
  emerald: 'emerald',
  amber: 'amber',
  violet: 'violet',
  slate: 'slate',
};

export function CategoryFilter({
  categories,
  selected,
  onSelect,
  cardCount,
  filteredCount,
}: CategoryFilterProps) {
  if (categories.length === 0) return null;

  return (
    <div role="tablist" aria-label="Filter by category" className="flex gap-2 flex-wrap">
      <Tag
        label={`All (${cardCount})`}
        color="slate"
        interactive
        selected={selected === null}
        onClick={() => onSelect(null)}
      />
      {categories.map((cat) => (
        <Tag
          key={cat.id}
          label={cat.name}
          color={colorMap[cat.color] ?? 'blue'}
          interactive
          selected={selected === cat.id}
          onClick={() => onSelect(cat.id)}
        />
      ))}
      {/* Live region for screen readers */}
      <span className="sr-only" aria-live="polite">
        {selected
          ? `Showing ${filteredCount} cards in ${categories.find((c) => c.id === selected)?.name ?? ''}`
          : `Showing all ${cardCount} cards`}
      </span>
    </div>
  );
}
