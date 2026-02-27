import { CreateDeckForm } from '@/components/landing/CreateDeckForm';
import { EnterDeckUrl } from '@/components/landing/EnterDeckUrl';
import { getSampleDeckId } from '@/lib/store';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import Link from 'next/link';

export default async function HomePage() {
  const sampleDeckId = !isSupabaseConfigured ? getSampleDeckId() : null;

  let isLoggedIn = true; // local mode: always allow creation
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();
    isLoggedIn = !!user;
  }

  return (
    <main className="min-h-[calc(100vh-64px)] flex items-center justify-center px-4">
      <div className="w-full max-w-md text-center">
        {/* Logo / Icon */}
        <div className="mx-auto mb-6 w-16 h-16 rounded-2xl bg-primary-500 flex items-center justify-center shadow-lg">
          <svg
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="w-9 h-9"
          >
            <rect x="4" y="8" width="20" height="14" rx="3" fill="white" fillOpacity="0.3" />
            <rect x="8" y="10" width="20" height="14" rx="3" fill="white" fillOpacity="0.6" />
            <rect x="6" y="12" width="20" height="12" rx="3" fill="white" />
            <rect x="10" y="16" width="12" height="1.5" rx="0.75" fill="#3B82F6" />
            <rect x="12" y="19.5" width="8" height="1.5" rx="0.75" fill="#93C5FD" />
          </svg>
        </div>

        <h1 className="text-4xl sm:text-5xl font-bold tracking-tight text-surface-900 dark:text-surface-50">
          FlipCard
        </h1>
        <p className="mt-3 text-lg text-surface-500 dark:text-surface-400 max-w-sm mx-auto">
          Create and share flashcard decks for interview prep, studying, or anything.
        </p>

        <CreateDeckForm isLoggedIn={isLoggedIn} />

        {/* Divider */}
        <div className="my-8 flex items-center gap-4">
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
          <span className="text-sm text-surface-400 px-2">or</span>
          <div className="flex-1 h-px bg-surface-200 dark:bg-surface-700" />
        </div>

        <EnterDeckUrl />

        {sampleDeckId && (
          <p className="mt-6 text-sm text-surface-400 dark:text-surface-500">
            Or try the{' '}
            <Link
              href={`/deck/${sampleDeckId}`}
              className="text-primary-500 dark:text-primary-400 hover:text-primary-600 dark:hover:text-primary-300 font-medium transition-colors"
            >
              sample deck →
            </Link>
          </p>
        )}
      </div>
    </main>
  );
}
