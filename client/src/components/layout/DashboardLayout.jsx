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
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar />
      <div
        className={cn(
          'transition-all duration-300 h-screen overflow-y-auto pb-16 lg:pb-0 flex flex-col',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-72',
          'ml-0' // No margin on mobile
        )}
      >
        <Header />
        <main className="flex-1 min-h-0 pb-28 lg:pb-0">
          <Suspense fallback={<PageSkeleton />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <MobileNav />
    </div>
  );
};
