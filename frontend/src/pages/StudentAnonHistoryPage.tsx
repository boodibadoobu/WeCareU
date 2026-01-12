import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MessageSquare, Clock, Shield } from 'lucide-react';
import Skeleton from '../components/Skeleton';

interface AnonSession {
    id: number;
    anon_token: string;
    status: string;
    created_at: string;
    messages: Array<{
        message_text: string;
        sent_at: string;
    }>;
}

const StudentAnonHistoryPage = () => {
    const [sessions, setSessions] = useState<AnonSession[]>([]);
    const [displayedSessions, setDisplayedSessions] = useState<AnonSession[]>([]);
    const [loading, setLoading] = useState(true);
    const [limit, setLimit] = useState(7);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    useEffect(() => {
        // Update displayed sessions when limit changes
        setDisplayedSessions(sessions.slice(0, limit));
    }, [sessions, limit]);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            const res = await api.get('/anon-chat/student/history');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        setLimit(prev => prev + 7);
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-gray-600" />
                    My Anonymous Chat History
                </h2>
            </div>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 w-full">
                                    <Skeleton variant="circular" width={48} height={48} />
                                    <div className="flex-1">
                                        <Skeleton width={200} height={20} className="mb-2" />
                                        <Skeleton width={150} height={16} className="mb-2" />
                                        <Skeleton width="80%" height={16} />
                                    </div>
                                </div>
                                <div className="flex flex-col items-end">
                                    <Skeleton width={80} height={16} className="mb-2" />
                                    <Skeleton width={60} height={24} className="rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : displayedSessions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No anonymous chat sessions yet. Start a new anonymous chat to get support privately.
                </div>
            ) : (
                <>
                    <div className="grid gap-4">
                        {displayedSessions.map((session) => (
                            <div
                                key={session.id}
                                onClick={() => navigate(`/anon-chat/${session.id}`)}
                                className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center space-x-3">
                                        <div className="h-12 w-12 bg-gray-100 rounded-full flex items-center justify-center">
                                            <MessageSquare className="h-6 w-6 text-gray-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-lg text-gray-900">
                                                Anonymous Session
                                            </h3>
                                            <p className="text-sm text-gray-500">
                                                Session ID: {session.anon_token.slice(0, 8)}...
                                            </p>
                                            {session.messages.length > 0 && (
                                                <p className="text-sm text-gray-600 mt-1 line-clamp-1">
                                                    Last message: {session.messages[0].message_text}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <div className="flex items-center text-sm text-gray-500 mb-2">
                                            <Clock className="h-4 w-4 mr-1" />
                                            {new Date(session.created_at).toLocaleDateString()}
                                        </div>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${session.status === 'OPEN'
                                            ? 'bg-green-100 text-green-700'
                                            : 'bg-gray-100 text-gray-700'
                                            }`}>
                                            {session.status}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {limit < sessions.length && (
                        <div className="text-center mt-6">
                            <button
                                onClick={handleLoadMore}
                                className="px-6 py-3 text-sm bg-green-50 text-green-600 rounded-lg hover:bg-green-100 transition-colors font-medium"
                            >
                                Load More ({sessions.length - limit} more sessions)
                            </button>
                        </div>
                    )}
                </>
            )}
        </div>
    );
};

export default StudentAnonHistoryPage;
