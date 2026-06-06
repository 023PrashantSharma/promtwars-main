'use client';

import { Sidebar } from './sidebar';
import { MobileNav } from './mobile-nav';

interface AppShellProps {
  children: React.ReactNode;
}

export function AppShell({ children }: AppShellProps) {
  return (
    <div className="min-h-screen" style={{ background: 'var(--bg)' }}>
      {/* Desktop Sidebar */}
      <div className="hidden lg:block">
        <Sidebar />
      </div>

      {/* Mobile Nav */}
      <MobileNav />

      {/* Main Content */}
      <main
        className="min-h-screen"
        style={{ padding: '36px 44px 48px' }}
      >
        {/* Desktop: offset by sidebar */}
        <style>{`
          @media (min-width: 1024px) {
            main { margin-left: var(--sidebar-w) !important; }
          }
          @media (max-width: 1023px) {
            main { margin-left: 0 !important; padding: 76px 20px 32px !important; }
          }
        `}</style>
        <div className="max-w-[1200px]">
          {children}
        </div>
      </main>
    </div>
  );
}
