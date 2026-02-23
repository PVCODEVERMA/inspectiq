import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const THEMES = {
    QC_CLASSIC: 'theme-qc-classic',
    DARK_PRO: 'theme-dark-pro',
    RED_POWER: 'theme-red-power',
    MINIMAL_WHITE: 'theme-minimal-white',
    GRAPHITE: 'theme-graphite',
    STEEL_INDUSTRIAL: 'theme-steel-industrial',
};

export const ThemeProvider = ({ children }) => {
    const [theme, setTheme] = useState(() => {
        return localStorage.getItem('inspectiq-theme') || THEMES.QC_CLASSIC;
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove all theme classes
        Object.values(THEMES).forEach((t) => {
            root.classList.remove(t);
        });

        // Add current theme class
        root.classList.add(theme);

        // Persist theme
        localStorage.setItem('inspectiq-theme', theme);
    }, [theme]);

    // Handle dark mode compatibility (if any component uses .dark specifically)
    useEffect(() => {
        const root = window.document.documentElement;
        if (theme === THEMES.DARK_PRO || theme === THEMES.GRAPHITE) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [theme]);

    return (
        <ThemeContext.Provider value={{ theme, setTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};
