import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCheck, Trash2, Plus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

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
    const [displayedNotifications, setDisplayedNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [showDeleteAllConfirm, setShowDeleteAllConfirm] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(7);

    useEffect(() => {
        fetchNotifications();
    }, []);

    useEffect(() => {
        // Update displayed notifications when limit changes
        setDisplayedNotifications(notifications.slice(0, limit));
    }, [notifications, limit]);

    const fetchNotifications = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/notifications');
            setNotifications(res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load notifications');
        } finally {
            setLoading(false);
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

    const handleDeleteAllRead = async () => {
        try {
            setDeleting(true);
            setError(null);
            await api.delete('/notifications/read/clear-all');
            setNotifications(notifications.filter(n => !n.is_read));
            setShowDeleteAllConfirm(false);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete notifications');
            setShowDeleteAllConfirm(false);
        } finally {
            setDeleting(false);
        }
    };

    const handleLoadMore = () => {
        setLimit(prev => prev + 7);
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

            <ConfirmDialog
                isOpen={showDeleteAllConfirm}
                title="Clear Read Notifications"
                message="Are you sure you want to delete all read notifications? This action cannot be undone."
                confirmText="Delete All"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteAllRead}
                onCancel={() => setShowDeleteAllConfirm(false)}
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
                    {notifications.some(n => n.is_read) && (
                        <button
                            onClick={() => setShowDeleteAllConfirm(true)}
                            className="text-sm text-red-600 hover:text-red-700 font-medium flex items-center"
                        >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete all read
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
                {loading ? (
                    <div className="p-4 space-y-4">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Skeleton width={80} height={20} className="rounded" />
                                        <Skeleton variant="circular" width={8} height={8} />
                                    </div>
                                    <Skeleton width={200} height={20} className="mb-1" />
                                    <Skeleton width="90%" height={16} className="mb-2" />
                                    <Skeleton width={120} height={12} />
                                </div>
                                <div className="flex gap-2 ml-4">
                                    <Skeleton width={24} height={24} />
                                    <Skeleton width={24} height={24} />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : displayedNotifications.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No notifications yet.
                    </div>
                ) : (
                    <>
                        {displayedNotifications.map((notification) => (
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
                                    {notification.is_read && (
                                        <button
                                            onClick={() => setDeleteId(notification.id)}
                                            disabled={deleting}
                                            className="text-gray-400 hover:text-red-600 p-1 transition-colors disabled:opacity-50 opacity-0 group-hover:opacity-100"
                                            title="Delete"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                        {limit < notifications.length && (
                            <div className="p-4 text-center">
                                <button
                                    onClick={handleLoadMore}
                                    className="px-6 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                                >
                                    Load More ({notifications.length - limit} more)
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
