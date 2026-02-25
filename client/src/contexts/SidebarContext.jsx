import React, { createContext, useContext, useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SidebarContext = createContext();

export const SidebarProvider = ({ children }) => {
    const [isCollapsed, setIsCollapsed] = useState(false);
    const [isMobileOpen, setIsMobileOpen] = useState(false);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');

    // Favorites and Activity History
    const [favorites, setFavorites] = useState(() => {
        const saved = localStorage.getItem('inspectiq_favorites');
        return saved ? JSON.parse(saved) : [];
    });

    const [history, setHistory] = useState(() => {
        const saved = localStorage.getItem('inspectiq_history');
        return saved ? JSON.parse(saved) : [];
    });

    const location = useLocation();

    // Close mobile components and clear search when route changes
    useEffect(() => {
        setIsMobileOpen(false);
        setIsSearchOpen(false);
        setSearchQuery(''); // Clear search on any route change/back navigation
    }, [location.pathname]);

    // Persist Favorites
    useEffect(() => {
        localStorage.setItem('inspectiq_favorites', JSON.stringify(favorites));
    }, [favorites]);

    // Persist History
    useEffect(() => {
        localStorage.setItem('inspectiq_history', JSON.stringify(history));
    }, [history]);

    const toggleSidebar = () => {
        setIsCollapsed(prev => !prev);
    };

    const toggleMobileSidebar = () => {
        setIsMobileOpen(prev => !prev);
    };

    const toggleSearch = () => {
        setIsSearchOpen(prev => !prev);
    };

    const toggleFavorite = (item) => {
        setFavorites(prev => {
            const exists = prev.find(f => f.id === item.id);
            if (exists) {
                return prev.filter(f => f.id !== item.id);
            }
            return [...prev, { ...item, timestamp: new Date().toISOString() }];
        });
    };

    const addToHistory = (item) => {
        setHistory(prev => {
            const filtered = prev.filter(h => h.id !== item.id);
            const newItem = { ...item, timestamp: new Date().toISOString() };
            return [newItem, ...filtered].slice(0, 20); // Keep last 20
        });
    };

    const closeMobileSidebar = () => {
        setIsMobileOpen(false);
    };

    return (
        <SidebarContext.Provider
            value={{
                isCollapsed,
                setIsCollapsed,
                isMobileOpen,
                setIsMobileOpen,
                isSearchOpen,
                setIsSearchOpen,
                searchQuery,
                setSearchQuery,
                favorites,
                setFavorites,
                history,
                toggleFavorite,
                addToHistory,
                toggleSidebar,
                toggleMobileSidebar,
                toggleSearch,
                closeMobileSidebar
            }}
        >
            {children}
        </SidebarContext.Provider>
    );
};

export const useSidebar = () => {
    const context = useContext(SidebarContext);
    if (!context) {
        throw new Error('useSidebar must be used within a SidebarProvider');
    }
    return context;
};
