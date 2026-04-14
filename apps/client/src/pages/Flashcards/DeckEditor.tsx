import { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import flashcardApi, { Deck, Flashcard } from '@/api/flashcardApi';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import {
    Dialog,
    DialogContent,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog';
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
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Plus, Trash2, Save } from 'lucide-react';

const DeckEditor = () => {
    const { deckId } = useParams();
    const navigate = useNavigate();
    const { toast } = useToast();

    const [deck, setDeck] = useState<Deck | null>(null);
    const [cards, setCards] = useState<Flashcard[]>([]);
    const [loading, setLoading] = useState(true);
    const [savingDeck, setSavingDeck] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

    const [isCardDialogOpen, setIsCardDialogOpen] = useState(false);
    const [cardForm, setCardForm] = useState({ front: '', back: '', hint: '' });
    const [editingCard, setEditingCard] = useState<Flashcard | null>(null);

    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
    const [isBulkDeleteOpen, setIsBulkDeleteOpen] = useState(false);
    const [cardToDelete, setCardToDelete] = useState<Flashcard | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    useEffect(() => {
        if (!deckId) return;
        fetchDeck();
    }, [deckId]);

    const fetchDeck = async () => {
        if (!deckId) return;
        try {
            setLoading(true);
            const [deckData, cardData] = await Promise.all([
                flashcardApi.getDeck(deckId),
                flashcardApi.getCardsByDeck(deckId)
            ]);
            setDeck(deckData);
            setCards(cardData);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to load deck data',
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredCards = useMemo(() => {
        const query = searchQuery.trim().toLowerCase();
        if (!query) return cards;
        return cards.filter((card) =>
            [card.front, card.back, card.hint]
                .filter(Boolean)
                .some((value) => value!.toLowerCase().includes(query))
        );
    }, [cards, searchQuery]);

    const handleDeckSave = async () => {
        if (!deck || !deckId) return;
        try {
            setSavingDeck(true);
            const updated = await flashcardApi.updateDeck(deckId, {
                name: deck.name,
                topic: deck.topic,
                description: deck.description,
                tags: deck.tags
            });
            setDeck(updated);
            toast({ title: 'Deck saved', description: 'Your changes were updated.' });
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save deck',
            });
        } finally {
            setSavingDeck(false);
        }
    };

    const openCreateCard = () => {
        setEditingCard(null);
        setCardForm({ front: '', back: '', hint: '' });
        setIsCardDialogOpen(true);
    };

    const openEditCard = (card: Flashcard) => {
        setEditingCard(card);
        setCardForm({ front: card.front, back: card.back, hint: card.hint || '' });
        setIsCardDialogOpen(true);
    };

    const handleSaveCard = async () => {
        if (!deckId) return;
        try {
            if (editingCard) {
                const updated = await flashcardApi.updateCard(editingCard._id, {
                    front: cardForm.front,
                    back: cardForm.back,
                    hint: cardForm.hint || undefined
                });
                setCards((prev) => prev.map((card) => (card._id === updated._id ? updated : card)));
                toast({ title: 'Card updated', description: 'The card was saved.' });
            } else {
                const created = await flashcardApi.createCard({
                    deck: deckId,
                    front: cardForm.front,
                    back: cardForm.back,
                    hint: cardForm.hint || undefined
                });
                setCards((prev) => [created, ...prev]);
                setDeck((prev) =>
                    prev
                        ? {
                              ...prev,
                              stats: {
                                  ...prev.stats,
                                  totalCards: (prev.stats?.totalCards || 0) + 1
                              }
                          }
                        : prev
                );
                toast({ title: 'Card created', description: 'New card added to deck.' });
            }
            setIsCardDialogOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to save card',
            });
        }
    };

    const handleDeleteCard = async () => {
        if (!cardToDelete) return;
        try {
            setIsDeleting(true);
            await flashcardApi.deleteCard(cardToDelete._id);
            setCards((prev) => prev.filter((card) => card._id !== cardToDelete._id));
            setSelectedIds((prev) => {
                const next = new Set(prev);
                next.delete(cardToDelete._id);
                return next;
            });
            setDeck((prev) =>
                prev
                    ? {
                          ...prev,
                          stats: {
                              ...prev.stats,
                              totalCards: Math.max((prev.stats?.totalCards || 1) - 1, 0)
                          }
                      }
                    : prev
            );
            toast({ title: 'Card deleted', description: 'The card was removed.' });
            setIsDeleteDialogOpen(false);
            setCardToDelete(null);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete card',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const handleBulkDelete = async () => {
        if (!selectedIds.size) return;
        try {
            setIsDeleting(true);
            const ids = Array.from(selectedIds);
            await flashcardApi.bulkDeleteCards(ids);
            setCards((prev) => prev.filter((card) => !selectedIds.has(card._id)));
            setSelectedIds(new Set());
            setDeck((prev) =>
                prev
                    ? {
                          ...prev,
                          stats: {
                              ...prev.stats,
                              totalCards: Math.max((prev.stats?.totalCards || 0) - ids.length, 0)
                          }
                      }
                    : prev
            );
            toast({ title: 'Cards deleted', description: 'Selected cards were removed.' });
            setIsBulkDeleteOpen(false);
        } catch (error) {
            toast({
                variant: 'destructive',
                title: 'Error',
                description: 'Failed to delete selected cards',
            });
        } finally {
            setIsDeleting(false);
        }
    };

    const toggleSelectAll = (checked: boolean) => {
        if (checked) {
            setSelectedIds(new Set(filteredCards.map((card) => card._id)));
        } else {
            setSelectedIds(new Set());
        }
    };

    const toggleSelectCard = (cardId: string, checked: boolean) => {
        setSelectedIds((prev) => {
            const next = new Set(prev);
            if (checked) {
                next.add(cardId);
            } else {
                next.delete(cardId);
            }
            return next;
        });
    };

    if (loading) {
        return <div className="flex h-[60vh] items-center justify-center">Loading deck...</div>;
    }

    if (!deck) {
        return (
            <div className="flex flex-col items-center justify-center h-[60vh] space-y-3">
                <p className="text-lg font-semibold">Deck not found.</p>
                <Button onClick={() => navigate('/flashcards')}>Back to decks</Button>
            </div>
        );
    }

    const allSelected = filteredCards.length > 0 && selectedIds.size === filteredCards.length;

    return (
        <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="space-y-1">
                    <Button variant="ghost" onClick={() => navigate('/flashcards')}>
                        <ArrowLeft className="mr-2 h-4 w-4" /> Back to decks
                    </Button>
                    <h1 className="text-3xl font-bold tracking-tight">Edit Deck</h1>
                    <p className="text-muted-foreground">Manage your cards and update deck details.</p>
                </div>
                <Button onClick={handleDeckSave} disabled={savingDeck} className="gap-2">
                    <Save className="h-4 w-4" /> {savingDeck ? 'Saving...' : 'Save Deck'}
                </Button>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Deck Details</CardTitle>
                </CardHeader>
                <CardContent className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                        <Label htmlFor="deck-name">Name</Label>
                        <Input
                            id="deck-name"
                            value={deck.name}
                            onChange={(e) => setDeck({ ...deck, name: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="deck-topic">Topic</Label>
                        <Input
                            id="deck-topic"
                            value={deck.topic}
                            onChange={(e) => setDeck({ ...deck, topic: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 md:col-span-2">
                        <Label htmlFor="deck-description">Description</Label>
                        <Textarea
                            id="deck-description"
                            value={deck.description || ''}
                            onChange={(e) => setDeck({ ...deck, description: e.target.value })}
                        />
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <CardTitle>Cards</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {cards.length} total cards
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Input
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search cards"
                            className="w-full sm:w-64"
                        />
                        <Dialog open={isCardDialogOpen} onOpenChange={setIsCardDialogOpen}>
                            <DialogTrigger asChild>
                                <Button onClick={openCreateCard} className="gap-2">
                                    <Plus className="h-4 w-4" /> Add Card
                                </Button>
                            </DialogTrigger>
                            <DialogContent>
                                <DialogHeader>
                                    <DialogTitle>{editingCard ? 'Edit Card' : 'Add Card'}</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <Label htmlFor="card-front">Front</Label>
                                        <Textarea
                                            id="card-front"
                                            value={cardForm.front}
                                            onChange={(e) => setCardForm((prev) => ({ ...prev, front: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="card-back">Back</Label>
                                        <Textarea
                                            id="card-back"
                                            value={cardForm.back}
                                            onChange={(e) => setCardForm((prev) => ({ ...prev, back: e.target.value }))}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label htmlFor="card-hint">Hint (optional)</Label>
                                        <Input
                                            id="card-hint"
                                            value={cardForm.hint}
                                            onChange={(e) => setCardForm((prev) => ({ ...prev, hint: e.target.value }))}
                                        />
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleSaveCard} disabled={!cardForm.front || !cardForm.back}>
                                        Save Card
                                    </Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                        {selectedIds.size > 0 && (
                            <Button
                                variant="destructive"
                                className="gap-2"
                                onClick={() => setIsBulkDeleteOpen(true)}
                            >
                                <Trash2 className="h-4 w-4" /> Delete Selected ({selectedIds.size})
                            </Button>
                        )}
                    </div>
                </CardHeader>
                <CardContent>
                    {filteredCards.length === 0 ? (
                        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed p-10 text-center">
                            <p className="text-sm text-muted-foreground">No cards found.</p>
                        </div>
                    ) : (
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead className="w-12">
                                        <Checkbox checked={allSelected} onCheckedChange={(value) => toggleSelectAll(!!value)} />
                                    </TableHead>
                                    <TableHead>Front</TableHead>
                                    <TableHead>Back</TableHead>
                                    <TableHead>Hint</TableHead>
                                    <TableHead>Difficulty</TableHead>
                                    <TableHead className="text-right">Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {filteredCards.map((card) => (
                                    <TableRow key={card._id}>
                                        <TableCell>
                                            <Checkbox
                                                checked={selectedIds.has(card._id)}
                                                onCheckedChange={(value) => toggleSelectCard(card._id, !!value)}
                                            />
                                        </TableCell>
                                        <TableCell className="font-medium">{card.front}</TableCell>
                                        <TableCell>{card.back}</TableCell>
                                        <TableCell>{card.hint || '-'}</TableCell>
                                        <TableCell>
                                            <Badge variant="secondary">
                                                {card.difficulty ? card.difficulty.toFixed(2) : 'New'}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-right space-x-2">
                                            <Button size="sm" variant="outline" onClick={() => openEditCard(card)}>
                                                Edit
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="destructive"
                                                onClick={() => {
                                                    setCardToDelete(card);
                                                    setIsDeleteDialogOpen(true);
                                                }}
                                            >
                                                Delete
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    )}
                </CardContent>
            </Card>

            <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete card</AlertDialogTitle>
                        <AlertDialogDescription>
                            {cardToDelete
                                ? `Delete the selected card? This action cannot be undone.`
                                : 'Delete this card? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDeleteCard}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Card'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>

            <AlertDialog open={isBulkDeleteOpen} onOpenChange={setIsBulkDeleteOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete selected cards</AlertDialogTitle>
                        <AlertDialogDescription>
                            Delete {selectedIds.size} selected cards? This action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleBulkDelete}
                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            disabled={isDeleting}
                        >
                            {isDeleting ? 'Deleting...' : 'Delete Selected'}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};

export default DeckEditor;
