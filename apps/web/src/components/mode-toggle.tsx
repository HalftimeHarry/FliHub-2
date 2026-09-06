import { Moon, Sun } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger
} from '@/components/ui/select.js';
import { useTheme, type Theme } from '@/components/theme-provider.js';

const themes: readonly Theme[] = ['light', 'dark', 'system'];

export function ModeToggle() {
  const { theme, setTheme } = useTheme();
  const Icon = theme === 'dark' ? Moon : Sun;

  return (
    <Select
      value={theme}
      onValueChange={(value) => {
        if (themes.includes(value as Theme)) {
          setTheme(value as Theme);
        }
      }}
    >
      <SelectTrigger
        aria-label="Select theme"
        className="size-9 justify-center p-0 [&>svg:last-child]:hidden"
      >
        <Icon />
        <span className="sr-only">Select theme</span>
      </SelectTrigger>
      <SelectContent align="end">
        <SelectItem value="light">Light</SelectItem>
        <SelectItem value="dark">Dark</SelectItem>
        <SelectItem value="system">System</SelectItem>
      </SelectContent>
    </Select>
  );
}
