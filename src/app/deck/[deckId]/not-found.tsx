import Link from 'next/link';
import { AlertCircle } from 'lucide-react';

export default function DeckNotFound() {
  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <AlertCircle className="w-12 h-12 text-surface-300 dark:text-surface-600 mb-4" />
        <h2 className="text-2xl font-semibold text-surface-700 dark:text-surface-300">
          Deck not found
        </h2>
        <p className="text-base text-surface-400 mt-2">
          This deck doesn&apos;t exist or may have been deleted.
        </p>
        <Link
          href="/"
          className="mt-6 text-primary-500 hover:text-primary-600 dark:text-primary-400 dark:hover:text-primary-300 font-medium transition-colors"
        >
          ← Create a new deck
        </Link>
      </div>
    </main>
  );
}
