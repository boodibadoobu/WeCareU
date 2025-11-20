import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { MessageSquare, Clock, Shield } from 'lucide-react';

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
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await api.get('/anon-chat/student/history');
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                    <Shield className="h-6 w-6 mr-2 text-gray-600" />
                    My Anonymous Chat History
                </h2>
            </div>

            {sessions.length === 0 ? (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    No anonymous chat sessions yet. Start a new anonymous chat to get support privately.
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
            )}
        </div>
    );
};

export default StudentAnonHistoryPage;
