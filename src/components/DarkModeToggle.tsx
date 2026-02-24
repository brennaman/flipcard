'use client';

import { Sun, Moon } from 'lucide-react';
import { useDarkMode } from '@/hooks/useDarkMode';
import { IconButton } from './ui/IconButton';

export function DarkModeToggle() {
  const { isDark, toggle, mounted } = useDarkMode();

  if (!mounted) {
    return <div className="w-10 h-10" />; // placeholder to avoid layout shift
  }

  return (
    <IconButton
      label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={toggle}
    >
      {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
    </IconButton>
  );
}
