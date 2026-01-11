import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

interface Answer {
    id: number;
    question_id: number;
    answer_value: number;
    question: {
        id: number;
        question_text: string;
        dimension: string;
    };
}

interface StressTestDetail {
    id: number;
    student_id: number;
    taken_at: string;
    total_score: number;
    category: string;
    scale_name: string;
    answers: Answer[];
}

const StressTestResultPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [test, setTest] = useState<StressTestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTestDetail();
    }, [id]);

    const fetchTestDetail = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get(`/stress-test/my-results/${id}`);
            setTest(res.data.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load test details');
        } finally {
            setLoading(false);
        }
    };

    const getCategoryColor = (category: string) => {
        switch (category) {
            case 'NORMAL': return 'bg-green-100 text-green-800 border-green-200';
            case 'RINGAN': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'SEDANG': return 'bg-orange-100 text-orange-800 border-orange-200';
            case 'BERAT': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getCategoryDescription = (category: string) => {
        switch (category) {
            case 'NORMAL':
                return {
                    title: 'Kondisi Normal',
                    description: 'Tingkat stress Anda dalam batas normal. Pertahankan pola hidup sehat dan terus jaga kesehatan mental Anda.',
                    recommendations: [
                        'Pertahankan rutinitas olahraga dan istirahat yang cukup',
                        'Lanjutkan hobi dan aktivitas yang Anda nikmati',
                        'Jaga hubungan sosial yang positif'
                    ]
                };
            case 'RINGAN':
                return {
                    title: 'Stress Ringan',
                    description: 'Anda mengalami stress tingkat ringan. Mulai perhatikan faktor-faktor pemicu stress dan lakukan langkah preventif.',
                    recommendations: [
                        'Identifikasi sumber stress dan kelola dengan baik',
                        'Luangkan waktu untuk relaksasi dan self-care',
                        'Pertimbangkan teknik manajemen stress seperti meditasi atau yoga',
                        'Bicarakan dengan teman atau orang terdekat jika diperlukan'
                    ]
                };
            case 'SEDANG':
                return {
                    title: 'Stress Sedang',
                    description: 'Tingkat stress Anda cukup tinggi dan memerlukan perhatian khusus. Sangat disarankan untuk mencari dukungan profesional.',
                    recommendations: [
                        'Konsultasikan dengan konselor atau psikolog',
                        'Kurangi beban aktivitas yang tidak prioritas',
                        'Praktikkan teknik relaksasi secara rutin',
                        'Jaga pola tidur dan makan yang teratur',
                        'Hindari isolasi sosial, tetap terhubung dengan support system'
                    ]
                };
            case 'BERAT':
                return {
                    title: 'Stress Berat',
                    description: 'Tingkat stress Anda sangat tinggi dan memerlukan intervensi profesional segera. Jangan ragu untuk mencari bantuan.',
                    recommendations: [
                        'SEGERA konsultasi dengan profesional kesehatan mental',
                        'Hubungi layanan konseling kampus atau hotline kesehatan mental',
                        'Beritahu keluarga atau teman dekat tentang kondisi Anda',
                        'Ambil break dari aktivitas yang memberatkan jika memungkinkan',
                        'Fokus pada self-care dasar: tidur, makan, dan istirahat yang cukup'
                    ]
                };
            default:
                return {
                    title: 'Hasil Tes',
                    description: 'Hasil tes stress Anda telah tersimpan.',
                    recommendations: []
                };
        }
    };

    const getAnswerLabel = (value: number) => {
        switch (value) {
            case 0: return 'Tidak pernah';
            case 1: return 'Kadang-kadang';
            case 2: return 'Sering';
            case 3: return 'Sangat sering';
            default: return 'Unknown';
        }
    };

    const getAnswerColor = (value: number) => {
        switch (value) {
            case 0: return 'bg-green-50 text-green-700 border-green-200';
            case 1: return 'bg-yellow-50 text-yellow-700 border-yellow-200';
            case 2: return 'bg-orange-50 text-orange-700 border-orange-200';
            case 3: return 'bg-red-50 text-red-700 border-red-200';
            default: return 'bg-gray-50 text-gray-700 border-gray-200';
        }
    };

    if (loading) {

        return (
            <div className="max-w-4xl mx-auto mt-8 mb-12 px-4">
                {/* Back Button Skeleton */}
                <Skeleton width={120} height={20} className="mb-6" />

                {/* Header Card Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center">
                            <Skeleton className="h-14 w-14 mr-4 bg-green-100" />
                            <div>
                                <Skeleton width={200} height={32} className="mb-2" />
                                <Skeleton width={150} height={20} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                        <Skeleton height={100} className="rounded-lg" />
                        <Skeleton height={100} className="rounded-lg" />
                    </div>
                </div>

                {/* Interpretation Card Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    <div className="flex items-center mb-4">
                        <Skeleton width={24} height={24} className="mr-3 rounded-full" />
                        <Skeleton width={200} height={28} />
                    </div>
                    <Skeleton width="100%" height={16} className="mb-2" />
                    <Skeleton width="90%" height={16} className="mb-4" />

                    <div className="space-y-2">
                        {[1, 2, 3].map(i => (
                            <Skeleton key={i} width="80%" height={16} />
                        ))}
                    </div>
                </div>

                {/* Detailed Answers Skeleton */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <Skeleton width={150} height={28} className="mb-4" />
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <Skeleton key={i} height={80} className="rounded-lg" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || !test) {
        return (
            <div className="max-w-4xl mx-auto mt-8 mb-12 px-4">
                <ErrorAlert message={error || 'Test not found'} onClose={() => navigate('/stress-test/history')} />
                <button
                    onClick={() => navigate('/stress-test/history')}
                    className="mt-4 flex items-center text-green-600 hover:text-green-700"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to History
                </button>
            </div>
        );
    }

    const categoryInfo = getCategoryDescription(test.category);

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12 px-4">
            {/* Back Button */}
            <button
                onClick={() => navigate('/stress-test/history')}
                className="mb-6 flex items-center text-gray-600 hover:text-gray-800 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to History
            </button>

            {/* Header Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center">
                        <div className="bg-green-100 p-3 rounded-lg mr-4">
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-800">Stress Test Result</h1>
                            <div className="flex items-center text-sm text-gray-500 mt-1">
                                <Calendar className="h-4 w-4 mr-2" />
                                {new Date(test.taken_at).toLocaleString('id-ID', {
                                    dateStyle: 'long',
                                    timeStyle: 'short'
                                })}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Score Summary */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
                    <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                        <p className="text-sm text-gray-600 mb-1">Total Score</p>
                        <p className="text-3xl font-bold text-gray-800">{test.total_score}</p>
                        <p className="text-xs text-gray-500 mt-1">{test.scale_name}</p>
                    </div>
                    <div className={`p-4 rounded-lg border ${getCategoryColor(test.category)}`}>
                        <p className="text-sm mb-1">Category</p>
                        <p className="text-3xl font-bold">{test.category}</p>
                    </div>
                </div>
            </div>

            {/* Interpretation Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                <div className="flex items-center mb-4">
                    <AlertCircle className="h-6 w-6 text-blue-600 mr-3" />
                    <h2 className="text-xl font-bold text-gray-800">{categoryInfo.title}</h2>
                </div>
                <p className="text-gray-700 mb-4">{categoryInfo.description}</p>

                {categoryInfo.recommendations.length > 0 && (
                    <div>
                        <h3 className="font-semibold text-gray-800 mb-3 flex items-center">
                            <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                            Rekomendasi
                        </h3>
                        <ul className="space-y-2">
                            {categoryInfo.recommendations.map((rec, idx) => (
                                <li key={idx} className="flex items-start">
                                    <span className="inline-block w-2 h-2 bg-green-500 rounded-full mt-2 mr-3 flex-shrink-0"></span>
                                    <span className="text-gray-700">{rec}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Contact Info for Severe Cases */}
                {(test.category === 'BERAT' || test.category === 'SEDANG') && (
                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm font-semibold text-blue-800 mb-2">Butuh Bantuan Segera?</p>
                        <p className="text-sm text-blue-700">
                            Hubungi layanan konseling kampus atau gunakan fitur Live Chat untuk berkonsultasi dengan konselor profesional.
                        </p>
                    </div>
                )}
            </div>

            {/* Detailed Answers */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-800 mb-4">Detail Jawaban</h2>
                <div className="space-y-3">
                    {test.answers.map((answer, idx) => (
                        <div key={answer.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow">
                            <div className="flex items-start justify-between">
                                <div className="flex-1">
                                    <div className="flex items-center mb-2">
                                        <span className="inline-block bg-gray-100 text-gray-700 px-2 py-1 rounded text-xs font-semibold mr-2">
                                            #{idx + 1}
                                        </span>
                                        <span className="text-xs text-gray-500">{answer.question.dimension}</span>
                                    </div>
                                    <p className="text-gray-800 mb-2">{answer.question.question_text}</p>
                                </div>
                                <div className={`ml-4 px-3 py-1 rounded-full border text-sm font-medium whitespace-nowrap ${getAnswerColor(answer.answer_value)}`}>
                                    {getAnswerLabel(answer.answer_value)}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Action Buttons */}
            <div className="mt-6 flex gap-3">
                <button
                    onClick={() => navigate('/stress-test/history')}
                    className="flex-1 px-6 py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                >
                    Back to History
                </button>
                <button
                    onClick={() => navigate('/live-chat')}
                    className="flex-1 px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                    Konsultasi dengan Konselor
                </button>
            </div>
        </div>
    );
};

export default StressTestResultPage;
