import { useState } from 'react';
import {
    Palette,
    Moon,
    Sun,
    Monitor,
    Plus,
    Trash2,
    Check,
    X,
    Type,
    Layout,
    Paintbrush,
    LayoutDashboard
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { useTheme, presetThemes, CustomTheme, ThemeMode } from './ThemeContext';
import { useDashboardTheme, dashboardThemes } from '@/themes/DashboardThemeProvider';

interface ThemeSelectorProps {
    isOpen: boolean;
    onClose: () => void;
}

// Convert HSL to hex for display
function hslToHex(hsl: string): string {
    const [h, s, l] = hsl.split(' ').map(v => parseFloat(v));
    const hue = h / 360;
    const sat = s / 100;
    const light = l / 100;

    let r, g, b;
    if (sat === 0) {
        r = g = b = light;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        const q = light < 0.5 ? light * (1 + sat) : light + sat - light * sat;
        const p = 2 * light - q;
        r = hue2rgb(p, q, hue + 1/3);
        g = hue2rgb(p, q, hue);
        b = hue2rgb(p, q, hue - 1/3);
    }

    const toHex = (c: number) => {
        const hex = Math.round(c * 255).toString(16);
        return hex.length === 1 ? '0' + hex : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convert hex to HSL
function hexToHsl(hex: string): string {
    const r = parseInt(hex.slice(1, 3), 16) / 255;
    const g = parseInt(hex.slice(3, 5), 16) / 255;
    const b = parseInt(hex.slice(5, 7), 16) / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch (max) {
            case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
            case g: h = ((b - r) / d + 2) / 6; break;
            case b: h = ((r - g) / d + 4) / 6; break;
        }
    }

    return `${Math.round(h * 360)} ${Math.round(s * 100)}% ${Math.round(l * 100)}%`;
}

// Generate secondary color from primary
function generateSecondary(primary: string): string {
    const [h, s, l] = primary.split(' ').map(v => parseFloat(v));
    // Slightly shift hue and increase lightness
    return `${(h + 15) % 360} ${s}% ${Math.min(l + 10, 90)}%`;
}

// Generate accent color from primary
function generateAccent(primary: string): string {
    const [h, s, l] = primary.split(' ').map(v => parseFloat(v));
    // Shift hue opposite direction and change lightness
    return `${(h + 180) % 360} ${Math.max(s - 10, 30)}% ${Math.min(l + 20, 80)}%`;
}

export function ThemeSelector({ isOpen, onClose }: ThemeSelectorProps) {
    const {
        currentTheme,
        setThemeById,
        availableThemes,
        addCustomTheme,
        deleteCustomTheme,
        mode,
        setMode
    } = useTheme();

    const {
        currentTheme: dashboardTheme,
        themeName: dashboardThemeName,
        setTheme: setDashboardTheme,
        isDark,
    } = useDashboardTheme();

    const [activeTab, setActiveTab] = useState('dashboard');
    const [isCreating, setIsCreating] = useState(false);

    // New theme form state
    const [newThemeName, setNewThemeName] = useState('');
    const [newThemeMode, setNewThemeMode] = useState<ThemeMode>('light');
    const [newThemePrimary, setNewThemePrimary] = useState('#8b5cf6');

    if (!isOpen) return null;

    const handleCreateTheme = () => {
        if (!newThemeName.trim()) return;

        const primaryHsl = hexToHsl(newThemePrimary);
        const secondaryHsl = generateSecondary(primaryHsl);
        const accentHsl = generateAccent(primaryHsl);

        const newTheme: Omit<CustomTheme, 'id'> = {
            name: newThemeName,
            mode: newThemeMode,
            colors: {
                primary: primaryHsl,
                secondary: secondaryHsl,
                accent: accentHsl,
            },
            fonts: {
                heading: 'Inter, system-ui, sans-serif',
                body: 'Inter, system-ui, sans-serif',
                code: 'JetBrains Mono, monospace',
            },
        };

        addCustomTheme(newTheme);
        setIsCreating(false);
        setNewThemeName('');
        setNewThemePrimary('#8b5cf6');
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-lg shadow-lg w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">
                {/* Header */}
                <div className="p-4 border-b flex items-center justify-between bg-gradient-to-r from-primary/10 to-secondary/10">
                    <div className="flex items-center gap-3">
                        <Palette className="h-6 w-6 text-primary" />
                        <div>
                            <h2 className="text-xl font-bold">Themes & Styling</h2>
                            <p className="text-sm text-muted-foreground">
                                Customize your accent colors
                            </p>
                        </div>
                    </div>
                    <Button variant="ghost" size="icon" onClick={onClose}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>

                <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                    <TabsList className="mx-4 mt-4">
                        <TabsTrigger value="presets" className="flex items-center gap-2">
                            <Layout className="h-4 w-4" />
                            Presets
                        </TabsTrigger>
                        <TabsTrigger value="custom" className="flex items-center gap-2">
                            <Paintbrush className="h-4 w-4" />
                            Custom
                        </TabsTrigger>
                        <TabsTrigger value="appearance" className="flex items-center gap-2">
                            <Type className="h-4 w-4" />
                            Appearance
                        </TabsTrigger>
                    </TabsList>

                    <ScrollArea className="flex-1">
                        <div className="p-4">
                            {/* Preset Themes */}
                            <TabsContent value="presets" className="mt-0">
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                                    {presetThemes.map((theme) => (
                                        <ThemeCard
                                            key={theme.id}
                                            theme={theme}
                                            isActive={currentTheme.id === theme.id}
                                            onClick={() => setThemeById(theme.id)}
                                        />
                                    ))}
                                </div>
                            </TabsContent>

                            {/* Custom Themes */}
                            <TabsContent value="custom" className="mt-0">
                                {!isCreating ? (
                                    <div className="space-y-4">
                                        <Button
                                            onClick={() => setIsCreating(true)}
                                            className="w-full h-24 border-dashed border-2"
                                            variant="outline"
                                        >
                                            <Plus className="h-5 w-5 mr-2" />
                                            Create Custom Theme
                                        </Button>

                                        {availableThemes.filter(t => !presetThemes.find(p => p.id === t.id)).length > 0 && (
                                            <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mt-4">
                                                {availableThemes
                                                    .filter(t => !presetThemes.find(p => p.id === t.id))
                                                    .map((theme) => (
                                                        <ThemeCard
                                                            key={theme.id}
                                                            theme={theme}
                                                            isActive={currentTheme.id === theme.id}
                                                            onClick={() => setThemeById(theme.id)}
                                                            onDelete={() => deleteCustomTheme(theme.id)}
                                                            isCustom
                                                        />
                                                    ))}
                                            </div>
                                        )}
                                    </div>
                                ) : (
                                    <Card>
                                        <CardHeader>
                                            <CardTitle className="text-lg">Create New Theme</CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-4">
                                            <div className="space-y-2">
                                                <Label>Theme Name</Label>
                                                <Input
                                                    value={newThemeName}
                                                    onChange={(e) => setNewThemeName(e.target.value)}
                                                    placeholder="My Custom Theme"
                                                />
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Mode</Label>
                                                <div className="flex gap-2">
                                                    <Button
                                                        type="button"
                                                        variant={newThemeMode === 'light' ? 'default' : 'outline'}
                                                        onClick={() => setNewThemeMode('light')}
                                                        className="flex-1"
                                                    >
                                                        <Sun className="h-4 w-4 mr-2" />
                                                        Light
                                                    </Button>
                                                    <Button
                                                        type="button"
                                                        variant={newThemeMode === 'dark' ? 'default' : 'outline'}
                                                        onClick={() => setNewThemeMode('dark')}
                                                        className="flex-1"
                                                    >
                                                        <Moon className="h-4 w-4 mr-2" />
                                                        Dark
                                                    </Button>
                                                </div>
                                            </div>

                                            <div className="space-y-2">
                                                <Label>Primary Color</Label>
                                                <div className="flex gap-2 flex-wrap">
                                                    {['#8b5cf6', '#3b82f6', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#06b6d4', '#6366f1'].map((color) => (
                                                        <button
                                                            key={color}
                                                            onClick={() => setNewThemePrimary(color)}
                                                            className={cn(
                                                                "w-8 h-8 rounded-full border-2 transition-all",
                                                                newThemePrimary === color ? "border-foreground scale-110" : "border-transparent"
                                                            )}
                                                            style={{ backgroundColor: color }}
                                                        />
                                                    ))}
                                                    <input
                                                        type="color"
                                                        value={newThemePrimary}
                                                        onChange={(e) => setNewThemePrimary(e.target.value)}
                                                        className="w-8 h-8 rounded-full cursor-pointer"
                                                    />
                                                </div>
                                            </div>

                                            <div className="flex gap-2 pt-4">
                                                <Button onClick={handleCreateTheme} className="flex-1">
                                                    <Check className="h-4 w-4 mr-2" />
                                                    Create Theme
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    onClick={() => setIsCreating(false)}
                                                >
                                                    Cancel
                                                </Button>
                                            </div>
                                        </CardContent>
                                    </Card>
                                )}
                            </TabsContent>

                            {/* Appearance Settings */}
                            <TabsContent value="appearance" className="mt-0 space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg flex items-center gap-2">
                                            <Monitor className="h-5 w-5" />
                                            Color Mode
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="grid grid-cols-3 gap-4">
                                            <Button
                                                variant={mode === 'light' ? 'default' : 'outline'}
                                                onClick={() => setMode('light')}
                                                className="h-auto py-4 flex flex-col items-center gap-2"
                                            >
                                                <Sun className="h-6 w-6" />
                                                <span>Light</span>
                                            </Button>
                                            <Button
                                                variant={mode === 'dark' ? 'default' : 'outline'}
                                                onClick={() => setMode('dark')}
                                                className="h-auto py-4 flex flex-col items-center gap-2"
                                            >
                                                <Moon className="h-6 w-6" />
                                                <span>Dark</span>
                                            </Button>
                                            <Button
                                                variant={mode === 'system' ? 'default' : 'outline'}
                                                onClick={() => setMode('system')}
                                                className="h-auto py-4 flex flex-col items-center gap-2"
                                            >
                                                <Monitor className="h-6 w-6" />
                                                <span>System</span>
                                            </Button>
                                        </div>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle className="text-lg">Preview</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="p-6 rounded-lg border space-y-4 bg-muted/30">
                                            <h3 className="text-2xl font-bold text-foreground">
                                                Sample Heading
                                            </h3>
                                            <p className="text-muted-foreground">
                                                This is how your notes will look with the current theme.
                                            </p>
                                            <div className="flex gap-2">
                                                <button
                                                    className="px-4 py-2 rounded bg-primary text-primary-foreground"
                                                >
                                                    Primary Button
                                                </button>
                                                <button
                                                    className="px-4 py-2 rounded bg-secondary text-secondary-foreground"
                                                >
                                                    Secondary
                                                </button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            </TabsContent>
                        </div>
                    </ScrollArea>
                </Tabs>
            </div>
        </div>
    );
}

// Theme Card Component
interface ThemeCardProps {
    theme: CustomTheme;
    isActive: boolean;
    onClick: () => void;
    onDelete?: () => void;
    isCustom?: boolean;
}

function ThemeCard({ theme, isActive, onClick, onDelete, isCustom }: ThemeCardProps) {
    const primaryColor = hslToHex(theme.colors.primary);
    const secondaryColor = hslToHex(theme.colors.secondary);

    return (
        <div
            onClick={onClick}
            className={cn(
                "relative group cursor-pointer rounded-lg border-2 transition-all overflow-hidden",
                isActive ? "border-primary ring-2 ring-primary/20" : "border-transparent hover:border-muted"
            )}
        >
            {/* Theme Preview */}
            <div className="h-24 p-3 bg-muted/30">
                <div
                    className="h-full rounded flex items-center justify-center border bg-card"
                >
                    <div className="flex gap-2">
                        <div
                            className="w-10 h-10 rounded-full shadow-sm"
                            style={{ backgroundColor: primaryColor }}
                        />
                        <div
                            className="w-10 h-10 rounded-full shadow-sm"
                            style={{ backgroundColor: secondaryColor }}
                        />
                    </div>
                </div>
            </div>

            {/* Theme Info */}
            <div className="p-3 bg-card border-t">
                <div className="flex items-center justify-between">
                    <div>
                        <div className="font-medium text-sm">{theme.name}</div>
                        <div className="text-xs text-muted-foreground flex items-center gap-1">
                            {theme.mode === 'dark' ? <Moon className="h-3 w-3" /> : <Sun className="h-3 w-3" />}
                            {theme.mode}
                        </div>
                    </div>
                    {isActive && (
                        <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="h-3 w-3 text-primary-foreground" />
                        </div>
                    )}
                </div>
            </div>

            {/* Delete Button for Custom Themes */}
            {isCustom && onDelete && (
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        onDelete();
                    }}
                    className="absolute top-2 right-2 p-1 rounded-full bg-destructive text-destructive-foreground opacity-0 group-hover:opacity-100 transition-opacity"
                >
                    <Trash2 className="h-3 w-3" />
                </button>
            )}
        </div>
    );
}
