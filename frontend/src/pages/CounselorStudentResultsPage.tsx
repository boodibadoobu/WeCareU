import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Activity } from 'lucide-react';

interface StressResult {
    id: number;
    total_score: number;
    category: string;
    taken_at: string;
}

const CounselorStudentResultsPage = () => {
    const { studentId } = useParams();
    const navigate = useNavigate();
    const [results, setResults] = useState<StressResult[]>([]);

    useEffect(() => {
        fetchResults();
    }, [studentId]);

    const fetchResults = async () => {
        try {
            const res = await api.get(`/stress-test/student/${studentId}`);
            setResults(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <button
                onClick={() => navigate(-1)}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center">
                    <Activity className="h-6 w-6 mr-2 text-green-600" />
                    Student Stress Test History
                </h1>

                {results.length === 0 ? (
                    <p className="text-gray-500">No stress test history found for this student.</p>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="border-b border-gray-200">
                                    <th className="pb-3 font-semibold text-gray-600">Date Taken</th>
                                    <th className="pb-3 font-semibold text-gray-600">Score</th>
                                    <th className="pb-3 font-semibold text-gray-600">Category</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {results.map((result) => (
                                    <tr key={result.id} className="hover:bg-gray-50">
                                        <td className="py-4 text-gray-800">
                                            {new Date(result.taken_at).toLocaleDateString()} {new Date(result.taken_at).toLocaleTimeString()}
                                        </td>
                                        <td className="py-4 text-gray-800 font-medium">{result.total_score}</td>
                                        <td className="py-4">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${result.category === 'NORMAL' ? 'bg-green-100 text-green-700' :
                                                result.category === 'RINGAN' ? 'bg-yellow-100 text-yellow-700' :
                                                    result.category === 'SEDANG' ? 'bg-orange-100 text-orange-700' :
                                                        'bg-red-100 text-red-700'
                                                }`}>
                                                {result.category}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CounselorStudentResultsPage;
