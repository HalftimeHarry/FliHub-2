import { Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button.js';
import { useTheme } from '@/components/theme-provider.js';

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      onClick={() => {
        setTheme(isDark ? 'light' : 'dark');
      }}
      className="size-9 rounded-full"
    >
      {isDark ? <Sun className="size-4" /> : <Moon className="size-4" />}
    </Button>
  );
}
