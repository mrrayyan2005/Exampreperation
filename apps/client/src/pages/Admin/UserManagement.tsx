import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '../../hooks/useRedux';
import { fetchAdminUsers, updateUserRole, deleteUser } from '../../redux/slices/adminSlice';
import { User } from '../../redux/slices/authSlice';
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "../../components/ui/table";
import { Input } from '../../components/ui/input';
import { Button } from '../../components/ui/button';
import { Search, MoreHorizontal, ShieldAlert, Trash2, Eye } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "../../components/ui/dropdown-menu";
import { Badge } from '../../components/ui/badge';
import { format } from 'date-fns';
import { useToast } from '../../components/ui/use-toast';
import { useDebounce } from '../../hooks/useDebounce';

const UserManagement = () => {
    const dispatch = useAppDispatch();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { users, pagination, loading } = useAppSelector((state) => state.admin);
    const [searchTerm, setSearchTerm] = useState('');
    const debouncedSearchTerm = useDebounce(searchTerm, 300);

    useEffect(() => {
        dispatch(fetchAdminUsers({ page: 1, limit: 20, search: debouncedSearchTerm }));
    }, [dispatch, debouncedSearchTerm]);

    const handleRoleChange = async (userId: string, newRole: string) => {
        try {
            await dispatch(updateUserRole({ userId, role: newRole })).unwrap();
            toast({ title: 'Role Updated', description: `User role changed to ${newRole}` });
        } catch (error: any) {
            toast({ title: 'Update Failed', description: error, variant: 'destructive' });
        }
    };

    const handleDeleteUser = async (userId: string) => {
        if (!window.confirm("Are you sure you want to permanently delete this user?")) return;

        try {
            await dispatch(deleteUser(userId)).unwrap();
            toast({ title: 'User Deleted', description: 'The account has been removed.' });
        } catch (error: any) {
            toast({ title: 'Delete Failed', description: error, variant: 'destructive' });
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin': return 'bg-purple-500/10 text-purple-500 hover:bg-purple-500/20 border-purple-200';
            case 'teacher': return 'bg-blue-500/10 text-blue-500 hover:bg-blue-500/20 border-blue-200';
            default: return 'bg-slate-500/10 text-slate-500 hover:bg-slate-500/20 border-slate-200';
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">User Management</h1>
                    <p className="text-muted-foreground">Manage roles, access, and accounts.</p>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                        type="search"
                        placeholder="Search users by name or email..."
                        className="pl-8"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
            </div>

            <div className="rounded-md border bg-card">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>User</TableHead>
                            <TableHead>Role</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Joined</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading && users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">Loading users...</TableCell>
                            </TableRow>
                        ) : users.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-10 text-muted-foreground">No users found.</TableCell>
                            </TableRow>
                        ) : (
                            users.map((user: User) => (
                                <TableRow key={user.id}>
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-medium">{user.name}</span>
                                            <span className="text-sm text-muted-foreground">{user.email}</span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge variant="outline" className={getRoleBadgeColor(user.role)}>
                                            {user.role}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        {user.isActive ? (
                                            <Badge variant="outline" className="bg-emerald-500/10 text-emerald-500 border-emerald-200">Active</Badge>
                                        ) : (
                                            <Badge variant="outline" className="bg-destructive/10 text-destructive border-destructive/20">Inactive</Badge>
                                        )}
                                    </TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {user.createdAt ? format(new Date(user.createdAt), 'MMM d, yyyy') : 'Unknown'}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button variant="ghost" className="h-8 w-8 p-0">
                                                    <span className="sr-only">Open menu</span>
                                                    <MoreHorizontal className="h-4 w-4" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end">
                                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                                <DropdownMenuSeparator />
                                                
                                                <DropdownMenuItem onClick={() => navigate(`/admin/users/${user.id}`)}>
                                                    <Eye className="mr-2 h-4 w-4" />
                                                    View Profile
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />

                                                {/* Role Management */}
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'admin')}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Make Admin
                                                </DropdownMenuItem>
                                                <DropdownMenuItem onClick={() => handleRoleChange(user.id, 'student')}>
                                                    <ShieldAlert className="mr-2 h-4 w-4" />
                                                    Make Student
                                                </DropdownMenuItem>

                                                <DropdownMenuSeparator />
                                                <DropdownMenuItem
                                                    className="text-destructive focus:text-destructive"
                                                    onClick={() => handleDeleteUser(user.id)}
                                                >
                                                    <Trash2 className="mr-2 h-4 w-4" />
                                                    Delete Account
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination Controls */}
            {pagination.totalPages > 1 && (
                <div className="flex items-center justify-end space-x-2 py-4">
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(fetchAdminUsers({ page: pagination.page - 1, limit: 20, search: searchTerm }))}
                        disabled={pagination.page <= 1 || loading}
                    >
                        Previous
                    </Button>
                    <div className="text-sm font-medium">
                        Page {pagination.page} of {pagination.totalPages}
                    </div>
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={() => dispatch(fetchAdminUsers({ page: pagination.page + 1, limit: 20, search: searchTerm }))}
                        disabled={pagination.page >= pagination.totalPages || loading}
                    >
                        Next
                    </Button>
                </div>
            )}
        </div>
    );
};

export default UserManagement;
