import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, CheckCircle } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';
import Skeleton from '../components/Skeleton';

interface Question {
    id: number;
    question_text: string;
    dimension: string;
}

const StressTestPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [submitted, setSubmitted] = useState(false);
    const [result, setResult] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/stress-test/questions');
            setQuestions(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: number, value: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Validation: Check if all questions are answered
        if (Object.keys(answers).length !== questions.length) {
            setError('Please answer all questions before submitting');
            return;
        }

        try {
            setSubmitting(true);
            setError(null);

            const payload = Object.entries(answers).map(([qId, val]) => ({
                question_id: Number(qId),
                answer_value: val
            }));

            const res = await api.post('/stress-test/submit', { answers: payload });
            // Backend returns { message, data: { id, total_score, category, ... } }
            // We need to extract the data property
            setResult(res.data.data);
            setSubmitted(true);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to submit test');
        } finally {
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                    <div className="flex items-center mb-8">
                        <Skeleton width={48} height={48} className="mr-4 rounded-lg" />
                        <div className="flex-1">
                            <Skeleton width={250} height={32} className="mb-2" />
                            <Skeleton width="80%" height={20} />
                        </div>
                    </div>

                    {/* Progress Bar Skeleton */}
                    <div className="mb-8">
                        <div className="flex justify-between items-center mb-2">
                            <Skeleton width={60} height={20} />
                            <Skeleton width={40} height={20} />
                        </div>
                        <Skeleton width="100%" height={8} className="rounded-full" />
                    </div>

                    <div className="space-y-8">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="border-b border-gray-100 pb-6 last:border-0">
                                <Skeleton width="70%" height={24} className="mb-4" />
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    {[1, 2, 3, 4].map(j => (
                                        <Skeleton key={j} height={48} className="rounded-lg" />
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (submitted && result) {
        return (
            <div className="max-w-2xl mx-auto mt-10 bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                <div className="flex justify-center mb-6">
                    <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-4">Test Completed</h2>
                <p className="text-gray-600 mb-6">Your stress level has been analyzed.</p>

                <div className="bg-gray-50 p-6 rounded-lg mb-8">
                    <p className="text-sm text-gray-500 uppercase tracking-wide font-semibold mb-2">Result Category</p>
                    <p className={`text-4xl font-bold ${result.category === 'NORMAL' ? 'text-green-600' :
                        result.category === 'RINGAN' ? 'text-yellow-600' :
                            result.category === 'SEDANG' ? 'text-orange-600' : 'text-red-600'
                        }`}>
                        {result.category}
                    </p>
                    <p className="text-gray-500 mt-2">Score: {result.total_score}</p>
                </div>

                <div className="flex justify-center gap-4">
                    <button
                        onClick={() => navigate('/student')}
                        className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                    >
                        Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/sessions')}
                        className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        Book Consultation
                    </button>
                </div>
            </div>
        );
    }

    // Calculate progress
    const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="bg-green-100 p-3 rounded-lg mr-4">
                        <ClipboardList className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Stress Level Assessment</h1>
                        <p className="text-gray-500">Please answer the following questions honestly based on how you felt over the past week.</p>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="mb-8">
                    <div className="flex justify-between items-center mb-2">
                        <span className="text-sm font-medium text-gray-700">Progress</span>
                        <span className="text-sm font-medium text-gray-700">{Object.keys(answers).length} / {questions.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                        <div
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>

                <div className="space-y-8">
                    {questions.map((q, index) => (
                        <div key={q.id} className="border-b border-gray-100 pb-6 last:border-0">
                            <p className="text-lg font-medium text-gray-800 mb-4">
                                {index + 1}. {q.question_text}
                            </p>
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                {[0, 1, 2, 3].map((val) => (
                                    <button
                                        key={val}
                                        onClick={() => handleAnswer(q.id, val)}
                                        className={`py-3 px-4 rounded-lg border transition-all ${answers[q.id] === val
                                            ? 'bg-green-600 text-white border-green-600 ring-2 ring-green-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-green-400 hover:bg-green-50'
                                            }`}
                                    >
                                        {val === 0 && 'Never'}
                                        {val === 1 && 'Sometimes'}
                                        {val === 2 && 'Often'}
                                        {val === 3 && 'Always'}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                <div className="mt-8 pt-6 border-t border-gray-100 flex justify-between items-center">
                    <p className="text-sm text-gray-600">
                        {Object.keys(answers).length === questions.length ? (
                            <span className="text-green-600 font-medium">✓ All questions answered</span>
                        ) : (
                            <span className="text-yellow-600 font-medium">
                                {questions.length - Object.keys(answers).length} question(s) remaining
                            </span>
                        )}
                    </p>
                    <button
                        onClick={handleSubmit}
                        disabled={submitting || Object.keys(answers).length !== questions.length}
                        className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-green-200"
                    >
                        {submitting ? 'Submitting...' : 'Submit Assessment'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StressTestPage;
