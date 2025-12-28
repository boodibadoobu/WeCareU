import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Check, X, Calendar, Users, Clock, CheckCircle, AlertCircle, BookOpen } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

interface SessionRequest {
    id: number;
    student: {
        full_name: string;
        nim: string;
    };
    scheduled_start: string;
    status: string;
}

interface DashboardStats {
    totalStudentsHelped: number;
    pendingRequests: number;
    approvedSessions: number;
    completedSessions: number;
    articlesCreated: number;
}

const CounselorDashboard = () => {
    const { user } = useAuth();
    const [requests, setRequests] = useState<SessionRequest[]>([]);
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
        fetchRequests();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/counselors/stats');
            setStats(res.data);
        } catch (err) {
            console.error('Failed to fetch stats', err);
        }
    };

    const fetchRequests = async () => {
        try {
            setLoading(true);
            const res = await api.get('/counselors/requests');
            setRequests(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleAction = async (id: number, action: 'approve' | 'reject') => {
        try {
            await api.post(`/counselors/requests/${id}/${action}`);
            fetchRequests();
            fetchStats(); // Refresh stats after action
        } catch (err) {
            console.error(err);
            alert('Action failed');
        }
    };

    return (
        <div className="space-y-8">
            {/* Welcome Section */}
            <div className="bg-gradient-to-r from-green-50 to-blue-50 p-8 rounded-xl border border-green-100">
                <h1 className="text-3xl font-bold text-gray-800 mb-2">
                    Hello, {user?.name || 'Counselor'}! 👋
                </h1>
                <p className="text-gray-600">
                    Welcome to your dashboard. Here's a summary of your counseling activities and student support impact.
                </p>
            </div>

            {/* Stats Section */}
            {stats && (
                <div>
                    <h2 className="text-xl font-bold text-gray-800 mb-4">Your Impact Summary</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                        <StatCard
                            title="Students Helped"
                            value={stats.totalStudentsHelped}
                            icon={<Users className="h-6 w-6 text-blue-600" />}
                            color="bg-blue-50"
                            description="Unique students"
                        />
                        <StatCard
                            title="Articles Created"
                            value={stats.articlesCreated}
                            icon={<BookOpen className="h-6 w-6 text-purple-600" />}
                            color="bg-purple-50"
                            description="Published articles"
                        />
                        <StatCard
                            title="Pending Requests"
                            value={stats.pendingRequests}
                            icon={<Clock className="h-6 w-6 text-yellow-600" />}
                            color="bg-yellow-50"
                            description="Awaiting response"
                        />
                        <StatCard
                            title="Approved Sessions"
                            value={stats.approvedSessions}
                            icon={<CheckCircle className="h-6 w-6 text-green-600" />}
                            color="bg-green-50"
                            description="Scheduled"
                        />
                        <StatCard
                            title="Completed Sessions"
                            value={stats.completedSessions}
                            icon={<AlertCircle className="h-6 w-6 text-indigo-600" />}
                            color="bg-indigo-50"
                            description="Finished"
                        />
                    </div>
                </div>
            )}

            {/* Session Requests Section */}
            <div>
                <h2 className="text-xl font-bold text-gray-800 mb-4">Pending Session Requests</h2>

                {loading ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <p className="text-gray-500">Loading requests...</p>
                    </div>
                ) : requests.length === 0 ? (
                    <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                        <CheckCircle className="h-12 w-12 text-gray-300 mx-auto mb-3" />
                        <p className="text-gray-500">No pending requests. You're all caught up!</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        {requests.map((req) => (
                            <div key={req.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center hover:shadow-md transition-shadow">
                                <div>
                                    <h3 className="font-semibold text-lg text-gray-900">{req.student.full_name}</h3>
                                    <p className="text-sm text-gray-500">NIM: {req.student.nim}</p>
                                    <div className="flex items-center mt-2 text-gray-600">
                                        <Calendar className="h-4 w-4 mr-2" />
                                        {new Date(req.scheduled_start).toLocaleString()}
                                    </div>
                                </div>

                                <div className="flex space-x-3 mt-4 sm:mt-0">
                                    <button
                                        onClick={() => handleAction(req.id, 'reject')}
                                        className="flex items-center px-4 py-2 border border-red-200 text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                                    >
                                        <X className="h-4 w-4 mr-2" />
                                        Reject
                                    </button>
                                    <button
                                        onClick={() => handleAction(req.id, 'approve')}
                                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                                    >
                                        <Check className="h-4 w-4 mr-2" />
                                        Approve
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

const StatCard = ({
    title,
    value,
    icon,
    color,
    description
}: {
    title: string;
    value: number;
    icon: React.ReactNode;
    color: string;
    description?: string;
}) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-3">
            <div className={`p-3 rounded-lg ${color}`}>
                {icon}
            </div>
        </div>
        <p className="text-sm text-gray-500 mb-1">{title}</p>
        <p className="text-3xl font-bold text-gray-800">{value}</p>
        {description && (
            <p className="text-xs text-gray-400 mt-1">{description}</p>
        )}
    </div>
);

export default CounselorDashboard;
