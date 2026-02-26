import React, { createContext, useContext, useState, useCallback } from 'react';

const HeaderContext = createContext();

export const HeaderProvider = ({ children }) => {
    const [headerState, setHeaderState] = useState({
        title: '',
        shortTitle: '',
        subtitle: '',
        showSearch: true,
        searchValue: '',
        onSearchChange: null,
        searchPlaceholder: '',
    });

    const setHeader = useCallback((config) => {
        setHeaderState((prev) => ({
            ...prev,
            ...config,
        }));
    }, []);

    // Simple shortcut for setting basic title info
    const setPageInfo = useCallback((title, subtitle = '', shortTitle = '') => {
        setHeaderState((prev) => ({
            ...prev,
            title,
            subtitle,
            shortTitle,
        }));
    }, []);

    return (
        <HeaderContext.Provider value={{ ...headerState, setHeader, setPageInfo }}>
            {children}
        </HeaderContext.Provider>
    );
};

export const useHeader = () => {
    const context = useContext(HeaderContext);
    if (!context) {
        throw new Error('useHeader must be used within a HeaderProvider');
    }
    return context;
};
