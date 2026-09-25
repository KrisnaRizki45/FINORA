'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '@/lib/api/endpoints';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Search, ShieldAlert, User as UserIcon, Loader2, AlertCircle, Edit, Trash2, Eye } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Modal } from '@/components/ui/modal';
import { ConfirmDialog } from '@/components/ui/confirm-dialog';
import type { User } from '@/types';
import { toast } from 'sonner';

export default function AdminUsersPage() {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  // Edit form state
  const [editName, setEditName] = useState('');
  const [editRole, setEditRole] = useState('');
  const [editStatus, setEditStatus] = useState('');

  // Handle Search Debounce
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPage(1); // Reset page on search
  };

  // Actual debounce effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  // Keep handleSearchSubmit just in case they press enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDebouncedSearch(search);
  };

  const { data: response, isLoading, isError } = useQuery({
    queryKey: ['admin-users', page, debouncedSearch],
    queryFn: () => adminApi.getUsers({ page, per_page: 10, search: debouncedSearch }),
    placeholderData: (previousData) => previousData, // keep old data while fetching
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminApi.deleteUser(id),
    onSuccess: () => {
      toast.success('User deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsDeleteModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to delete user');
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string, data: { name: string, role: string, status: string } }) => adminApi.updateUser(id, data),
    onSuccess: () => {
      toast.success('User updated successfully');
      queryClient.invalidateQueries({ queryKey: ['admin-users'] });
      setIsEditModalOpen(false);
      setSelectedUser(null);
    },
    onError: (error: any) => {
      toast.error(error.message || 'Failed to update user');
    }
  });

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUser) return;
    updateMutation.mutate({ id: selectedUser.id, data: { name: editName, role: editRole, status: editStatus } });
  };

  const openView = (user: User) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  const openEdit = (user: User) => {
    setSelectedUser(user);
    setEditName(user.name);
    setEditRole(user.role || 'user');
    setEditStatus(user.status || 'active');
    setIsEditModalOpen(true);
  };

  const openDelete = (user: User) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  if (isError) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center border rounded-xl border-dashed border-red-200 bg-red-50 dark:border-red-900 dark:bg-red-950/20">
        <AlertCircle className="h-10 w-10 text-red-500 mb-4" />
        <h3 className="text-lg font-semibold text-red-900 dark:text-red-400">Failed to load users</h3>
        <p className="text-red-600 dark:text-red-500 mt-1">Make sure you have admin privileges.</p>
      </div>
    );
  }

  const users = response?.data || [];
  const meta = response?.meta;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">User Management</h2>
          <p className="text-gray-500 dark:text-gray-400">View and manage all registered users.</p>
        </div>
        
        <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search name or email..." 
            value={search}
            onChange={handleSearch}
            className="pl-9 w-full"
          />
          <button type="submit" className="hidden">Search</button>
        </form>
      </div>

      <Card className="border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-gray-800">
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Role</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">Joined At</th>
                <th className="px-6 py-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800 bg-white dark:bg-gray-950">
              {isLoading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center">
                    <Loader2 className="h-8 w-8 text-amber-500 animate-spin mx-auto" />
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-gray-500 dark:text-gray-400">
                    No users found matching "{debouncedSearch}"
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-10 w-10 flex-shrink-0 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden border border-gray-200 dark:border-gray-700">
                          {user.avatar_url ? (
                            <img src={user.avatar_url} alt="" className="h-full w-full object-cover" />
                          ) : (
                            <UserIcon className="h-5 w-5 text-gray-400" />
                          )}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {user.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {user.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex flex-col space-y-1">
                        <span className={`inline-flex items-center w-fit px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          user.role === 'admin' 
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400' 
                            : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                        }`}>
                          {user.role === 'admin' && <ShieldAlert className="w-3 h-3 mr-1" />}
                          {user.role || 'user'}
                        </span>
                        <span className={`inline-flex items-center w-fit px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider ${
                          user.status === 'inactive' 
                            ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' 
                            : 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {user.status || 'active'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {format(new Date(user.created_at), 'MMM d, yyyy')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button onClick={() => openView(user)} className="p-2 text-gray-400 hover:text-blue-500 transition-colors rounded-full hover:bg-blue-50 dark:hover:bg-blue-900/20" title="View details">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button onClick={() => openEdit(user)} className="p-2 text-gray-400 hover:text-amber-500 transition-colors rounded-full hover:bg-amber-50 dark:hover:bg-amber-900/20" title="Edit user">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button onClick={() => openDelete(user)} className="p-2 text-gray-400 hover:text-red-500 transition-colors rounded-full hover:bg-red-50 dark:hover:bg-red-900/20" title="Delete user">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
        
        {/* Pagination */}
        {meta && meta.last_page > 1 && (
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800 flex items-center justify-between bg-gray-50 dark:bg-gray-900/30">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Showing <span className="font-medium text-gray-900 dark:text-white">{(meta.current_page - 1) * 10 + 1}</span> to <span className="font-medium text-gray-900 dark:text-white">{Math.min(meta.current_page * 10, meta.total)}</span> of <span className="font-medium text-gray-900 dark:text-white">{meta.total}</span> users
            </div>
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage(p => Math.min(meta.last_page, p + 1))}
                disabled={page === meta.last_page || isLoading}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* View Modal */}
      <Modal 
        isOpen={isViewModalOpen} 
        onClose={() => setIsViewModalOpen(false)} 
        title="User Details"
        description="Detailed information about this user."
      >
        {selectedUser && (
          <div className="space-y-4 pt-4">
            <div className="flex items-center gap-4 border-b border-gray-100 dark:border-gray-800 pb-4">
              <div className="h-16 w-16 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center overflow-hidden">
                {selectedUser.avatar_url ? (
                  <img src={selectedUser.avatar_url} alt="" className="h-full w-full object-cover" />
                ) : (
                  <UserIcon className="h-8 w-8 text-gray-400" />
                )}
              </div>
              <div>
                <h4 className="text-lg font-semibold text-gray-900 dark:text-white">{selectedUser.name}</h4>
                <p className="text-gray-500 dark:text-gray-400">{selectedUser.email}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="inline-block px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300">
                    {selectedUser.role || 'user'}
                  </span>
                  <span className={`inline-block px-2.5 py-0.5 rounded-full text-xs font-medium ${
                    selectedUser.status === 'inactive' 
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400' 
                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
                  }`}>
                    {selectedUser.status || 'active'}
                  </span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">User ID</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate" title={selectedUser.id}>{selectedUser.id}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Joined Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.created_at ? format(new Date(selectedUser.created_at), 'PPP') : '-'}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Last Updated</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white">{selectedUser.updated_at ? format(new Date(selectedUser.updated_at), 'PPP') : '-'}</p>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Edit Modal */}
      <Modal 
        isOpen={isEditModalOpen} 
        onClose={() => setIsEditModalOpen(false)} 
        title="Edit User"
        description="Update user role and basic info."
      >
        <form onSubmit={handleEditSubmit} className="space-y-4 pt-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Name</label>
            <Input 
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Role</label>
            <select 
              value={editRole}
              onChange={(e) => setEditRole(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="user">User</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-900 dark:text-white">Account Status</label>
            <select 
              value={editStatus}
              onChange={(e) => setEditStatus(e.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={updateMutation.isPending}>
              {updateMutation.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Save Changes
            </Button>
          </div>
        </form>
      </Modal>

      {/* Delete Dialog */}
      <ConfirmDialog
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={() => selectedUser && deleteMutation.mutate(selectedUser.id)}
        title="Delete User"
        description={`Are you sure you want to delete ${selectedUser?.name}? This action cannot be undone and will delete all associated user data.`}
        confirmText="Delete User"
        isDestructive={true}
        isLoading={deleteMutation.isPending}
      />
    </div>
  );
}
