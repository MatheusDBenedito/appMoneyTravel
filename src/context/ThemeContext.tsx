import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        const savedTheme = localStorage.getItem('moneytravel_theme');
        if (savedTheme === 'light' || savedTheme === 'dark') {
            return savedTheme;
        }
        return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;
        console.log('ThemeContext useEffect. Applying theme:', theme);

        // Remove both to ensure clean state
        root.classList.remove('light', 'dark');

        // Add current theme
        root.classList.add(theme);

        // Save to local storage
        localStorage.setItem('moneytravel_theme', theme);

        // Update color-scheme style for scrollbars etc
        root.style.colorScheme = theme;

    }, [theme]);

    const toggleTheme = () => {
        console.log('Toggling theme. Current:', theme);
        setTheme(prev => {
            const newTheme = prev === 'light' ? 'dark' : 'light';
            console.log('New theme:', newTheme);
            return newTheme;
        });
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
}

export function useTheme() {
    const context = useContext(ThemeContext);
    if (context === undefined) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
}
