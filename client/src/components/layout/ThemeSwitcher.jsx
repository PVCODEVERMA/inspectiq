import React from 'react';
import { useTheme, THEMES } from '@/contexts/ThemeContext';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
    DropdownMenuSeparator,
    DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Palette, Moon, Sun, Zap, Layout, Building2, Wrench, Check } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ThemeSwitcher = () => {
    const { theme, setTheme } = useTheme();

    const themes = [
        { id: THEMES.QC_CLASSIC, label: 'QC Classic', icon: Palette, color: 'text-red-500' },
        { id: THEMES.DARK_PRO, label: 'Dark Pro', icon: Moon, color: 'text-gray-400' },
        { id: THEMES.RED_POWER, label: 'Red Power', icon: Zap, color: 'text-red-700' },
        { id: THEMES.MINIMAL_WHITE, label: 'Minimal White', icon: Sun, color: 'text-red-400' },
        { id: THEMES.GRAPHITE, label: 'Graphite', icon: Building2, color: 'text-zinc-500' },
        { id: THEMES.STEEL_INDUSTRIAL, label: 'Steel Industrial', icon: Wrench, color: 'text-blue-500' },
    ];

    const currentTheme = themes.find(t => t.id === theme) || themes[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative h-10 w-10 rounded-xl hover:bg-muted transition-colors">
                    <Palette className="h-5 w-5" />
                    <span className="sr-only">Toggle theme</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px] rounded-2xl p-2 animate-in fade-in zoom-in-95 duration-200">
                <DropdownMenuLabel className="px-2 py-1.5 text-xs font-black uppercase tracking-widest text-muted-foreground">
                    Appearance
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="my-1" />
                {themes.map((t) => (
                    <DropdownMenuItem
                        key={t.id}
                        onClick={() => setTheme(t.id)}
                        className={cn(
                            "flex items-center justify-between px-2 py-2.5 rounded-xl cursor-pointer transition-all duration-200",
                            theme === t.id ? "bg-primary/10 text-primary" : "hover:bg-muted"
                        )}
                    >
                        <div className="flex items-center gap-3">
                            <div className={cn("p-1.5 rounded-lg bg-background border shadow-sm", t.color)}>
                                <t.icon className="h-4 w-4" />
                            </div>
                            <span className="text-sm font-bold">{t.label}</span>
                        </div>
                        {theme === t.id && <Check className="h-4 w-4" />}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
};
