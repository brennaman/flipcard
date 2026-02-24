import Link from 'next/link';
import { DarkModeToggle } from './DarkModeToggle';

export function Header() {
  return (
    <header className="sticky top-0 z-40 h-16 border-b border-surface-200 dark:border-surface-800 bg-surface-0/80 dark:bg-surface-900/80 backdrop-blur-lg">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        <Link
          href="/"
          className="text-xl font-bold tracking-tight text-surface-900 dark:text-surface-50 hover:text-primary-600 dark:hover:text-primary-400 transition-colors duration-150"
        >
          FlipCard
        </Link>
        <DarkModeToggle />
      </nav>
    </header>
  );
}
