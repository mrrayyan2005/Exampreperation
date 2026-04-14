import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import flashcardApi, { Deck } from '@/api/flashcardApi';
import { fetchPost } from '@/api/community';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Plus, Play, Book, MoreVertical, Trash2, Pencil, Search, BarChart3 } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';

import { SEO } from '@/components/Shared/SEO';
import { useDebounce } from '@/hooks/useDebounce';

const DeckList = () => {
    const [decks, setDecks] = useState<Deck[]>([]);
    const [loading, setLoading] = useState(true);
    const [newDeckName, setNewDeckName] = useState('');
    const [newDeckTopic, setNewDeckTopic] = useState('');
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const debouncedSearchQuery = useDebounce(searchQuery, 300);
    const [deckToDelete, setDeckToDelete] = useState<Deck | null>(null);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);

    const navigate = useNavigate();
    const location = useLocation();
    const { toast } = useToast();
    const [prefillPost, setPrefillPost] = useState<any>(null);

    useEffect(() => {
        fetchDecks();
        
        // Handle deep integration from community
        const state = location.state as { fromPostId?: string };
        if (state?.fromPostId) {
            fetchPost(state.fromPostId).then(res => {
                const post = res.data.data;
                setPrefillPost(post);
                setNewDeckName(post.chapter || post.title.slice(0, 20));
                setNewDeckTopic(post.chapter || 'Community');
                setIsDialogOpen(true);
            }).catch(err => {
                console.error('Failed to prefill from post', err);
            });
        }
    }, [location.state]);

    const fetchDecks = async () => {
        try {
            setLoading(true);
            const data = await flashcardApi.getDecks();
            setDecks(data);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load decks',
            });
        } finally {
            setLoading(false);
        }
    };

    const handleCreateDeck = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const deck = await flashcardApi.createDeck({
                name: newDeckName,
                topic: newDeckTopic,
                description: prefillPost 
                    ? `Imported from community post: ${prefillPost.title}` 
                    : 'Created via web'
            });

            // If we have a prefill post, immediately create a card in this deck
            if (prefillPost) {
                const back = prefillPost.type === 'question' 
                    ? `Answer Context:\n${prefillPost.body || ''}\n\nChapter: ${prefillPost.chapter || 'N/A'}`
                    : prefillPost.body;
                
                await flashcardApi.createCard({
                    deck: deck._id,
                    front: prefillPost.title,
                    back: back || 'See community post for details',
                    hint: prefillPost.type.toUpperCase()
                });
                toast({ title: 'Synced!', description: 'Post content saved as a flashcard in your new deck.' });
            } else {
                toast({ title: 'Success', description: 'Deck created successfully' });
            }

            setIsDialogOpen(false);
            setNewDeckName('');
            setNewDeckTopic('');
            setPrefillPost(null);
            fetchDecks();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to create deck',
            });
        }
    };

    const handleDeleteDeck = async () => {
        if (!deckToDelete) return;
        try {
            setIsDeleting(true);
            await flashcardApi.deleteDeck(deckToDelete._id);
            toast({
                title: 'Deck deleted',
                description: 'The deck and its cards were removed.'
            });
            setIsDeleteOpen(false);
            setDeckToDelete(null);
            fetchDecks();
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete deck',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const filteredDecks = decks.filter((deck) => {
        const query = debouncedSearchQuery.trim().toLowerCase();
        if (!query) return true;
        return [deck.name, deck.topic, deck.description]
            .filter(Boolean)
            .some((value) => value!.toLowerCase().includes(query));
    });

    return (
        <SEO 
            title="Flashcard Decks" 
            description="Master your subjects with spaced repetition flashcards on ExamPrep."
        >
            <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight"><span className="text-primary">Flashcards</span></h1>
                    <p className="text-muted-foreground">Master your subjects with spaced repetition.</p>
                </div>
                <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row sm:items-center">
                    <div className="relative w-full sm:w-64">
                        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search decks"
                            className="pl-9"
                        />
                    </div>
                    <Button
                        variant="outline"
                        className="w-full sm:w-auto"
                        onClick={() => navigate('/flashcards/analytics')}
                    >
                        <BarChart3 className="mr-2 h-4 w-4" /> Analytics
                    </Button>
                    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                        <DialogTrigger asChild>
                            <Button className="w-full sm:w-auto">
                                <Plus className="mr-2 h-4 w-4" /> Create Deck
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{prefillPost ? 'Import to Flashcards' : 'Create New Deck'}</DialogTitle>
                                <DialogDescription>
                                    {prefillPost 
                                        ? `Create a deck to save "${prefillPost.title}" as your first card.`
                                        : 'Add a new collection of flashcards to your library.'}
                                </DialogDescription>
                            </DialogHeader>
                            {prefillPost && (
                                <div className="p-3 bg-primary/5 border border-primary/10 rounded-lg mb-4">
                                    <p className="text-xs font-bold text-primary uppercase mb-1">Previewing Content</p>
                                    <p className="text-sm font-medium line-clamp-1">{prefillPost.title}</p>
                                </div>
                            )}
                            <form onSubmit={handleCreateDeck} className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Deck Name</Label>
                                    <Input
                                        id="name"
                                        value={newDeckName}
                                        onChange={(e) => setNewDeckName(e.target.value)}
                                        placeholder="e.g., Ancient History"
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="topic">Topic</Label>
                                    <Input
                                        id="topic"
                                        value={newDeckTopic}
                                        onChange={(e) => setNewDeckTopic(e.target.value)}
                                        placeholder="e.g., History"
                                        required
                                    />
                                </div>
                                <DialogFooter>
                                    <Button type="submit">Create Deck</Button>
                                </DialogFooter>
                            </form>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>

            {loading ? (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="h-48 animate-pulse rounded-xl bg-muted/50" />
                    ))}
                </div>
            ) : filteredDecks.length === 0 ? (
                <div className="flex h-64 flex-col items-center justify-center rounded-lg border border-dashed text-center">
                    <Book className="mb-4 h-12 w-12 text-muted-foreground" />
                    <h3 className="text-lg font-semibold">No decks found</h3>
                    <p className="text-muted-foreground">Try a different search or create a new deck.</p>
                </div>
            ) : (
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                    {filteredDecks.map((deck) => (
                        <Card key={deck._id} className="transition-all hover:shadow-md">
                            <CardHeader>
                                <CardTitle className="flex items-center justify-between">
                                    {deck.name}
                                    <span className="text-xs font-normal text-muted-foreground px-2 py-1 bg-secondary rounded-full">
                                        {deck.topic}
                                    </span>
                                </CardTitle>
                                <CardDescription>
                                    {deck.stats?.totalCards || 0} cards • {deck.stats?.cardsLearned || 0} learned
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground line-clamp-2">
                                    {deck.description || 'No description provided.'}
                                </p>
                            </CardContent>
                            <CardFooter className="flex justify-between gap-2">
                                <DropdownMenu>
                                    <DropdownMenuTrigger asChild>
                                        <Button variant="outline" size="icon" aria-label="Deck actions">
                                            <MoreVertical className="h-4 w-4" />
                                        </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent align="start">
                                        <DropdownMenuItem onClick={() => navigate(`/flashcards/${deck._id}/edit`)}>
                                            <Pencil className="mr-2 h-4 w-4" /> Edit
                                        </DropdownMenuItem>
                                        <DropdownMenuItem onClick={() => navigate(`/flashcards/${deck._id}/study`)}>
                                            <Play className="mr-2 h-4 w-4" /> Study
                                        </DropdownMenuItem>
                                        <DropdownMenuItem
                                            className="text-destructive focus:text-destructive"
                                            onClick={() => {
                                                setDeckToDelete(deck);
                                                setIsDeleteOpen(true);
                                            }}
                                        >
                                            <Trash2 className="mr-2 h-4 w-4" /> Delete
                                        </DropdownMenuItem>
                                    </DropdownMenuContent>
                                </DropdownMenu>
                                <Button className="w-full" onClick={() => navigate(`/flashcards/${deck._id}/study`)}>
                                    <Play className="mr-2 h-4 w-4" /> Study
                                </Button>
                            </CardFooter>
                        </Card>
                    ))}
                </div>
            )}

            <AlertDialog open={isDeleteOpen} onOpenChange={setIsDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete deck</AlertDialogTitle>
                        <AlertDialogDescription>
                            {deckToDelete
                                ? `Delete "${deckToDelete.name}" and all its cards? This action cannot be undone.`
                                : 'Delete this deck and all its cards? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteDeck}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Deck'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
        </SEO>
    );
};

export default DeckList;
