import React from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Settings, CheckSquare, Grid, LayoutTemplate, Square } from 'lucide-react';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';

export type ItemStyle = 'modern' | 'classic';

interface CalendarSettingsProps {
    itemStyle: ItemStyle;
    setItemStyle: (style: ItemStyle) => void;
    showCheckboxes: boolean;
    setShowCheckboxes: (show: boolean) => void;
    showHeatmap: boolean;
    setShowHeatmap: (show: boolean) => void;
}

const CalendarSettings: React.FC<CalendarSettingsProps> = ({
    itemStyle,
    setItemStyle,
    showCheckboxes,
    setShowCheckboxes,
    showHeatmap,
    setShowHeatmap,
}) => {
    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="h-8 gap-2">
                    <Settings className="h-4 w-4" />
                    <span className="hidden sm:inline">View Options</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-4" align="end">
                <div className="space-y-4">
                    <div className="space-y-2">
                        <h4 className="font-medium flex items-center gap-2">
                            <LayoutTemplate className="h-4 w-4" />
                            Item Style
                        </h4>
                        <RadioGroup
                            value={itemStyle}
                            onValueChange={(v) => setItemStyle(v as ItemStyle)}
                            className="grid grid-cols-2 gap-2"
                        >
                            <div>
                                <RadioGroupItem value="modern" id="style-modern" className="peer sr-only" />
                                <Label
                                    htmlFor="style-modern"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <div className="w-full space-y-1 mb-2">
                                        <div className="h-2 w-full rounded-sm bg-blue-500/20" />
                                        <div className="h-2 w-3/4 rounded-sm bg-green-500/20" />
                                    </div>
                                    <span className="text-xs font-medium">Modern</span>
                                </Label>
                            </div>
                            <div>
                                <RadioGroupItem value="classic" id="style-classic" className="peer sr-only" />
                                <Label
                                    htmlFor="style-classic"
                                    className="flex flex-col items-center justify-between rounded-md border-2 border-muted bg-popover p-2 hover:bg-accent hover:text-accent-foreground peer-data-[state=checked]:border-primary [&:has([data-state=checked])]:border-primary cursor-pointer"
                                >
                                    <div className="w-full space-y-1 mb-2">
                                        <div className="h-2 w-full rounded-sm bg-muted" />
                                        <div className="h-2 w-3/4 rounded-sm bg-muted" />
                                    </div>
                                    <span className="text-xs font-medium">Classic</span>
                                </Label>
                            </div>
                        </RadioGroup>
                    </div>

                    <Separator />

                    <div className="space-y-4">
                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="show-checkboxes" className="flex items-center gap-2 cursor-pointer">
                                <CheckSquare className="h-4 w-4" />
                                Task Checkbox
                            </Label>
                            <Switch
                                id="show-checkboxes"
                                checked={showCheckboxes}
                                onCheckedChange={setShowCheckboxes}
                            />
                        </div>

                        <div className="flex items-center justify-between space-x-2">
                            <Label htmlFor="show-heatmap" className="flex items-center gap-2 cursor-pointer">
                                <Grid className="h-4 w-4" />
                                Show Heatmap
                            </Label>
                            <Switch
                                id="show-heatmap"
                                checked={showHeatmap}
                                onCheckedChange={setShowHeatmap}
                            />
                        </div>
                    </div>
                </div>
            </PopoverContent>
        </Popover>
    );
};

export default CalendarSettings;
