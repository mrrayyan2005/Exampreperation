import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Plus, X, Move, Save, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface Note {
    id: string;
    x: number;
    y: number;
    content: string;
    color: string;
}

const COLORS = [
    'bg-yellow-100 border-yellow-200 dark:bg-yellow-900/40 dark:border-yellow-800',
    'bg-blue-100 border-blue-200 dark:bg-blue-900/40 dark:border-blue-800',
    'bg-green-100 border-green-200 dark:bg-green-900/40 dark:border-green-800',
    'bg-pink-100 border-pink-200 dark:bg-pink-900/40 dark:border-pink-800',
    'bg-purple-100 border-purple-200 dark:bg-purple-900/40 dark:border-purple-800',
];

const StrategyCanvas = () => {
    const [notes, setNotes] = useState<Note[]>([
        { id: '1', x: 100, y: 100, content: 'Exam Goal: Top 10%', color: COLORS[0] },
        { id: '2', x: 400, y: 150, content: 'Focus on Calculus', color: COLORS[1] },
    ]);
    const [scale, setScale] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);

    const addNote = () => {
        const newNote: Note = {
            id: Date.now().toString(),
            x: Math.random() * 200 + 50, // slightly random position
            y: Math.random() * 200 + 50,
            content: 'New Idea',
            color: COLORS[Math.floor(Math.random() * COLORS.length)],
        };
        setNotes([...notes, newNote]);
    };

    const updateNoteContent = (id: string, content: string) => {
        setNotes(notes.map(n => n.id === id ? { ...n, content } : n));
    };

    const deleteNote = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setNotes(notes.filter(n => n.id !== id));
    };

    const handleDragEnd = (id: string, info: { point: { x: number; y: number } }) => {
        // In a real app, calculate new x/y relative to container to save position
        // For this demo, framer motion handles visual position, 
        // but persistence would require updating state with new coordinates.
    };

    return (
        <div className="flex flex-col h-[calc(100vh-200px)] min-h-[600px] border rounded-xl overflow-hidden bg-dot-pattern relative">
            {/* Toolbar */}
            <div className="absolute top-4 left-4 z-10 flex flex-col gap-2 bg-background/80 backdrop-blur-sm p-2 rounded-lg border shadow-sm">
                <TooltipProvider>
                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="secondary" onClick={addNote}>
                                <Plus className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Add Value Note</TooltipContent>
                    </Tooltip>

                    <div className="h-px bg-border my-1" />

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.min(s + 0.1, 2))}>
                                <ZoomIn className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Zoom In</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setScale(s => Math.max(s - 0.1, 0.5))}>
                                <ZoomOut className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Zoom Out</TooltipContent>
                    </Tooltip>

                    <Tooltip>
                        <TooltipTrigger asChild>
                            <Button size="icon" variant="ghost" onClick={() => setScale(1)}>
                                <RotateCcw className="h-4 w-4" />
                            </Button>
                        </TooltipTrigger>
                        <TooltipContent side="right">Reset View</TooltipContent>
                    </Tooltip>
                </TooltipProvider>
            </div>

            <div className="absolute top-4 right-4 z-10">
                <div className="bg-background/80 backdrop-blur-sm px-3 py-1.5 rounded-full border shadow-sm text-xs font-medium text-muted-foreground">
                    Strategy Canvas
                </div>
            </div>

            {/* Canvas Area */}
            <div
                ref={containerRef}
                className="flex-1 overflow-hidden relative bg-muted/5 cursor-grab active:cursor-grabbing"
                style={{
                    backgroundImage: 'radial-gradient(circle, #ddd 1px, transparent 1px)',
                    backgroundSize: '20px 20px'
                }}
            >
                <motion.div
                    className="w-full h-full origin-top-left"
                    style={{ scale }}
                    drag
                    dragConstraints={containerRef}
                    dragElastic={0.1}
                >
                    {notes.map((note) => (
                        <motion.div
                            key={note.id}
                            drag
                            dragMomentum={false}
                            initial={{ x: note.x, y: note.y, scale: 0 }}
                            animate={{ scale: 1 }}
                            onDragEnd={(e, info) => handleDragEnd(note.id, info)}
                            className={`absolute w-48 h-48 p-4 shadow-lg rounded-sm ${note.color} flex flex-col cursor-auto`}
                        >
                            <div className="flex justify-between items-start mb-2 opacity-0 hover:opacity-100 transition-opacity">
                                <Move className="h-4 w-4 text-muted-foreground/50 cursor-move" />
                                <button onClick={(e) => deleteNote(note.id, e)} className="text-muted-foreground/50 hover:text-destructive transition-colors">
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                            <textarea
                                className="flex-1 bg-transparent border-none resize-none focus:outline-none text-sm font-medium leading-relaxed font-handwriting"
                                value={note.content}
                                onChange={(e) => updateNoteContent(note.id, e.target.value)}
                                placeholder="Write something..."
                            />
                        </motion.div>
                    ))}
                </motion.div>
            </div>
        </div>
    );
};

export default StrategyCanvas;
