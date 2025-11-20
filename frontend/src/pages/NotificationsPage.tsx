import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Bell, Check, CheckCheck } from 'lucide-react';

interface Notification {
    id: number;
    message: string;
    is_read: boolean;
    created_at: string;
}

const NotificationsPage = () => {
    const [notifications, setNotifications] = useState<Notification[]>([]);

    useEffect(() => {
        fetchNotifications();
    }, []);

    const fetchNotifications = async () => {
        try {
            const res = await api.get('/notifications');
            setNotifications(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAsRead = async (id: number) => {
        try {
            await api.put(`/notifications/${id}/read`);
            setNotifications(prev => prev.map(n => n.id === id ? { ...n, is_read: true } : n));
        } catch (err) {
            console.error(err);
        }
    };

    const handleMarkAllAsRead = async () => {
        try {
            await api.put('/notifications/read-all');
            setNotifications(prev => prev.map(n => ({ ...n, is_read: true })));
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <div className="flex items-center justify-between mb-8">
                <h1 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Bell className="h-6 w-6 mr-2 text-green-600" />
                    Notifications
                </h1>
                {notifications.some(n => !n.is_read) && (
                    <button
                        onClick={handleMarkAllAsRead}
                        className="text-sm text-green-600 hover:text-green-700 font-medium flex items-center"
                    >
                        <CheckCheck className="h-4 w-4 mr-1" />
                        Mark all as read
                    </button>
                )}
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
                            className={`p-4 flex items-start justify-between transition-colors ${notification.is_read ? 'bg-white' : 'bg-green-50'
                                }`}
                        >
                            <div>
                                <p className={`text-gray-800 ${!notification.is_read && 'font-semibold'}`}>
                                    {notification.message}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    {new Date(notification.created_at).toLocaleString()}
                                </p>
                            </div>
                            {!notification.is_read && (
                                <button
                                    onClick={() => handleMarkAsRead(notification.id)}
                                    className="text-gray-400 hover:text-green-600 p-1"
                                    title="Mark as read"
                                >
                                    <Check className="h-4 w-4" />
                                </button>
                            )}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default NotificationsPage;
