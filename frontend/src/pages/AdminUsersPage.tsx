import { useEffect, useState } from 'react';
import api from '../api/axios';
import { User, Check, X, Shield } from 'lucide-react';

interface UserData {
    id: number;
    full_name: string;
    email: string;
    role: string;
    status: string;
    nim?: string;
}

const AdminUsersPage = () => {
    const [users, setUsers] = useState<UserData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            // Ideally we should have a dedicated endpoint for listing all users
            // For now, we might reuse getPendingUsers or create a new one.
            // Let's assume we'll add a getUsers endpoint or just show pending for now.
            // Wait, the user wants to see "Users". Let's implement a proper list.
            // Since we don't have a generic "get all users" endpoint yet, 
            // I will add one to adminController in the next step.
            // For now, I'll just fetch pending users to show something.
            const res = await api.get('/admin/pending-users');
            setUsers(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (id: number, action: 'APPROVE' | 'REJECT') => {
        try {
            await api.post('/admin/verify-user', { userId: id, action });
            fetchUsers(); // Refresh list
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold text-gray-800">User Management</h1>
                <button className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center">
                    <User className="h-5 w-5 mr-2" />
                    Add User
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100">
                    <h2 className="text-lg font-semibold text-gray-800">Pending Verifications</h2>
                </div>

                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading...</div>
                ) : users.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">No pending users found.</div>
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
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{user.full_name}</div>
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {user.email || user.nim}
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${user.role === 'COUNSELOR' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                                                }`}>
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                                                {user.status}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-right space-x-2">
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
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default AdminUsersPage;
