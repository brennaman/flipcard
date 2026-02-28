import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';
import { AuthButton } from './AuthButton';
import { UserMenu } from './UserMenu';
import { isSupabaseConfigured } from '@/lib/supabase';
import { createSupabaseServerClient } from '@/lib/supabase-server';

export async function Header() {
  let user = null;
  if (isSupabaseConfigured) {
    const supabase = await createSupabaseServerClient();
    const { data } = await supabase.auth.getUser();
    user = data.user;
  }

  return (
    <header className="sticky top-0 z-40 h-16 border-b border-surface-200 dark:border-surface-800 bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
        >
          FlipCard
        </Link>
        <div className="flex items-center gap-3">
          <DarkModeToggle />
          {isSupabaseConfigured && (
            user ? <UserMenu user={user} /> : <AuthButton user={null} />
          )}
        </div>
      </nav>
    </header>
  );
}
