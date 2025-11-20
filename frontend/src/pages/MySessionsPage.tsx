import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Calendar, MessageCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

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

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = async () => {
        try {
            const endpoint = user?.role === 'COUNSELOR' ? '/counselors/my-activity' : '/sessions/my';
            const res = await api.get(endpoint);
            setSessions(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'APPROVED': return 'bg-green-100 text-green-800';
            case 'PENDING': return 'bg-yellow-100 text-yellow-800';
            case 'REJECTED': return 'bg-red-100 text-red-800';
            case 'COMPLETED': return 'bg-blue-100 text-blue-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold text-gray-800">My Sessions</h2>

            <div className="grid gap-4">
                {sessions.map((session) => (
                    <div key={session.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                        <div className="flex justify-between items-start">
                            <div>
                                <div className="flex alignItems-center mb-2">
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

                            {session.status === 'APPROVED' && (
                                <Link
                                    to={`/chat/${session.id}`}
                                    className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                >
                                    <MessageCircle className="h-4 w-4 mr-2" />
                                    Chat
                                </Link>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MySessionsPage;
