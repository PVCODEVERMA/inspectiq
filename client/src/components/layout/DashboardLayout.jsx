import React from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { MobileNav } from './MobileNav';
import { useSidebar } from '@/contexts/SidebarContext';
import { cn } from '@/lib/utils';

export const DashboardLayout = () => {
  const { isCollapsed } = useSidebar();

  return (
    <div className="h-screen overflow-hidden bg-background">
      <Sidebar />
      <main
        className={cn(
          'transition-all duration-300 h-screen overflow-y-auto pb-16 lg:pb-0',
          isCollapsed ? 'lg:ml-20' : 'lg:ml-72',
          'ml-0' // No margin on mobile
        )}
      >
        <Outlet />
      </main>
      <MobileNav />
    </div>
  );
};
