'use client';

import { Sidebar } from './sidebar';
import { Header } from './header';
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

      {/* Desktop Header */}
      <div className="hidden lg:block">
        <Header />
      </div>

      {/* Mobile Nav */}
      <MobileNav />

      {/* Main Content */}
      <main className="min-h-screen">
        <style>{`
          @media (min-width: 1024px) {
            main { margin-left: var(--sidebar-w) !important; padding-top: 48px !important; }
          }
          @media (max-width: 1023px) {
            main { margin-left: 0 !important; padding-top: 56px !important; }
          }
        `}</style>
        <div>
          {children}
        </div>
      </main>
    </div>
  );
}
