import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { ImagePlus, Link, Upload, X, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import axiosInstance from '@/api/axiosInstance';

interface ImageBlockProps {
    url?: string;
    caption?: string;
    onChange: (url: string, caption?: string) => void;
    onRemove: () => void;
}

export function ImageBlock({ url, caption, onChange, onRemove }: ImageBlockProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [imageUrl, setImageUrl] = useState(url || '');
    const [imageCaption, setImageCaption] = useState(caption || '');
    const [activeTab, setActiveTab] = useState<'upload' | 'url'>('upload');
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            toast.error('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            toast.error('Image size must be less than 5MB');
            return;
        }

        try {
            setIsUploading(true);
            const formData = new FormData();
            formData.append('image', file);

            const response = await axiosInstance.post('/upload/image', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            if (response.data.success) {
                setImageUrl(response.data.url);
                toast.success('Image uploaded successfully');
            }
        } catch (error) {
            console.error('Upload failed:', error);
            toast.error('Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    };

    const handleSave = () => {
        if (!imageUrl.trim()) {
            toast.error('Please provide an image URL or upload an image');
            return;
        }
        onChange(imageUrl, imageCaption.trim() || undefined);
        setIsDialogOpen(false);
    };

    const handleRemove = () => {
        onRemove();
        setImageUrl('');
        setImageCaption('');
    };

    if (url) {
        return (
            <div className="relative group">
                <div className="rounded-lg overflow-hidden border bg-muted/30">
                    <img
                        src={url}
                        alt={caption || 'Note image'}
                        className="w-full h-auto max-h-[400px] object-contain"
                        onError={(e) => {
                            (e.target as HTMLImageElement).src = '';
                            toast.error('Failed to load image');
                        }}
                    />
                    {caption && (
                        <div className="p-2 text-center text-sm text-muted-foreground border-t bg-background">
                            {caption}
                        </div>
                    )}
                </div>
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                    <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                            setImageUrl(url);
                            setImageCaption(caption || '');
                            setIsDialogOpen(true);
                        }}
                    >
                        Edit
                    </Button>
                    <Button
                        variant="destructive"
                        size="sm"
                        onClick={handleRemove}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <>
            <button
                onClick={() => setIsDialogOpen(true)}
                className="w-full py-8 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
            >
                <ImagePlus className="h-8 w-8" />
                <span>Click to add an image</span>
            </button>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle>Insert Image</DialogTitle>
                    </DialogHeader>
                    
                    <div className="flex gap-2 mb-4">
                        <Button
                            variant={activeTab === 'upload' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('upload')}
                            className="flex-1"
                        >
                            <Upload className="mr-2 h-4 w-4" />
                            Upload
                        </Button>
                        <Button
                            variant={activeTab === 'url' ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setActiveTab('url')}
                            className="flex-1"
                        >
                            <Link className="mr-2 h-4 w-4" />
                            URL
                        </Button>
                    </div>

                    {activeTab === 'upload' ? (
                        <div className="space-y-4">
                            <input
                                type="file"
                                ref={fileInputRef}
                                onChange={handleFileUpload}
                                accept="image/*"
                                className="hidden"
                            />
                            
                            {imageUrl ? (
                                <div className="relative rounded-lg overflow-hidden border">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-contain bg-muted"
                                    />
                                    <Button
                                        variant="destructive"
                                        size="sm"
                                        className="absolute top-2 right-2"
                                        onClick={() => setImageUrl('')}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    disabled={isUploading}
                                    className="w-full py-12 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground disabled:opacity-50"
                                >
                                    {isUploading ? (
                                        <>
                                            <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent" />
                                            <span>Uploading...</span>
                                        </>
                                    ) : (
                                        <>
                                            <Upload className="h-8 w-8" />
                                            <span>Click to upload image</span>
                                            <span className="text-xs">Max 5MB</span>
                                        </>
                                    )}
                                </button>
                            )}
                        </div>
                    ) : (
                        <div className="space-y-4">
                            <Input
                                placeholder="Enter image URL"
                                value={imageUrl}
                                onChange={(e) => setImageUrl(e.target.value)}
                            />
                            {imageUrl && (
                                <div className="rounded-lg overflow-hidden border">
                                    <img
                                        src={imageUrl}
                                        alt="Preview"
                                        className="w-full h-48 object-contain bg-muted"
                                        onError={() => {
                                            setImageUrl('');
                                            toast.error('Invalid image URL');
                                        }}
                                    />
                                </div>
                            )}
                        </div>
                    )}

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Caption (optional)</label>
                        <Input
                            placeholder="Image caption"
                            value={imageCaption}
                            onChange={(e) => setImageCaption(e.target.value)}
                        />
                    </div>

                    <div className="flex justify-end gap-2">
                        <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} disabled={!imageUrl}>
                            Insert
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}