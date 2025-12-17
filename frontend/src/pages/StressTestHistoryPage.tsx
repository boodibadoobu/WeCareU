import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Calendar, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

interface StressTestResult {
    id: number;
    taken_at: string;
    total_score: number;
    category: string;
    scale_name: string;
}

const StressTestHistoryPage = () => {
    const [results, setResults] = useState<StressTestResult[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/stress-test/my-results');
            // Backend returns { message, data, count } structure
            setResults(res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load test history');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'NORMAL': return 'bg-green-100 text-green-800';
            case 'RINGAN': return 'bg-yellow-100 text-yellow-800';
            case 'SEDANG': return 'bg-orange-100 text-orange-800';
            case 'BERAT': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const canEdit = (takenAt: string) => {
        const testDate = new Date(takenAt);
        const now = new Date();
        const hoursDiff = (now.getTime() - testDate.getTime()) / (1000 * 60 * 60);
        return hoursDiff < 24; // Can edit within 24 hours
    };

    const handleDelete = async (id: number) => {
        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/stress-test/my-results/${id}`);
            setSuccessMessage('Stress test deleted successfully!');
            setDeleteId(null);
            // Refresh the list
            fetchHistory();
            // Auto-hide success message after 3 seconds
            setTimeout(() => setSuccessMessage(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete stress test');
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-4xl mx-auto mt-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">Loading your stress test history...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            {/* Success Message */}
            {successMessage && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 text-green-800 rounded-lg flex items-center justify-between">
                    <span className="font-medium">{successMessage}</span>
                    <button
                        onClick={() => setSuccessMessage(null)}
                        className="text-green-600 hover:text-green-800"
                    >
                        ✕
                    </button>
                </div>
            )}

            <div className="flex items-center justify-between mb-8">
                <div className="flex items-center">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <TrendingUp className="h-8 w-8 text-green-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Stress Test History</h1>
                        <p className="text-gray-500">Track your mental health progress over time</p>
                    </div>
                </div>
                <button
                    onClick={() => navigate('/stress-test')}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Take New Test
                </button>
            </div>

            {results.length === 0 ? (
                <div className="bg-white p-12 rounded-xl shadow-sm border border-gray-100 text-center">
                    <ClipboardList className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No test results yet</h3>
                    <p className="text-gray-400 mt-2 mb-6">Take your first stress test to start tracking your mental health</p>
                    <button
                        onClick={() => navigate('/stress-test')}
                        className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Take Stress Test
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    {results.map((result) => (
                        <div key={result.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center flex-1">
                                    <div className="text-4xl mr-4">
                                        {getCategoryIcon(result.category)}
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getCategoryColor(result.category)}`}>
                                                {result.category}
                                            </span>
                                            <span className="text-gray-600">Score: <span className="font-bold">{result.total_score}</span></span>
                                        </div>
                                        <div className="flex items-center text-sm text-gray-500">
                                            <Calendar className="h-4 w-4 mr-2" />
                                            {new Date(result.taken_at).toLocaleString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex gap-2">
                                    {canEdit(result.taken_at) && (
                                        <button
                                            onClick={() => navigate(`/stress-test/edit/${result.id}`)}
                                            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-lg hover:bg-blue-100 transition-colors"
                                            title="Edit (available for 24 hours)"
                                        >
                                            <Edit className="h-4 w-4 mr-2" />
                                            Edit
                                        </button>
                                    )}
                                    <button
                                        onClick={() => navigate(`/stress-test/result/${result.id}`)}
                                        className="flex items-center px-4 py-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 mr-2" />
                                        View Details
                                    </button>
                                    <button
                                        onClick={() => setDeleteId(result.id)}
                                        className="flex items-center px-4 py-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors"
                                        title="Delete this test"
                                    >
                                        <Trash2 className="h-4 w-4 mr-2" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Delete Confirmation Dialog */}
            {deleteId !== null && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">
                        <div className="flex items-center mb-4">
                            <div className="bg-red-100 p-3 rounded-full mr-4">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <h3 className="text-xl font-bold text-gray-800">Delete Stress Test</h3>
                        </div>
                        <p className="text-gray-600 mb-6">
                            Are you sure you want to delete this stress test result? This action cannot be undone.
                        </p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeleteId(null)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-50"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={() => handleDelete(deleteId)}
                                disabled={deleting}
                                className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50"
                            >
                                {deleting ? 'Deleting...' : 'Delete'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default StressTestHistoryPage;
