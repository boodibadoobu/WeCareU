import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MessageSquare, Clock } from 'lucide-react';
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

const CounselorAnonChatsPage = () => {
    const [sessions, setSessions] = useState<AnonSession[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            setLoading(true);
            const res = await api.get('/anon-chat/counselor/sessions');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">Anonymous Chat Sessions</h2>

            {loading ? (
                <div className="grid gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3 w-full">
                                    <Skeleton variant="circular" width={48} height={48} className="flex-shrink-0" />
                                    <div className="flex-1">
                                        <Skeleton width={150} height={20} className="mb-2" />
                                        <Skeleton width={100} height={16} className="mb-2" />
                                        <Skeleton width="60%" height={16} />
                                    </div>
                                </div>
                                <Skeleton width={100} height={16} />
                            </div>
                        </div>
                    ))}
                </div>
            ) : sessions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No anonymous chat sessions yet.
                </div>
            ) : (
                <div className="grid gap-4">
                    {sessions.map((session) => (
                        <div
                            key={session.id}
                            onClick={() => navigate(`/anon-chat/${session.id}`)}
                            className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow cursor-pointer"
                        >
                            <div className="flex items-start justify-between">
                                <div className="flex items-center space-x-3">
                                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center">
                                        <MessageSquare className="h-6 w-6 text-purple-600" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg text-gray-900">
                                            Anonymous Student
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
                                <div className="flex items-center text-sm text-gray-500">
                                    <Clock className="h-4 w-4 mr-1" />
                                    {new Date(session.created_at).toLocaleString()}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default CounselorAnonChatsPage;
