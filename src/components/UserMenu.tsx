'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { LayoutGrid, LogOut } from 'lucide-react';
import { createBrowserClient } from '@supabase/ssr';
import type { User } from '@supabase/supabase-js';

export function UserMenu({ user }: { user: User }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.reload();
  };

  const initial = user.email?.[0]?.toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        aria-label="User menu"
        aria-expanded={open}
        className="w-9 h-9 rounded-full bg-primary-500 hover:bg-primary-600 active:bg-primary-700 text-white font-semibold text-sm flex items-center justify-center transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-surface-900"
      >
        {initial}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl border border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-800 shadow-xl overflow-hidden z-50">
          <div className="px-4 py-3 border-b border-surface-100 dark:border-surface-700">
            <p className="text-xs font-medium text-surface-400 dark:text-surface-500 truncate">
              {user.email}
            </p>
          </div>

          <div className="py-1">
            <Link
              href="/decks"
              onClick={() => setOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/60 transition-colors"
            >
              <LayoutGrid className="w-4 h-4 text-surface-400" />
              My Decks
            </Link>
          </div>

          <div className="border-t border-surface-100 dark:border-surface-700 py-1">
            <button
              onClick={handleSignOut}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-surface-700 dark:text-surface-200 hover:bg-surface-50 dark:hover:bg-surface-700/60 transition-colors"
            >
              <LogOut className="w-4 h-4 text-surface-400" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
