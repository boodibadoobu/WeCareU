import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCheck, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';

interface Notification {
    id: number;
    type: string;
    title: string;
    body: string;
    is_read: boolean;
    created_at: string;
}

const NotificationsPage = () => {
    const { user } = useAuth();
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            setError(null);
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load notifications');
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            setError(null);
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark as read');
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            setError(null);
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to mark all as read');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/notifications/${deleteId}`);
            setNotifications(notifications.filter(n => n.id !== deleteId));
            setDeleteId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete notification');
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    const getTypeColor = (type: string) => {
        switch (type) {
            case 'SESSION': return 'bg-blue-100 text-blue-800';
            case 'STRESS_RESULT': return 'bg-yellow-100 text-yellow-800';
            case 'SYSTEM': return 'bg-purple-100 text-purple-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete Notification"
                message="Are you sure you want to delete this notification?"
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteId(null)}
            />

            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Bell className="h-6 w-6 mr-2 text-green-600" />
                    Notifications
                </h1>
                <div className="flex gap-3">
                    {notifications.some(n => !n.is_read) && (
                        <button
                            onClick={handleMarkAllAsRead}
                            className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                        >
                            <CheckCheck className="h-4 w-4 mr-1" />
                            Mark all as read
                        </button>
                    )}
                    {user?.role === 'ADMIN' && (
                        <Link
                            to="/admin/notifications/create"
                            className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                        >
                            <Plus className="h-4 w-4 mr-2" />
                            Create
                        </Link>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 divide-y divide-gray-100">
                {notifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notifications yet.
                    </div>
                ) : (
                    notifications.map((notification) => (
                        <div
                            key={notification.id}
                            className={`p-4 flex items-start justify-between transition-colors group ${notification.is_read ? 'bg-white' : 'bg-green-50'
                                }`}
                        >
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={`px-2 py-0.5 rounded text-xs font-medium ${getTypeColor(notification.type)}`}>
                                        {notification.type}
                                    </span>
                                    {!notification.is_read && (
                                        <span className="h-2 w-2 bg-green-600 rounded-full"></span>
                                    )}
                                </div>
                                <h3 className={`font-semibold text-gray-800 mb-1 ${!notification.is_read && 'font-bold'}`}>
                                    {notification.title}
                                </h3>
                                <p className="text-gray-600 text-sm mb-2">{notification.body}</p>
                                <p className="text-xs text-gray-500">
                                    {new Date(notification.created_at).toLocaleString()}
                                </p>
                            </div>
                            <div className="flex items-center gap-2 ml-4">
                                {!notification.is_read && (
                                    <button
                                        onClick={() => handleMarkAsRead(notification.id)}
                                        className="text-gray-400 hover:text-green-600 p-1 transition-colors"
                                        title="Mark as read"
                                    >
                                        <Check className="h-4 w-4" />
                                    </button>
                                )}
                                <button
                                    onClick={() => setDeleteId(notification.id)}
                                    disabled={deleting}
                                    className="text-gray-400 hover:text-red-600 p-1 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
