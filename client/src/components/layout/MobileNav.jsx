import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Search, Plus, Heart, User } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useSidebar } from '@/contexts/SidebarContext';

export const MobileNav = () => {
    const { toggleSearch, isSearchOpen } = useSidebar();

    return (
        <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-[60] pb-safe transition-all duration-500 animate-in slide-in-from-bottom-full">
            {/* SVG Background for Notch Effect */}
            <div className="absolute bottom-0 left-0 w-full h-16 bg-primary shadow-[0_-10px_40px_rgba(255,61,61,0.2)] pointer-events-none">
                <svg
                    width="100%"
                    height="100%"
                    viewBox="0 0 100 100"
                    preserveAspectRatio="none"
                    className="absolute bottom-[calc(100%-1px)] left-0 w-full h-10 fill-primary drop-shadow-[0_-5px_15px_rgba(255,61,61,0.1)]"
                >
                    <path d="M0 100 H33 C38 100 38 45 50 45 C62 45 62 100 67 100 H100 V100 H0 Z" />
                </svg>
            </div>

            <div className="relative flex items-center justify-between h-16 px-6">
                {/* Home */}
                <NavLink
                    to="/dashboard"
                    className="relative flex items-center justify-center w-12 h-12"
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(
                                "absolute inset-0 bg-[#1A1818] rounded-2xl transition-all duration-300 scale-0 opacity-0",
                                isActive && "scale-100 opacity-100 animate-in zoom-in duration-300 shadow-lg"
                            )} />
                            <Home className={cn(
                                "relative z-10 w-6 h-6 stroke-[2.5px] transition-all duration-300",
                                isActive ? "text-white scale-110" : "text-white/60"
                            )} />
                        </>
                    )}
                </NavLink>

                {/* Search Toggle */}
                <button
                    onClick={toggleSearch}
                    className="relative flex items-center justify-center w-12 h-12 mr-8"
                >
                    <div className={cn(
                        "absolute inset-0 bg-[#1A1818] rounded-2xl transition-all duration-300 scale-0 opacity-0",
                        isSearchOpen && "scale-100 opacity-100 animate-in zoom-in duration-300 shadow-lg"
                    )} />
                    <Search className={cn(
                        "relative z-10 w-6 h-6 stroke-[2.5px] transition-all duration-300",
                        isSearchOpen ? "text-white scale-110" : "text-white/60"
                    )} />
                </button>

                {/* Center FAB (Services) */}
                <div className="absolute left-1/2 -top-10 -translate-x-1/2 group">
                    <NavLink
                        to="/admin/services"
                        className={({ isActive }) => cn(
                            "flex items-center justify-center w-16 h-16 rounded-full transition-all duration-500 shadow-xl",
                            "bg-white text-primary ring-[6px] ring-primary hover:scale-110 active:scale-95 group-hover:shadow-primary/20",
                            isActive ? "scale-105" : ""
                        )}
                    >
                        <Plus className="w-8 h-8 stroke-[3.5px] transition-transform duration-300 group-hover:rotate-90" />
                    </NavLink>
                </div>

                {/* Activity/Heart */}
                <NavLink
                    to="/analytics"
                    className="relative flex items-center justify-center w-12 h-12 ml-8"
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(
                                "absolute inset-0 bg-[#1A1818] rounded-2xl transition-all duration-300 scale-0 opacity-0",
                                isActive && "scale-100 opacity-100 animate-in zoom-in duration-300 shadow-lg"
                            )} />
                            <Heart className={cn(
                                "relative z-10 w-6 h-6 stroke-[2.5px] transition-all duration-300",
                                isActive ? "text-white scale-110" : "text-white/60"
                            )} />
                        </>
                    )}
                </NavLink>

                {/* Profile */}
                <NavLink
                    to="/profile"
                    className="relative flex items-center justify-center w-12 h-12"
                >
                    {({ isActive }) => (
                        <>
                            <div className={cn(
                                "absolute inset-0 bg-[#1A1818] rounded-2xl transition-all duration-300 scale-0 opacity-0",
                                isActive && "scale-100 opacity-100 animate-in zoom-in duration-300 shadow-lg"
                            )} />
                            <User className={cn(
                                "relative z-10 w-6 h-6 stroke-[2.5px] transition-all duration-300",
                                isActive ? "text-white scale-110" : "text-white/60"
                            )} />
                        </>
                    )}
                </NavLink>
            </div>
        </nav>
    );
};
