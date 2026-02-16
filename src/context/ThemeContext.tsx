import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'light' | 'dark';

interface ThemeContextType {
    theme: Theme;
    toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
    const [theme, setTheme] = useState<Theme>(() => {
        // Safe check for localStorage availability
        if (typeof window !== 'undefined' && window.localStorage) {
            const savedTheme = localStorage.getItem('moneytravel_theme');
            if (savedTheme === 'light' || savedTheme === 'dark') {
                return savedTheme;
            }
        }
        // Default to dark if system prefers or fallback
        if (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        return 'light';
    });

    useEffect(() => {
        const root = window.document.documentElement;

        // Standard Tailwind Approach:
        // If dark, add 'dark'. If light, remove 'dark'.
        if (theme === 'dark') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Save to local storage
        localStorage.setItem('moneytravel_theme', theme);

        // Update color-scheme style for scrollbars etc
        root.style.colorScheme = theme;

    }, [theme]);

    const toggleTheme = () => {
        setTheme(prev => prev === 'light' ? 'dark' : 'light');
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
