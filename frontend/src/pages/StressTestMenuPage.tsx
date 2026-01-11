import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, History, Edit, Trash2, TrendingUp, Award } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

interface StressTestStats {
    totalTests: number;
    latestTest?: {
        id: number;
        category: string;
        total_score: number;
        taken_at: string;
    };
}

const StressTestMenuPage = () => {
    const navigate = useNavigate();
    const [stats, setStats] = useState<StressTestStats>({ totalTests: 0 });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            setLoading(true);
            const res = await api.get('/stress-test/my-results');
            // Backend returns { message, data, count } structure
            const results = res.data.data || [];

            setStats({
                totalTests: results.length,
                latestTest: results.length > 0 ? results[0] : undefined
            });
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load statistics');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'NORMAL': return 'bg-green-100 text-green-800 border-green-300';
            case 'RINGAN': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'SEDANG': return 'bg-orange-100 text-orange-800 border-orange-300';
            case 'BERAT': return 'bg-red-100 text-red-800 border-red-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    const getCategoryIcon = (category: string) => {
        switch (category) {
            case 'NORMAL': return '😊';
            case 'RINGAN': return '😐';
            case 'SEDANG': return '😟';
            case 'BERAT': return '😰';
            default: return '📊';
        }
    };

    const menuCards = [
        {
            title: 'Start New Test',
            description: 'Take a new stress assessment to track your mental health',
            icon: ClipboardList,
            color: 'from-green-500 to-green-600',
            hoverColor: 'hover:from-green-600 hover:to-green-700',
            iconBg: 'bg-green-100',
            iconColor: 'text-green-600',
            action: () => navigate('/stress-test/new'),
            badge: 'Recommended'
        },
        {
            title: 'View History',
            description: 'See all your past stress test results and progress',
            icon: History,
            color: 'from-blue-500 to-blue-600',
            hoverColor: 'hover:from-blue-600 hover:to-blue-700',
            iconBg: 'bg-blue-100',
            iconColor: 'text-blue-600',
            action: () => navigate('/stress-test/history'),
            badge: stats.totalTests > 0 ? `${stats.totalTests} Tests` : undefined
        },
        {
            title: 'Update Test',
            description: 'Edit your recent test results (within 24 hours)',
            icon: Edit,
            color: 'from-purple-500 to-purple-600',
            hoverColor: 'hover:from-purple-600 hover:to-purple-700',
            iconBg: 'bg-purple-100',
            iconColor: 'text-purple-600',
            action: () => navigate('/stress-test/history'),
            badge: undefined
        },
        {
            title: 'Delete History',
            description: 'Remove individual stress test records from your history',
            icon: Trash2,
            color: 'from-red-500 to-red-600',
            hoverColor: 'hover:from-red-600 hover:to-red-700',
            iconBg: 'bg-red-100',
            iconColor: 'text-red-600',
            action: () => navigate('/stress-test/history'),
            badge: undefined
        }
    ];

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12 px-4">
            <ErrorAlert message={error} onClose={() => setError(null)} />

            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center mb-4">
                    <div className="bg-gradient-to-br from-green-500 to-green-600 p-3 rounded-xl mr-4 shadow-lg">
                        <TrendingUp className="h-8 w-8 text-white" />
                    </div>
                    <div>
                        <h1 className="text-4xl font-bold text-gray-800">Stress Test Center</h1>
                        <p className="text-gray-500 mt-1">Manage your mental health assessments</p>
                    </div>
                </div>
            </div>

            {/* Statistics Card */}
            {loading ? (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm border border-indigo-100 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <Skeleton width={48} height={48} variant="circular" className="mr-4 bg-white/50" />
                            <div>
                                <Skeleton width={150} height={24} className="mb-2 bg-white/50" />
                                <div className="flex gap-2">
                                    <Skeleton width={80} height={24} className="rounded-full bg-white/50" />
                                    <Skeleton width={100} height={24} className="bg-white/50" />
                                </div>
                                <Skeleton width={120} height={16} className="mt-2 bg-white/50" />
                            </div>
                        </div>
                        <div className="text-right">
                            <Skeleton width={120} height={20} className="mb-1 ml-auto bg-white/50" />
                            <Skeleton width={40} height={36} className="ml-auto bg-white/50" />
                        </div>
                    </div>
                </div>
            ) : stats.latestTest && (
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 p-6 rounded-xl shadow-sm border border-indigo-100 mb-8">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center">
                            <div className="text-5xl mr-4">
                                {getCategoryIcon(stats.latestTest.category)}
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Latest Test Result</h3>
                                <div className="flex items-center gap-3 mt-2">
                                    <span className={`px-3 py-1 rounded-full text-sm font-semibold border ${getCategoryColor(stats.latestTest.category)}`}>
                                        {stats.latestTest.category}
                                    </span>
                                    <span className="text-gray-600">Score: <span className="font-bold">{stats.latestTest.total_score}</span></span>
                                </div>
                                <p className="text-sm text-gray-500 mt-1">
                                    {new Date(stats.latestTest.taken_at).toLocaleDateString('en-US', {
                                        year: 'numeric',
                                        month: 'long',
                                        day: 'numeric'
                                    })}
                                </p>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="flex items-center text-gray-600">
                                <Award className="h-5 w-5 mr-2 text-indigo-600" />
                                <span className="text-sm font-medium">Total Tests Taken</span>
                            </div>
                            <p className="text-3xl font-bold text-indigo-600 mt-1">{stats.totalTests}</p>
                        </div>
                    </div>
                </div>
            )}

            {/* Menu Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {menuCards.map((card, index) => {
                    const Icon = card.icon;
                    return (
                        <button
                            key={index}
                            onClick={card.action}
                            className="group relative bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100"
                        >
                            {/* Gradient Background on Hover */}
                            <div className={`absolute inset-0 bg-gradient-to-br ${card.color} opacity-0 group-hover:opacity-5 transition-opacity duration-300`}></div>

                            <div className="relative p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className={`${card.iconBg} p-3 rounded-lg group-hover:scale-110 transition-transform duration-300`}>
                                        <Icon className={`h-8 w-8 ${card.iconColor}`} />
                                    </div>
                                    {card.badge && (
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold bg-gradient-to-r ${card.color} text-white`}>
                                            {card.badge}
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-gray-900 transition-all duration-300">
                                    {card.title}
                                </h3>
                                <p className="text-gray-600 text-sm leading-relaxed">
                                    {card.description}
                                </p>

                                {/* Arrow Indicator */}
                                <div className="mt-4 flex items-center text-sm font-medium text-gray-400 group-hover:text-gray-600 transition-colors">
                                    <span>Go to {card.title}</span>
                                    <svg className="ml-2 h-4 w-4 transform group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                    </svg>
                                </div>
                            </div>
                        </button>
                    );
                })}
            </div>

            {/* Empty State */}
            {!loading && stats.totalTests === 0 && (
                <div className="mt-8 bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4">
                        <ClipboardList className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold text-gray-800 mb-2">Welcome to Stress Test Center!</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                        You haven't taken any stress tests yet. Start your first assessment to track your mental health journey.
                    </p>
                    <button
                        onClick={() => navigate('/stress-test/new')}
                        className="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-lg font-semibold hover:from-green-600 hover:to-green-700 transition-all shadow-lg shadow-green-200"
                    >
                        Take Your First Test
                    </button>
                </div>
            )}
        </div>
    );
};

export default StressTestMenuPage;
