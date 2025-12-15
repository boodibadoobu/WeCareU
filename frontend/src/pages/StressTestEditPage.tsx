import { useEffect, useState } from 'react';
import api from '../api/axios';
import { useNavigate, useParams } from 'react-router-dom';
import { ClipboardList, Save, ArrowLeft } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

interface Question {
    id: number;
    question_text: string;
    dimension: string;
}

interface Answer {
    question_id: number;
    answer_value: number;
}

const StressTestEditPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [questions, setQuestions] = useState<Question[]>([]);
    const [answers, setAnswers] = useState<{ [key: number]: number }>({});
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchTestData();
    }, [id]);

    const fetchTestData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch questions
            const questionsRes = await api.get('/stress-test/questions');
            setQuestions(questionsRes.data);

            // Fetch existing test answers
            const testRes = await api.get(`/stress-test/${id}`);
            const existingAnswers: { [key: number]: number } = {};

            testRes.data.answers.forEach((answer: Answer) => {
                existingAnswers[answer.question_id] = answer.answer_value;
            });

            setAnswers(existingAnswers);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load test data');
            setTimeout(() => navigate('/stress-test/history'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleAnswer = (questionId: number, value: number) => {
        setAnswers((prev) => ({ ...prev, [questionId]: value }));
    };

    const handleSubmit = async () => {
        // Validation
        if (Object.keys(answers).length !== questions.length) {
            setError('Please answer all questions before submitting');
            return;
        }

        try {
            setSaving(true);
            setError(null);

            const payload = Object.entries(answers).map(([qId, val]) => ({
                question_id: Number(qId),
                answer_value: val
            }));

            await api.put(`/stress-test/${id}`, { answers: payload });
            navigate('/stress-test/history');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update test');
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="max-w-3xl mx-auto mt-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">Loading test data...</p>
                </div>
            </div>
        );
    }

    const progress = questions.length > 0 ? (Object.keys(answers).length / questions.length) * 100 : 0;

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <button
                onClick={() => navigate('/stress-test/history')}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to History
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <ClipboardList className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="flex-1">
                        <h1 className="text-2xl font-bold text-gray-800">Edit Stress Test</h1>
                        <p className="text-gray-500">You can edit your responses within 24 hours of taking the test</p>
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
                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
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
                                            ? 'bg-blue-600 text-white border-blue-600 ring-2 ring-blue-200'
                                            : 'bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:bg-blue-50'
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
                        disabled={saving || Object.keys(answers).length !== questions.length}
                        className="flex items-center bg-blue-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-blue-200"
                    >
                        <Save className="h-5 w-5 mr-2" />
                        {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default StressTestEditPage;
