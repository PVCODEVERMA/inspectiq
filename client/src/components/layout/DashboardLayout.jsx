import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';
import { Header } from './Header';
import { PageSkeleton } from './PageSkeleton';
import { Suspense } from 'react';

export const DashboardLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="h-[100dvh] overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 h-[100dvh] flex flex-col',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-72',
          'ml-0' // No margin on mobile
        )}
      >
        <Header />
        <main className="flex-1 min-h-0 overflow-y-auto w-full relative">
          <div className="flex flex-col min-h-full">
            <Suspense fallback={<PageSkeleton />}>
              <Outlet />
            </Suspense>
            {/* Foolproof invisible spacer block that guarantees space at the very bottom of the scrolled page content */}
            <div className="h-32 shrink-0 w-full" aria-hidden="true" />
          </div>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
