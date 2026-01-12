import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageCircle, X, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

interface Session {
    id: number;
    scheduled_start: string;
    scheduled_end: string;
    status: string;
    reschedule_count: number;
    counselor?: { full_name: string };
    student?: { full_name: string };
}

const MySessionsPage = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [displayedSessions, setDisplayedSessions] = useState<Session[]>([]);
    const [loading, setLoading] = useState(true);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [limit, setLimit] = useState(7);

    // Reschedule state
    const [rescheduleSession, setRescheduleSession] = useState<Session | null>(null);
    const [newDate, setNewDate] = useState('');
    const [newTime, setNewTime] = useState('');
    const [rescheduling, setRescheduling] = useState(false);

    useEffect(() => {
        fetchSessions();
    }, []);

    useEffect(() => {
        // Update displayed sessions when limit changes
        setDisplayedSessions(sessions.slice(0, limit));
    }, [sessions, limit]);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            setError(null);
            const endpoint = user?.role === 'COUNSELOR' ? '/counselors/my-activity' : '/sessions/my';
            const res = await api.get(endpoint);
            setSessions(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load sessions');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelClick = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setCancelId(id);
    };

    const handleCancelConfirm = async () => {
        if (!cancelId) return;

        try {
            setCancelling(true);
            setError(null);
            // Update session status to CANCELLED
            await api.put(`/sessions/${cancelId}`, { status: 'CANCELLED' });
            // Refresh the sessions list
            fetchSessions();
            setCancelId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to cancel session');
            setCancelId(null);
        } finally {
            setCancelling(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            case 'CANCELLED': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const canCancelSession = (session: Session) => {
        return session.status === 'PENDING' || session.status === 'APPROVED';
    };

    const canReschedule = (session: Session) => {
        // Only PENDING sessions can be rescheduled
        if (session.status !== 'PENDING') return false;

        // Already rescheduled once
        if (session.reschedule_count >= 1) return false;

        // Check if more than 24h before session
        const sessionStart = new Date(session.scheduled_start);
        const now = new Date();
        const hoursUntilSession = (sessionStart.getTime() - now.getTime()) / (1000 * 60 * 60);

        return hoursUntilSession >= 24;
    };

    const handleRescheduleClick = (session: Session) => {
        setRescheduleSession(session);
        // Pre-fill with current date/time
        const current = new Date(session.scheduled_start);
        setNewDate(current.toISOString().split('T')[0]);
        setNewTime(current.toTimeString().slice(0, 5));
    };

    const handleRescheduleConfirm = async () => {
        if (!rescheduleSession || !newDate || !newTime) return;

        try {
            setRescheduling(true);
            setError(null);

            const newStart = new Date(`${newDate}T${newTime}`);
            await api.put(`/sessions/${rescheduleSession.id}/reschedule`, {
                new_start: newStart.toISOString()
            });

            // Success - close modal and refresh
            setRescheduleSession(null);
            setNewDate('');
            setNewTime('');
            fetchSessions();
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to reschedule session');
        } finally {
            setRescheduling(false);
        }
    };

    const handleLoadMore = () => {
        setLimit(prev => prev + 7);
    };

    return (
        <div className="space-y-6">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <ConfirmDialog
                isOpen={cancelId !== null}
                title="Cancel Session"
                message="Are you sure you want to cancel this session? The other party will be notified."
                confirmText="Cancel Session"
                cancelText="Keep Session"
                type="warning"
                onConfirm={handleCancelConfirm}
                onCancel={() => setCancelId(null)}
            />

            <h2 className="text-2xl font-bold text-gray-800">My Sessions</h2>

            <div className="grid gap-4">
                {loading ? (
                    <>
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <Skeleton width={80} height={24} className="mb-2 rounded-full" />
                                        <Skeleton width={200} height={24} className="mb-2" />
                                        <div className="flex items-center">
                                            <Skeleton width={16} height={16} className="mr-2" />
                                            <Skeleton width={150} height={20} />
                                        </div>
                                    </div>
                                    <div className="flex gap-2">
                                        <Skeleton width={80} height={36} className="rounded-lg" />
                                        <Skeleton width={80} height={36} className="rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </>
                ) : (
                    <>
                        {
                            displayedSessions.map((session) => (
                                <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 relative group">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <div className="flex items-center mb-2">
                                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(session.status)}`}>
                                                    {session.status}
                                                </span>
                                            </div>
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                {user?.role === 'STUDENT' ? `With ${session.counselor?.full_name}` : `With ${session.student?.full_name}`}
                                            </h3>
                                            <div className="flex items-center mt-2 text-gray-600">
                                                <Calendar className="h-4 w-4 mr-2" />
                                                {new Date(session.scheduled_start).toLocaleString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            {session.status === 'APPROVED' && (
                                                <Link
                                                    to={`/chat/${session.id}`}
                                                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                                >
                                                    <MessageCircle className="h-4 w-4 mr-2" />
                                                    Chat
                                                </Link>
                                            )}

                                            {user?.role === 'STUDENT' && canReschedule(session) && (
                                                <button
                                                    onClick={() => handleRescheduleClick(session)}
                                                    className="flex items-center px-4 py-2 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100 transition-colors"
                                                    title="Reschedule Session"
                                                >
                                                    <RefreshCw className="h-4 w-4 mr-2" />
                                                    Reschedule
                                                </button>
                                            )}

                                            {canCancelSession(session) && (
                                                <button
                                                    onClick={(e) => handleCancelClick(session.id, e)}
                                                    disabled={cancelling}
                                                    className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors disabled:opacity-50"
                                                    title="Cancel Session"
                                                >
                                                    <X className="h-4 w-4 mr-2" />
                                                    Cancel
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        }
                    </>
                )}

                {limit < sessions.length && (
                    <div className="text-center py-4">
                        <button
                            onClick={handleLoadMore}
                            className="px-6 py-2 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                        >
                            Load More ({sessions.length - limit} more)
                        </button>
                    </div>
                )}

                {displayedSessions.length === 0 && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No sessions found</h3>
                        <p className="text-gray-400 mt-2">
                            {user?.role === 'STUDENT' ? 'Book a consultation to get started' : 'Waiting for session bookings'}
                        </p>
                    </div>
                )}
            </div>

            {/* Reschedule Modal */}
            {rescheduleSession && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl p-6 w-full max-w-md">
                        <h3 className="text-xl font-bold mb-4">Reschedule Session</h3>

                        <div className="mb-4 p-3 bg-gray-50 rounded-lg">
                            <p className="text-sm text-gray-600">Current session:</p>
                            <p className="font-medium">
                                {new Date(rescheduleSession.scheduled_start).toLocaleString()}
                            </p>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Date</label>
                                <input
                                    type="date"
                                    required
                                    value={newDate}
                                    onChange={(e) => setNewDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                    min={new Date().toISOString().split('T')[0]}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">New Time</label>
                                <input
                                    type="time"
                                    required
                                    value={newTime}
                                    onChange={(e) => setNewTime(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
                                ℹ️ You can only reschedule once per session, at least 24h before the original time.
                            </div>
                        </div>

                        <div className="flex space-x-3 mt-6">
                            <button
                                type="button"
                                onClick={() => {
                                    setRescheduleSession(null);
                                    setNewDate('');
                                    setNewTime('');
                                }}
                                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                                disabled={rescheduling}
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleRescheduleConfirm}
                                disabled={rescheduling || !newDate || !newTime}
                                className="flex-1 py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 disabled:opacity-50"
                            >
                                {rescheduling ? 'Rescheduling...' : 'Confirm Reschedule'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MySessionsPage;
