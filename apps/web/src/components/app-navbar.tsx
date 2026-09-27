import { Compass, Network, Rocket, Workflow } from 'lucide-react';
import { ModeToggle } from '@/components/mode-toggle.js';
import { Button } from '@/components/ui/button.js';

export type AppView = 'home' | 'landing-page' | 'diagram' | 'pipelines' | 'start-guide';

export function AppNavbar({
  activeView,
  onViewChange
}: {
  readonly activeView: AppView;
  readonly onViewChange: (view: AppView) => void;
}) {
  return (
    <nav className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/80 backdrop-blur-xl dark:border-slate-800 dark:bg-slate-950/80">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between gap-4 px-4 py-3 lg:px-6">
        <div className="flex items-center gap-3">
          <Button
            variant={activeView === 'home' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => {
              onViewChange('home');
            }}
            aria-current={activeView === 'home' ? 'page' : undefined}
            className="rounded-full px-3 font-semibold"
          >
            Admin
          </Button>
          <div className="flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 p-1 dark:border-slate-800 dark:bg-slate-900">
            <Button
              variant={activeView === 'landing-page' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('landing-page');
              }}
              aria-current={activeView === 'landing-page' ? 'page' : undefined}
              className="rounded-full"
            >
              <Compass className="mr-1.5 size-3.5" />
              Organizations
            </Button>
            <Button
              variant={activeView === 'diagram' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('diagram');
              }}
              aria-current={activeView === 'diagram' ? 'page' : undefined}
              className="rounded-full"
            >
              <Network className="mr-1.5 size-3.5" />
              Diagram
            </Button>
            <Button
              variant={activeView === 'pipelines' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('pipelines');
              }}
              aria-current={activeView === 'pipelines' ? 'page' : undefined}
              className="rounded-full"
            >
              <Workflow className="mr-1.5 size-3.5" />
              Pipelines
            </Button>
            <Button
              variant={activeView === 'start-guide' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => {
                onViewChange('start-guide');
              }}
              aria-current={activeView === 'start-guide' ? 'page' : undefined}
              className="rounded-full"
            >
              <Rocket className="mr-1.5 size-3.5" />
              Create Organization
            </Button>
          </div>
        </div>
        <ModeToggle />
      </div>
    </nav>
  );
}
