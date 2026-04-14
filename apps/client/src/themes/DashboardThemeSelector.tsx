import { useState } from 'react';
import { Moon, Sun, Check, Palette, Type, LayoutGrid, Maximize, Sparkles, Layers, Box, Droplet, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';
import { useDashboardTheme } from './DashboardThemeProvider';
import { BorderRadius, SpacingDensity, FontFamily, GlassIntensity, CardStyle, ShadowIntensity, presetAccentColors } from './types';

interface DashboardThemeSelectorProps {
  isOpen: boolean;
  onClose: () => void;
}

type TabId = 'themes' | 'appearance' | 'effects' | 'colors';

interface Tab {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const tabs: Tab[] = [
  { id: 'themes', label: 'Themes', icon: <Palette className="h-4 w-4" /> },
  { id: 'appearance', label: 'Appearance', icon: <Type className="h-4 w-4" /> },
  { id: 'effects', label: 'Effects', icon: <Sparkles className="h-4 w-4" /> },
  { id: 'colors', label: 'Colors', icon: <Droplet className="h-4 w-4" /> },
];

// Convert HSL string to CSS color for preview
function hslToCss(hsl: string): string {
  return `hsl(${hsl})`;
}

export function DashboardThemeSelector({ isOpen, onClose }: DashboardThemeSelectorProps) {
  const [activeTab, setActiveTab] = useState<TabId>('themes');
  const {
    currentTheme,
    themeName,
    setTheme,
    isDark,
    availableThemes,
    customization,
    setBorderRadius,
    setSpacingDensity,
    setFontFamily,
    setGlassIntensity,
    setCardStyle,
    setShadowIntensity,
    setCustomColors,
    borderRadiusValue,
    fontFamilyValue,
  } = useDashboardTheme();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl shadow-2xl w-full max-w-5xl max-h-[85vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-5 border-b flex items-center justify-between bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
              <Palette className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="text-lg font-bold">Theme Settings</h2>
              <p className="text-xs text-muted-foreground">
                {currentTheme.name} • {isDark ? 'Dark' : 'Light'} Mode
              </p>
            </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b bg-muted/30">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center gap-2 px-5 py-3 text-sm font-medium transition-all border-b-2",
                activeTab === tab.id
                  ? "border-primary text-primary bg-primary/5"
                  : "border-transparent text-muted-foreground hover:text-foreground hover:bg-muted/50"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-hidden flex">
          {/* Main Content Area */}
          <div className="flex-1 overflow-y-auto p-5">
            {/* Themes Tab */}
            {activeTab === 'themes' && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                    Choose a Theme
                  </h3>
                  <span className="text-xs text-muted-foreground">
                    {availableThemes.length} themes available
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {availableThemes.map((theme) => (
                    <button
                      key={theme.id}
                      onClick={() => setTheme(theme.id)}
                      className={cn(
                        "group relative rounded-xl border-2 transition-all overflow-hidden text-left",
                        themeName === theme.id
                          ? "border-primary ring-2 ring-primary/20"
                          : "border-border hover:border-primary/50"
                      )}
                    >
                      {/* Theme Preview */}
                      <div className="h-20 p-3 bg-gradient-to-br from-muted/50 to-muted">
                        <div className="h-full rounded-lg flex items-center justify-center gap-2 bg-card shadow-sm">
                          <div
                            className="w-6 h-6 rounded-full ring-2 ring-white"
                            style={{ backgroundColor: hslToCss(theme.light.primary) }}
                          />
                          <div
                            className="w-6 h-6 rounded-full ring-2 ring-white"
                            style={{ backgroundColor: hslToCss(theme.light.secondary) }}
                          />
                          <div
                            className="w-6 h-6 rounded-full ring-2 ring-white"
                            style={{ backgroundColor: hslToCss(theme.light.accent) }}
                          />
                        </div>
                      </div>

                      {/* Theme Info */}
                      <div className="p-3 bg-card">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{theme.icon}</span>
                            <div>
                              <p className="font-medium text-sm">{theme.name}</p>
                              <p className="text-[10px] text-muted-foreground">{theme.description}</p>
                            </div>
                          </div>
                          {themeName === theme.id && (
                            <div className="h-5 w-5 rounded-full bg-primary flex items-center justify-center">
                              <Check className="h-3 w-3 text-primary-foreground" />
                            </div>
                          )}
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Appearance Tab */}
            {activeTab === 'appearance' && (
              <div className="space-y-6 max-w-xl">
                {/* Border Radius */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Border Radius</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['sharp', 'rounded', 'pill'] as BorderRadius[]).map((radius) => (
                      <button
                        key={radius}
                        onClick={() => setBorderRadius(radius)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          customization.borderRadius === radius
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div
                          className={cn(
                            "w-10 h-10 mx-auto mb-2 bg-primary",
                            radius === 'sharp' && "rounded",
                            radius === 'rounded' && "rounded-xl",
                            radius === 'pill' && "rounded-full"
                          )}
                        />
                        <span className="text-sm font-medium capitalize">{radius}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Spacing Density */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Maximize className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Spacing</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['compact', 'comfortable', 'spacious'] as SpacingDensity[]).map((density) => (
                      <button
                        key={density}
                        onClick={() => setSpacingDensity(density)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          customization.spacingDensity === density
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div className="flex justify-center gap-1 mb-3">
                          {[1, 2, 3].map((i) => (
                            <div
                              key={i}
                              className={cn(
                                "w-1.5 bg-primary rounded-full",
                                density === 'compact' && "h-4",
                                density === 'comfortable' && "h-6",
                                density === 'spacious' && "h-8"
                              )}
                            />
                          ))}
                        </div>
                        <span className="text-sm font-medium capitalize">{density}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Font Family */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Type className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Font Style</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['modern', 'classic', 'technical'] as FontFamily[]).map((font) => (
                      <button
                        key={font}
                        onClick={() => setFontFamily(font)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          customization.fontFamily === font
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div
                          className="text-3xl mb-2 text-foreground"
                          style={{
                            fontFamily: font === 'modern'
                              ? 'Inter, sans-serif'
                              : font === 'classic'
                                ? 'Georgia, serif'
                                : 'JetBrains Mono, monospace'
                          }}
                        >
                          Aa
                        </div>
                        <span className="text-sm font-medium capitalize">{font}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Effects Tab */}
            {activeTab === 'effects' && (
              <div className="space-y-6 max-w-xl">
                {/* Glass Morphism */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Glass Effect</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['subtle', 'medium', 'heavy'] as GlassIntensity[]).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => setGlassIntensity(intensity)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center relative overflow-hidden",
                          customization.glassIntensity === intensity
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div
                          className="absolute inset-0 opacity-30"
                          style={{
                            background: 'linear-gradient(135deg, hsl(var(--primary)) 0%, transparent 100%)',
                            backdropFilter: `blur(${intensity === 'subtle' ? '2px' : intensity === 'medium' ? '4px' : '8px'})`,
                          }}
                        />
                        <div className="relative z-10">
                          <div
                            className="w-12 h-12 mx-auto mb-2 rounded-xl border-2 border-primary/30"
                            style={{
                              backdropFilter: `blur(${intensity === 'subtle' ? '4px' : intensity === 'medium' ? '8px' : '16px'})`,
                              background: 'rgba(var(--primary), 0.2)',
                            }}
                          />
                          <span className="text-sm font-medium capitalize">{intensity}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Card Style */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Layers className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Card Style</label>
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    {(['elevated', 'flat', 'outlined'] as CardStyle[]).map((style) => (
                      <button
                        key={style}
                        onClick={() => setCardStyle(style)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          customization.cardStyle === style
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div
                          className="w-14 h-10 mx-auto mb-3 rounded-lg bg-card border border-border"
                          style={{
                            boxShadow: style === 'elevated'
                              ? '0 4px 12px rgba(0,0,0,0.1)'
                              : style === 'outlined'
                                ? 'inset 0 0 0 2px hsl(var(--border))'
                                : 'none'
                          }}
                        />
                        <span className="text-sm font-medium capitalize">{style}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Shadow Intensity */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Box className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Shadow Intensity</label>
                  </div>
                  <div className="grid grid-cols-4 gap-3">
                    {(['none', 'light', 'medium', 'heavy'] as ShadowIntensity[]).map((intensity) => (
                      <button
                        key={intensity}
                        onClick={() => setShadowIntensity(intensity)}
                        className={cn(
                          "p-4 rounded-xl border-2 transition-all text-center",
                          customization.shadowIntensity === intensity
                            ? "border-primary bg-primary/10"
                            : "border-border hover:border-primary/30"
                        )}
                      >
                        <div
                          className="w-10 h-10 mx-auto mb-2 rounded-lg bg-primary"
                          style={{
                            boxShadow: intensity === 'none'
                              ? 'none'
                              : intensity === 'light'
                                ? '0 2px 4px rgba(0,0,0,0.1)'
                                : intensity === 'medium'
                                  ? '0 4px 12px rgba(0,0,0,0.15)'
                                  : '0 8px 24px rgba(0,0,0,0.2)'
                          }}
                        />
                        <span className="text-sm font-medium capitalize">{intensity}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Colors Tab */}
            {activeTab === 'colors' && (
              <div className="space-y-6 max-w-xl">
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Droplet className="h-4 w-4 text-primary" />
                    <label className="text-sm font-medium">Accent Color</label>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Select a color to override the theme's primary accent
                  </p>
                  <div className="grid grid-cols-5 gap-3">
                    {presetAccentColors.map((color) => (
                      <button
                        key={color.name}
                        onClick={() => setCustomColors(color.hsl, color.hsl)}
                        className={cn(
                          "group p-3 rounded-xl border-2 transition-all text-center",
                          customization.customPrimaryColor === color.hsl
                            ? "border-primary ring-2 ring-primary/20"
                            : "border-border hover:border-primary/30"
                        )}
                        title={color.name}
                      >
                        <div
                          className="w-10 h-10 mx-auto rounded-full shadow-md group-hover:scale-110 transition-transform"
                          style={{ backgroundColor: hslToCss(color.hsl) }}
                        />
                        <span className="text-[11px] text-muted-foreground mt-2 block">{color.name}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Reset Colors */}
                {customization.customPrimaryColor && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCustomColors(undefined, undefined)}
                    className="w-full"
                  >
                    Reset to Theme Default
                  </Button>
                )}
              </div>
            )}
          </div>

          {/* Preview Panel - Right Side */}
          <div className="w-72 border-l bg-muted/20 p-5 flex flex-col">
            <h4 className="text-sm font-semibold mb-4 flex items-center gap-2">
              <Sun className="h-4 w-4" />
              Live Preview
            </h4>

            <div
              className="flex-1 rounded-xl border bg-card p-4 space-y-4"
              style={{
                fontFamily: fontFamilyValue,
                boxShadow: customization.cardStyle === 'elevated' ? '0 4px 12px rgba(0,0,0,0.1)' : 'none'
              }}
            >
              {/* Sample Card Content */}
              <div
                className="p-3 rounded-lg bg-primary/10 border border-primary/20"
                style={{ borderRadius: borderRadiusValue }}
              >
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-xs font-bold">
                    A
                  </div>
                  <div>
                    <p className="text-sm font-semibold">Sample Card</p>
                    <p className="text-[10px] text-muted-foreground">Preview your theme</p>
                  </div>
                </div>
              </div>

              {/* Sample Buttons */}
              <div className="space-y-2">
                <button
                  className="w-full py-2 text-sm font-medium bg-primary text-primary-foreground"
                  style={{ borderRadius: borderRadiusValue }}
                >
                  Primary Button
                </button>
                <button
                  className="w-full py-2 text-sm font-medium bg-secondary text-secondary-foreground"
                  style={{ borderRadius: borderRadiusValue }}
                >
                  Secondary
                </button>
              </div>

              {/* Sample Text */}
              <div className="space-y-2">
                <h5 className="font-semibold text-sm">Heading Text</h5>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  This is how your dashboard will look with the current settings.
                </p>
              </div>

              {/* Sample Progress */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px]">
                  <span>Progress</span>
                  <span className="text-primary">75%</span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                  <div className="h-full w-3/4 bg-primary rounded-full" />
                </div>
              </div>
            </div>

            {/* Current Settings Summary */}
            <div className="mt-4 pt-4 border-t">
              <h5 className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
                Current Settings
              </h5>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Theme</span>
                  <span className="font-medium">{currentTheme.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Radius</span>
                  <span className="font-medium capitalize">{customization.borderRadius}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Font</span>
                  <span className="font-medium capitalize">{customization.fontFamily}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Glass</span>
                  <span className="font-medium capitalize">{customization.glassIntensity}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
