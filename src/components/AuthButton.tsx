'use client';

import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/Button';
import type { User } from '@supabase/supabase-js';

interface AuthButtonProps {
  user: User | null;
  redirectPath?: string;
}

export function AuthButton({ user, redirectPath }: AuthButtonProps) {
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignIn = async () => {
    const redirectTo = redirectPath
      ? `${window.location.origin}/auth/callback?next=${encodeURIComponent(redirectPath)}`
      : `${window.location.origin}/auth/callback`;
    await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo },
    });
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (user) {
    return (
      <div className="flex items-center gap-3">
        <span className="hidden sm:block text-sm text-surface-500 dark:text-surface-400 truncate max-w-[160px]">
          {user.email}
        </span>
        <Button variant="secondary" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    );
  }

  return (
    <Button variant="secondary" onClick={handleSignIn}>
      Sign in
    </Button>
  );
}
