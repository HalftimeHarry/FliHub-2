import { Home, Network } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle.js';
import { Button } from '@/components/ui/button.js';

export type AppView = 'home' | 'diagram';

export function AppNavbar({
  activeView,
  onViewChange
}: {
  readonly activeView: AppView;
  readonly onViewChange: (view: AppView) => void;
}) {
  return (
    <nav className="border-b bg-background/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-8 py-3">
        <div className="flex items-center gap-6">
          <span className="text-sm font-semibold tracking-tight">FLIHub</span>
          <div className="flex items-center gap-1">
            <Button
              variant={activeView === 'home' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('home');
              }}
              aria-current={activeView === 'home' ? 'page' : undefined}
            >
              <Home />
              Home
            </Button>
            <Button
              variant={activeView === 'diagram' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('diagram');
              }}
              aria-current={activeView === 'diagram' ? 'page' : undefined}
            >
              <Network />
              Diagram
            </Button>
          </div>
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
}
