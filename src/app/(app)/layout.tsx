'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/layout/app-shell';

export default function AppLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  useEffect(() => {
    // Redirect to welcome if no user
    const userId = localStorage.getItem('mindflow_user_id');
    if (!userId) {
      router.replace('/');
    }
  }, [router]);

  return <AppShell>{children}</AppShell>;
}
