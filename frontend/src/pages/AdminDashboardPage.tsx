import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Users, UserCheck, Calendar, Activity } from 'lucide-react';

interface DashboardStats {
    totalStudents: number;
    totalCounselors: number;
    pendingVerifications: number;
    totalSessions: number;
    completedSessions: number;
}

const AdminDashboardPage = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const res = await api.get('/admin/stats');
            setStats(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    if (!stats) return <div className="p-8">Loading stats...</div>;

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                <StatCard
                    title="Total Students"
                    value={stats.totalStudents}
                    icon={<Users className="h-8 w-8 text-blue-500" />}
                    color="bg-blue-50"
                />
                <StatCard
                    title="Total Counselors"
                    value={stats.totalCounselors}
                    icon={<UserCheck className="h-8 w-8 text-purple-500" />}
                    color="bg-purple-50"
                />
                <StatCard
                    title="Pending Verifications"
                    value={stats.pendingVerifications}
                    icon={<Activity className="h-8 w-8 text-orange-500" />}
                    color="bg-orange-50"
                />
                <StatCard
                    title="Total Sessions"
                    value={stats.totalSessions}
                    icon={<Calendar className="h-8 w-8 text-green-500" />}
                    color="bg-green-50"
                />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Quick Actions</h2>
                    <div className="space-y-4">
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="font-medium text-gray-700">Verify Pending Users</span>
                            <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded-full text-xs font-bold">
                                {stats.pendingVerifications} Pending
                            </span>
                        </button>
                        <button className="w-full flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                            <span className="font-medium text-gray-700">Manage Articles</span>
                            <span className="text-gray-400 text-sm">Go to Articles</span>
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">System Health</h2>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Database Connected</span>
                    </div>
                    <div className="flex items-center space-x-4 mb-4">
                        <div className="h-3 w-3 bg-green-500 rounded-full"></div>
                        <span className="text-gray-600">Socket.IO Server Running</span>
                    </div>
                    <div className="mt-6 pt-6 border-t border-gray-100">
                        <p className="text-sm text-gray-500">Completed Sessions: <span className="font-semibold text-gray-800">{stats.completedSessions}</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: number; icon: React.ReactNode; color: string }) => (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex items-center space-x-4">
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
        <div>
            <p className="text-sm text-gray-500">{title}</p>
            <p className="text-2xl font-bold text-gray-800">{value}</p>
        </div>
    </div>
);

export default AdminDashboardPage;
