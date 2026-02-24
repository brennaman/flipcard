'use client';

import { useEffect, useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { MarkdownEditor } from '@/components/ui/MarkdownEditor';
import type { FlashCard, Category, FlashCardInput } from '@/types';

const COLORS = ['blue', 'emerald', 'amber', 'violet', 'slate'] as const;

interface CardFormProps {
  open: boolean;
  onClose: () => void;
  onSave: (input: FlashCardInput) => Promise<void>;
  onCreateCategory: (name: string, color: string) => Promise<Category>;
  categories: Category[];
  editCard?: FlashCard | null;
}

export function CardForm({
  open,
  onClose,
  onSave,
  onCreateCategory,
  categories,
  editCard,
}: CardFormProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [categoryId, setCategoryId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [newCategoryMode, setNewCategoryMode] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [newCategoryColor, setNewCategoryColor] = useState<string>('blue');

  // Populate form when editing
  useEffect(() => {
    if (editCard) {
      setTitle(editCard.title);
      setContent(editCard.content);
      setCategoryId(editCard.category_id);
    } else {
      setTitle('');
      setContent('');
      setCategoryId(null);
    }
    setError('');
    setNewCategoryMode(false);
    setNewCategoryName('');
  }, [editCard, open]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) { setError('Title is required'); return; }
    if (!content.trim()) { setError('Content is required'); return; }
    setLoading(true);
    setError('');
    try {
      // If creating a new category inline
      let finalCategoryId = categoryId;
      if (newCategoryMode && newCategoryName.trim()) {
        const cat = await onCreateCategory(newCategoryName.trim(), newCategoryColor);
        finalCategoryId = cat.id;
      }
      await onSave({ title: title.trim(), content: content.trim(), category_id: finalCategoryId });
      onClose();
    } catch {
      setError('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    if (val === '__new__') {
      setNewCategoryMode(true);
      setCategoryId(null);
    } else {
      setNewCategoryMode(false);
      setCategoryId(val === '' ? null : val);
    }
  };

  const inputClass =
    'w-full px-3 py-2.5 rounded-lg border border-surface-200 dark:border-surface-600 ' +
    'bg-surface-0 dark:bg-surface-900 text-surface-800 dark:text-surface-100 ' +
    'placeholder:text-surface-400 text-base ' +
    'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 ' +
    'transition-colors duration-150';

  const labelClass = 'block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5';

  return (
    <Modal open={open} onClose={onClose} title={editCard ? 'Edit Card' : 'Add Card'}>
      <form onSubmit={handleSave} className="space-y-5 mt-2">
        <div>
          <label className={labelClass}>Title <span className="text-surface-400 font-normal text-xs">(front of card)</span></label>
          <input
            type="text"
            placeholder="e.g., Low Performer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className={inputClass}
            required
          />
        </div>

        <div>
          <label className={labelClass}>Content <span className="text-surface-400 font-normal text-xs">(back of card)</span></label>
          <MarkdownEditor
            value={content}
            onChange={setContent}
            placeholder="Describe the situation, definition, or details…"
            minHeight="min-h-[160px]"
          />
        </div>

        <div>
          <label className={labelClass}>Category</label>
          <div className="relative">
            <select
              value={newCategoryMode ? '__new__' : (categoryId ?? '')}
              onChange={handleSelectChange}
              className={`${inputClass} appearance-none pr-8`}
            >
              <option value="">None</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
              <option value="__new__">+ New Category</option>
            </select>
            <svg
              className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-surface-400"
              viewBox="0 0 20 20" fill="currentColor"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </div>

          {/* New category inline form */}
          {newCategoryMode && (
            <div className="mt-3 p-3 rounded-lg bg-surface-50 dark:bg-surface-900 border border-surface-200 dark:border-surface-700 space-y-3">
              <input
                type="text"
                placeholder="Category name"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                className={inputClass}
              />
              <div className="flex gap-2">
                {COLORS.map((color) => (
                  <button
                    key={color}
                    type="button"
                    onClick={() => setNewCategoryColor(color)}
                    className={`w-6 h-6 rounded-full border-2 transition-all ${
                      newCategoryColor === color
                        ? 'border-surface-700 dark:border-surface-200 scale-110'
                        : 'border-transparent'
                    } ${
                      color === 'blue' ? 'bg-primary-400' :
                      color === 'emerald' ? 'bg-emerald-400' :
                      color === 'amber' ? 'bg-amber-400' :
                      color === 'violet' ? 'bg-violet-400' :
                      'bg-surface-400'
                    }`}
                    aria-label={`${color} color`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {error && <p className="text-sm text-error">{error}</p>}

        <div className="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
          <Button type="button" variant="secondary" onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button type="submit" disabled={loading}>
            {loading ? 'Saving…' : 'Save Card'}
          </Button>
        </div>
      </form>
    </Modal>
  );
}
