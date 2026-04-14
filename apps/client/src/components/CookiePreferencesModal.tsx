import React, { useState } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useCookie } from '@/contexts/CookieContext';

interface CookiePreferencesModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

export const CookiePreferencesModal: React.FC<CookiePreferencesModalProps> = ({
    open,
    onOpenChange,
}) => {
    const { consent, savePreferences } = useCookie();

    const [analytics, setAnalytics] = useState(consent?.analytics ?? false);
    const [marketing, setMarketing] = useState(consent?.marketing ?? false);

    const handleSave = () => {
        savePreferences({
            necessary: true,
            analytics,
            marketing,
        });
        onOpenChange(false);
    };

    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Cookie Preferences</DialogTitle>
                    <DialogDescription>
                        Manage your cookie preferences. Necessary cookies are always enabled.
                    </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                    <div className="flex items-center justify-between space-x-2">
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="necessary-cookies" className="font-semibold">
                                Strictly Necessary
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                These cookies are essential for the website to function properly.
                            </p>
                        </div>
                        <Switch id="necessary-cookies" checked disabled />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="analytics-cookies" className="font-semibold">
                                Analytics
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Help us understand how you use our website.
                            </p>
                        </div>
                        <Switch
                            id="analytics-cookies"
                            checked={analytics}
                            onCheckedChange={setAnalytics}
                        />
                    </div>

                    <div className="flex items-center justify-between space-x-2">
                        <div className="grid gap-1.5 leading-none">
                            <Label htmlFor="marketing-cookies" className="font-semibold">
                                Marketing
                            </Label>
                            <p className="text-sm text-muted-foreground">
                                Used to deliver relevant advertisements.
                            </p>
                        </div>
                        <Switch
                            id="marketing-cookies"
                            checked={marketing}
                            onCheckedChange={setMarketing}
                        />
                    </div>
                </div>

                <DialogFooter>
                    <Button variant="outline" onClick={() => onOpenChange(false)}>
                        Cancel
                    </Button>
                    <Button onClick={handleSave}>Save Preferences</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};
