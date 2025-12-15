import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageCircle, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';

interface Session {
    id: number;
    scheduled_start: string;
    status: string;
    counselor?: { full_name: string };
    student?: { full_name: string };
}

const MySessionsPage = () => {
    const { user } = useAuth();
    const [sessions, setSessions] = useState<Session[]>([]);
    const [cancelId, setCancelId] = useState<number | null>(null);
    const [cancelling, setCancelling] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setError(null);
            const endpoint = user?.role === 'COUNSELOR' ? '/counselors/my-activity' : '/sessions/my';
            const res = await api.get(endpoint);
            setSessions(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load sessions');
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
                {sessions.map((session) => (
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
                ))}

                {sessions.length === 0 && (
                    <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                        <Calendar className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-600">No sessions found</h3>
                        <p className="text-gray-400 mt-2">
                            {user?.role === 'STUDENT' ? 'Book a consultation to get started' : 'Waiting for session bookings'}
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default MySessionsPage;
