import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface CustomTheme {
    id: string;
    name: string;
    mode: ThemeMode;
    colors: {
        primary: string;
        secondary: string;
        accent: string;
    };
    fonts: {
        heading: string;
        body: string;
        code: string;
    };
}

// Simple accent color themes - only changes 3 colors (primary, secondary, accent)
// Background, text, surface colors are handled by Tailwind dark: classes
export const presetThemes: CustomTheme[] = [
    {
        id: 'default',
        name: 'Default (Purple)',
        mode: 'system',
        colors: {
            primary: '251 87% 62%',     // Purple
            secondary: '43 90% 62%',    // Gold
            accent: '197 100% 77%',     // Light Blue
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'JetBrains Mono, Fira Code, monospace',
        },
    },
    {
        id: 'forest',
        name: 'Forest',
        mode: 'light',
        colors: {
            primary: '160 84% 39%',     // Green
            secondary: '160 84% 47%',   // Light Green
            accent: '160 84% 58%',      // Mint
        },
        fonts: {
            heading: 'Merriweather, Georgia, serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'Fira Code, monospace',
        },
    },
    {
        id: 'sunset',
        name: 'Sunset',
        mode: 'light',
        colors: {
            primary: '24 95% 53%',      // Orange
            secondary: '25 95% 63%',    // Light Orange
            accent: '27 96% 72%',       // Peach
        },
        fonts: {
            heading: 'Poppins, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'Fira Code, monospace',
        },
    },
    {
        id: 'ocean',
        name: 'Ocean',
        mode: 'dark',
        colors: {
            primary: '199 89% 48%',     // Cyan
            secondary: '198 93% 60%',   // Light Cyan
            accent: '187 92% 53%',      // Turquoise
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'JetBrains Mono, monospace',
        },
    },
    {
        id: 'berry',
        name: 'Berry',
        mode: 'dark',
        colors: {
            primary: '340 82% 59%',     // Pink
            secondary: '330 81% 60%',   // Rose
            accent: '280 65% 60%',      // Purple
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'JetBrains Mono, monospace',
        },
    },
    {
        id: 'monochrome',
        name: 'Monochrome',
        mode: 'system',
        colors: {
            primary: '0 0% 20%',        // Dark Gray
            secondary: '0 0% 45%',      // Gray
            accent: '0 0% 70%',         // Light Gray
        },
        fonts: {
            heading: 'Inter, system-ui, sans-serif',
            body: 'Inter, system-ui, sans-serif',
            code: 'JetBrains Mono, monospace',
        },
    },
];

interface ThemeContextType {
    currentTheme: CustomTheme;
    setTheme: (theme: CustomTheme) => void;
    setThemeById: (themeId: string) => void;
    availableThemes: CustomTheme[];
    addCustomTheme: (theme: Omit<CustomTheme, 'id'>) => void;
    deleteCustomTheme: (themeId: string) => void;
    updateTheme: (themeId: string, updates: Partial<CustomTheme>) => void;
    mode: ThemeMode;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const STORAGE_KEY = 'accent-custom-themes';
const CURRENT_THEME_KEY = 'accent-current-theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
    const [customThemes, setCustomThemes] = useState<CustomTheme[]>([]);
    const [currentThemeId, setCurrentThemeId] = useState<string>('default');
    const [mode, setMode] = useState<ThemeMode>('system');

    // Load custom themes from localStorage
    useEffect(() => {
        const savedThemes = localStorage.getItem(STORAGE_KEY);
        if (savedThemes) {
            try {
                setCustomThemes(JSON.parse(savedThemes));
            } catch {
                console.error('Failed to parse custom themes');
            }
        }

        const savedThemeId = localStorage.getItem(CURRENT_THEME_KEY);
        if (savedThemeId) {
            setCurrentThemeId(savedThemeId);
        }
    }, []);

    // Save custom themes to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(customThemes));
    }, [customThemes]);

    // Save current theme to localStorage
    useEffect(() => {
        localStorage.setItem(CURRENT_THEME_KEY, currentThemeId);
    }, [currentThemeId]);

    const availableThemes = [...presetThemes, ...customThemes];

    const currentTheme = availableThemes.find(t => t.id === currentThemeId) || presetThemes[0];

    // NOTE: CSS variables are now managed by DashboardThemeProvider
    // This context only stores the theme selection for notes-specific features
    // The DashboardThemeProvider applies all CSS variables globally
    useEffect(() => {
        // Font variables can still be applied here for notes-specific customization
        const theme = currentTheme;
        const root = document.documentElement;

        // Apply font variables only (colors come from DashboardThemeProvider)
        root.style.setProperty('--theme-font-heading', theme.fonts.heading);
        root.style.setProperty('--theme-font-body', theme.fonts.body);
        root.style.setProperty('--theme-font-code', theme.fonts.code);

    }, [currentTheme.id]);

    const setTheme = (theme: CustomTheme) => {
        setCurrentThemeId(theme.id);
    };

    const setThemeById = (themeId: string) => {
        setCurrentThemeId(themeId);
    };

    const addCustomTheme = (theme: Omit<CustomTheme, 'id'>) => {
        const newTheme: CustomTheme = {
            ...theme,
            id: `custom-${Date.now()}`,
        };
        setCustomThemes([...customThemes, newTheme]);
        setCurrentThemeId(newTheme.id);
    };

    const deleteCustomTheme = (themeId: string) => {
        setCustomThemes(customThemes.filter(t => t.id !== themeId));
        if (currentThemeId === themeId) {
            setCurrentThemeId('default');
        }
    };

    const updateTheme = (themeId: string, updates: Partial<CustomTheme>) => {
        setCustomThemes(customThemes.map(t =>
            t.id === themeId ? { ...t, ...updates } : t
        ));
    };

    return (
        <ThemeContext.Provider
            value={{
                currentTheme,
                setTheme,
                setThemeById,
                availableThemes,
                addCustomTheme,
                deleteCustomTheme,
                updateTheme,
                mode,
                setMode,
            }}
        >
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
