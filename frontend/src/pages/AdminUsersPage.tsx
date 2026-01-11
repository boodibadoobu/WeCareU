import { useEffect, useState, useMemo } from 'react';
import api from '../api/axios';
import { Check, X, Edit, Trash2, Plus } from 'lucide-react';
import UserFormModal from '../components/UserFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

interface UserData {
    id: number;
    full_name: string;
    email?: string;
    nim?: string;
    role: 'ADMIN' | 'COUNSELOR' | 'STUDENT';
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);
    const [showUserModal, setShowUserModal] = useState(false);
    const [editingUser, setEditingUser] = useState<UserData | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [activeTab, setActiveTab] = useState<'ALL' | 'STUDENT' | 'COUNSELOR'>('ALL');

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            setLoading(true);
            setError(null);
            // Fetch all users (you may need to create this endpoint)
            const res = await api.get('/admin/users');
            setUsers(res.data);
        } catch (err: any) {
            // Fallback to pending users if all users endpoint doesn't exist
            try {
                const res = await api.get('/admin/pending-users');
                setUsers(res.data);
            } catch (fallbackErr: any) {
                setError(fallbackErr.response?.data?.message || 'Failed to load users');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number, action: 'APPROVE' | 'REJECT') => {
        try {
            setError(null);
            await api.post(`/admin/verify/${id}`, { action });
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to verify user');
        }
    };

    const handleCreateUser = async (data: any) => {
        try {
            setError(null);
            await api.post('/admin/users', data);
            setShowUserModal(false);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create user');
        }
    };

    const handleEditUser = async (data: any) => {
        if (!editingUser) return;

        try {
            setError(null);
            // Use verify endpoint with action mapped from status
            const action = data.status; // ACTIVE, SUSPENDED, or PENDING
            await api.post(`/admin/verify/${editingUser.id}`, { action, reason: 'Status updated by admin' });
            setShowUserModal(false);
            setEditingUser(null);
            fetchUsers();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update user');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/admin/users/${deleteId}`);
            setUsers(users.filter(u => u.id !== deleteId));
            setDeleteId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete user');
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    const openEditModal = (user: UserData) => {
        setEditingUser(user);
        setShowUserModal(true);
    };

    const closeModal = () => {
        setShowUserModal(false);
        setEditingUser(null);
    };

    const filteredUsers = useMemo(() => {
        if (activeTab === 'ALL') return users;
        return users.filter(u => u.role === activeTab);
    }, [users, activeTab]);

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <UserFormModal
                isOpen={showUserModal}
                onClose={closeModal}
                onSubmit={editingUser ? handleEditUser : handleCreateUser}
                initialData={editingUser || undefined}
                isEdit={!!editingUser}
            />

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete User"
                message="Are you sure you want to delete this user? This action cannot be undone and will remove all associated data."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteId(null)}
            />

            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button
                    onClick={() => setShowUserModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {/* Tabs */}
                <div className="border-b border-gray-200">
                    <nav className="flex -mb-px">
                        <button
                            onClick={() => setActiveTab('ALL')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'ALL'
                                ? 'border-green-600 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            All Users
                            {users.length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-gray-100 text-gray-600">
                                    {users.length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('STUDENT')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'STUDENT'
                                ? 'border-green-600 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Students
                            {users.filter(u => u.role === 'STUDENT').length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-green-100 text-green-600">
                                    {users.filter(u => u.role === 'STUDENT').length}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setActiveTab('COUNSELOR')}
                            className={`px-6 py-4 text-sm font-medium border-b-2 transition-colors ${activeTab === 'COUNSELOR'
                                ? 'border-green-600 text-green-600'
                                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            Counselors
                            {users.filter(u => u.role === 'COUNSELOR').length > 0 && (
                                <span className="ml-2 px-2 py-0.5 text-xs rounded-full bg-blue-100 text-blue-600">
                                    {users.filter(u => u.role === 'COUNSELOR').length}
                                </span>
                            )}
                        </button>
                    </nav>
                </div>

                <div className="p-6">
                    <h2 className="text-lg font-semibold text-gray-800 mb-4">
                        {activeTab === 'ALL' ? 'All Users' : activeTab === 'STUDENT' ? 'Students' : 'Counselors'}
                    </h2>
                </div>

                {loading ? (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Email / NIM</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {[1, 2, 3, 4, 5].map((i) => (
                                    <tr key={i} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Skeleton width={150} height={20} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton width={200} height={20} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton width={80} height={24} className="rounded-full" />
                                        </td>
                                        <td className="px-6 py-4">
                                            <Skeleton width={80} height={24} className="rounded-full" />
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                <Skeleton width={24} height={24} />
                                                <Skeleton width={24} height={24} />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No users found.</div>
                ) : filteredUsers.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No {activeTab === 'STUDENT' ? 'students' : 'counselors'} found.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">Name</th>
                                    <th className="px-6 py-4 font-medium">Email / NIM</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredUsers.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.full_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.email || user.nim}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'ADMIN' ? 'bg-purple-100 text-purple-800' :
                                                user.role === 'COUNSELOR' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-green-100 text-green-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.status === 'ACTIVE' ? 'bg-green-100 text-green-800' :
                                                user.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                                    'bg-red-100 text-red-800'
                                                }`}>
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {user.status === 'PENDING' && (
                                                    <>
                                                        <button
                                                            onClick={() => handleVerify(user.id, 'APPROVE')}
                                                            className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50"
                                                            title="Approve"
                                                        >
                                                            <Check className="h-5 w-5" />
                                                        </button>
                                                        <button
                                                            onClick={() => handleVerify(user.id, 'REJECT')}
                                                            className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50"
                                                            title="Reject"
                                                        >
                                                            <X className="h-5 w-5" />
                                                        </button>
                                                    </>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(user)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                <button
                                                    onClick={() => setDeleteId(user.id)}
                                                    disabled={deleting}
                                                    className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                                    title="Delete"
                                                >
                                                    <Trash2 className="h-5 w-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )
                }
            </div>
        </div>
    );
};

export default AdminUsersPage;
