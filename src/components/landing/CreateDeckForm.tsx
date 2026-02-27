'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/Button';
import { createDeckAction } from '@/app/actions';

interface CreateDeckFormProps {
  isLoggedIn: boolean;
}

export function CreateDeckForm({ isLoggedIn }: CreateDeckFormProps) {
  const router = useRouter();
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSignIn = async () => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError('Deck name is required');
      return;
    }
    setLoading(true);
    setError('');
    try {
      const deck = await createDeckAction({ name: name.trim(), description: description.trim() || undefined });
      router.push(`/deck/${deck.id}`);
    } catch {
      setError('Something went wrong. Please try again.');
      setLoading(false);
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="mt-10 p-6 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-900 text-center">
        <p className="text-surface-600 dark:text-surface-300 mb-4">
          Sign in to create a new deck.
        </p>
        <Button size="lg" className="w-full" onClick={handleSignIn}>
          Sign in with Google
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 space-y-4 text-left">
      <div>
        <label
          htmlFor="deck-name"
          className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
        >
          Deck name
        </label>
        <input
          id="deck-name"
          type="text"
          placeholder="e.g., Interview Prep"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="w-full px-3 py-2.5 rounded-lg border border-surface-200 dark:border-surface-600
                     bg-surface-0 dark:bg-surface-900 text-surface-800 dark:text-surface-100
                     placeholder:text-surface-400 text-base
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     transition-colors duration-150"
          required
        />
      </div>
      <div>
        <label
          htmlFor="deck-description"
          className="block text-sm font-medium text-surface-700 dark:text-surface-300 mb-1.5"
        >
          Description <span className="text-surface-400 font-normal">(optional)</span>
        </label>
        <textarea
          id="deck-description"
          placeholder="What's this deck for?"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={2}
          className="w-full px-3 py-2.5 rounded-lg border border-surface-200 dark:border-surface-600
                     bg-surface-0 dark:bg-surface-900 text-surface-800 dark:text-surface-100
                     placeholder:text-surface-400 text-base resize-none
                     focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500
                     transition-colors duration-150"
        />
      </div>
      {error && <p className="text-sm text-error">{error}</p>}
      <Button type="submit" size="lg" className="w-full" disabled={loading}>
        {loading ? 'Creating…' : 'Create New Deck →'}
      </Button>
    </form>
  );
}
