import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from '@/components/ui/table';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
    Plus, 
    Trash2, 
    MoreHorizontal, 
    Rows, 
    Columns,
    Table as TableIcon,
    GripVertical
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TableData {
    rows: number;
    cols: number;
    headers: string[];
    data: string[][];
}

interface TableBlockProps {
    content?: string; // JSON string of TableData
    onChange: (content: string) => void;
}

const DEFAULT_TABLE: TableData = {
    rows: 3,
    cols: 3,
    headers: ['Column 1', 'Column 2', 'Column 3'],
    data: [
        ['', '', ''],
        ['', '', ''],
    ]
};

export function TableBlock({ content, onChange }: TableBlockProps) {
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [newRows, setNewRows] = useState(3);
    const [newCols, setNewCols] = useState(3);

    // Parse table data from content or use default
    let tableData: TableData = DEFAULT_TABLE;
    if (content) {
        try {
            tableData = JSON.parse(content);
        } catch (e) {
            console.error('Failed to parse table content:', e);
            tableData = DEFAULT_TABLE;
        }
    }

    const handleCreateTable = () => {
        const headers = Array(newCols).fill(0).map((_, i) => `Column ${i + 1}`);
        const data = Array(newRows - 1).fill(0).map(() => Array(newCols).fill(''));
        
        const newTable: TableData = {
            rows: newRows,
            cols: newCols,
            headers,
            data
        };
        
        onChange(JSON.stringify(newTable));
        setIsDialogOpen(false);
    };

    const updateCell = (rowIndex: number, colIndex: number, value: string) => {
        const newData = { ...tableData };
        if (rowIndex === -1) {
            // Header row
            newData.headers[colIndex] = value;
        } else {
            newData.data[rowIndex][colIndex] = value;
        }
        onChange(JSON.stringify(newData));
    };

    const addRow = () => {
        const newData = { ...tableData };
        newData.data.push(Array(newData.cols).fill(''));
        newData.rows++;
        onChange(JSON.stringify(newData));
    };

    const removeRow = (index: number) => {
        if (tableData.data.length <= 1) return; // Keep at least one row
        const newData = { ...tableData };
        newData.data.splice(index, 1);
        newData.rows--;
        onChange(JSON.stringify(newData));
    };

    const addColumn = () => {
        const newData = { ...tableData };
        newData.headers.push(`Column ${newData.headers.length + 1}`);
        newData.data.forEach(row => row.push(''));
        newData.cols++;
        onChange(JSON.stringify(newData));
    };

    const removeColumn = (index: number) => {
        if (tableData.cols <= 1) return; // Keep at least one column
        const newData = { ...tableData };
        newData.headers.splice(index, 1);
        newData.data.forEach(row => row.splice(index, 1));
        newData.cols--;
        onChange(JSON.stringify(newData));
    };

    const deleteTable = () => {
        onChange('');
    };

    if (!content) {
        return (
            <>
                <button
                    onClick={() => setIsDialogOpen(true)}
                    className="w-full py-8 border-2 border-dashed rounded-lg hover:border-primary/50 hover:bg-muted/50 transition-colors flex flex-col items-center gap-2 text-muted-foreground"
                >
                    <TableIcon className="h-8 w-8" />
                    <span>Click to add a table</span>
                </button>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle>Insert Table</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Rows</label>
                                    <Input
                                        type="number"
                                        min={2}
                                        max={20}
                                        value={newRows}
                                        onChange={(e) => setNewRows(parseInt(e.target.value) || 3)}
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-sm font-medium">Columns</label>
                                    <Input
                                        type="number"
                                        min={1}
                                        max={10}
                                        value={newCols}
                                        onChange={(e) => setNewCols(parseInt(e.target.value) || 3)}
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button onClick={handleCreateTable}>
                                Create Table
                            </Button>
                        </div>
                    </DialogContent>
                </Dialog>
            </>
        );
    }

    return (
        <div className="border rounded-lg overflow-hidden bg-background">
            {/* Table Toolbar */}
            <div className="flex items-center justify-between p-2 border-b bg-muted/30">
                <div className="flex items-center gap-1">
                    <Button variant="ghost" size="sm" onClick={addRow}>
                        <Plus className="h-4 w-4 mr-1" />
                        Row
                    </Button>
                    <Button variant="ghost" size="sm" onClick={addColumn}>
                        <Columns className="h-4 w-4 mr-1" />
                        Column
                    </Button>
                </div>
                
                <div className="flex items-center gap-1">
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => removeRow(tableData.data.length - 1)}>
                                <Rows className="mr-2 h-4 w-4" />
                                Remove Last Row
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => removeColumn(tableData.cols - 1)}>
                                <Columns className="mr-2 h-4 w-4" />
                                Remove Last Column
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                                className="text-destructive focus:text-destructive"
                                onClick={deleteTable}
                            >
                                <Trash2 className="mr-2 h-4 w-4" />
                                Delete Table
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
                <Table>
                    <TableHeader>
                        <TableRow className="bg-muted/50">
                            <TableHead className="w-8 border-r p-0">
                                <div className="flex items-center justify-center">
                                    <GripVertical className="h-4 w-4 text-muted-foreground" />
                                </div>
                            </TableHead>
                            {tableData.headers.map((header, colIndex) => (
                                <TableHead key={colIndex} className="p-0 min-w-[120px]">
                                    <div className="flex items-center gap-1 px-2 py-2">
                                        <Input
                                            value={header}
                                            onChange={(e) => updateCell(-1, colIndex, e.target.value)}
                                            className="h-8 font-semibold bg-transparent border-0 focus-visible:ring-1"
                                            placeholder={`Column ${colIndex + 1}`}
                                        />
                                        {tableData.cols > 1 && (
                                            <Button
                                                variant="ghost"
                                                size="icon"
                                                className="h-6 w-6 opacity-0 hover:opacity-100"
                                                onClick={() => removeColumn(colIndex)}
                                            >
                                                <Trash2 className="h-3 w-3" />
                                            </Button>
                                        )}
                                    </div>
                                </TableHead>
                            ))}
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {tableData.data.map((row, rowIndex) => (
                            <TableRow key={rowIndex}>
                                <TableCell className="border-r p-0">
                                    <div className="flex items-center justify-center h-full">
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-8 w-8 text-muted-foreground hover:text-destructive"
                                            onClick={() => removeRow(rowIndex)}
                                            disabled={tableData.data.length <= 1}
                                        >
                                            <Trash2 className="h-3 w-3" />
                                        </Button>
                                    </div>
                                </TableCell>
                                {row.map((cell, colIndex) => (
                                    <TableCell key={colIndex} className="p-0">
                                        <Input
                                            value={cell}
                                            onChange={(e) => updateCell(rowIndex, colIndex, e.target.value)}
                                            className="h-full min-h-[40px] rounded-none border-0 focus-visible:ring-1 focus-visible:ring-inset"
                                            placeholder="..."
                                        />
                                    </TableCell>
                                ))}
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}