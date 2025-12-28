import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Edit, Trash2, Plus, BookOpen, RefreshCw } from 'lucide-react';
import QuestionFormModal from '../components/QuestionFormModal';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';

interface Question {
    id: number;
    question_text: string;
    dimension: string;
    is_active: boolean;
}

const AdminQuestionsPage = () => {
    const [questions, setQuestions] = useState<Question[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [restoring, setRestoring] = useState(false);

    useEffect(() => {
        fetchQuestions();
    }, []);

    const fetchQuestions = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await api.get('/stress-test/admin/questions');
            setQuestions(res.data.data || []);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load questions');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateQuestion = async (data: any) => {
        try {
            setError(null);
            await api.post('/stress-test/admin/questions', data);
            setSuccess('Question created successfully!');
            setShowModal(false);
            fetchQuestions();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to create question');
        }
    };

    const handleEditQuestion = async (data: any) => {
        if (!editingQuestion) return;

        try {
            setError(null);
            await api.put(`/stress-test/admin/questions/${editingQuestion.id}`, data);
            setSuccess('Question updated successfully!');
            setShowModal(false);
            setEditingQuestion(null);
            fetchQuestions();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to update question');
        }
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/stress-test/admin/questions/${deleteId}`);
            setSuccess('Question deactivated successfully!');
            fetchQuestions(); // Refetch to update is_active status
            setDeleteId(null);
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to deactivate question');
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    const handleRestore = async (id: number) => {
        try {
            setRestoring(true);
            setError(null);
            await api.put(`/stress-test/admin/questions/${id}/restore`);
            setSuccess('Question restored successfully!');
            fetchQuestions();
            setTimeout(() => setSuccess(null), 3000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to restore question');
        } finally {
            setRestoring(false);
        }
    };

    const openEditModal = (question: Question) => {
        setEditingQuestion(question);
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingQuestion(null);
    };

    return (
        <div className="max-w-6xl mx-auto mt-8 mb-12 px-4">
            <ErrorAlert message={error} onClose={() => setError(null)} />

            {success && (
                <div className="mb-4 bg-green-50 text-green-600 p-3 rounded-lg text-sm border border-green-200">
                    {success}
                </div>
            )}

            <QuestionFormModal
                isOpen={showModal}
                onClose={closeModal}
                onSubmit={editingQuestion ? handleEditQuestion : handleCreateQuestion}
                initialData={editingQuestion || undefined}
                isEdit={!!editingQuestion}
            />

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete Question"
                message="Are you sure you want to delete this question? This action cannot be undone. Questions with existing answers cannot be deleted."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteId(null)}
            />

            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center">
                    <div className="bg-blue-100 p-3 rounded-lg mr-4">
                        <BookOpen className="h-8 w-8 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Stress Test Questions</h1>
                        <p className="text-gray-500">Manage stress assessment questions</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowModal(true)}
                    className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center shadow-lg"
                >
                    <Plus className="h-5 w-5 mr-2" />
                    Add Question
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center text-gray-500">Loading questions...</div>
                ) : questions.length === 0 ? (
                    <div className="p-8 text-center text-gray-500">
                        No questions found. Click "Add Question" to create your first question.
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-gray-50 text-gray-600 text-sm uppercase tracking-wider">
                                <tr>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 font-medium">Question Text</th>
                                    <th className="px-6 py-4 font-medium">Dimension</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {questions.map((question) => (
                                    <tr key={question.id} className={`hover:bg-gray-50 transition-colors ${!question.is_active ? 'opacity-50 bg-gray-50' : ''}`}>
                                        <td className="px-6 py-4 text-gray-600">#{question.id}</td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900 max-w-2xl">
                                                {question.question_text}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                                {question.dimension || 'general'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            {question.is_active ? (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                                    Active
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                                                    Inactive
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            <div className="flex justify-end gap-2">
                                                {!question.is_active && (
                                                    <button
                                                        onClick={() => handleRestore(question.id)}
                                                        disabled={restoring}
                                                        className="text-green-600 hover:text-green-900 p-1 rounded hover:bg-green-50 disabled:opacity-50"
                                                        title="Restore"
                                                    >
                                                        <RefreshCw className="h-5 w-5" />
                                                    </button>
                                                )}
                                                <button
                                                    onClick={() => openEditModal(question)}
                                                    className="text-blue-600 hover:text-blue-900 p-1 rounded hover:bg-blue-50"
                                                    title="Edit"
                                                >
                                                    <Edit className="h-5 w-5" />
                                                </button>
                                                {question.is_active && (
                                                    <button
                                                        onClick={() => setDeleteId(question.id)}
                                                        disabled={deleting}
                                                        className="text-red-600 hover:text-red-900 p-1 rounded hover:bg-red-50 disabled:opacity-50"
                                                        title="Deactivate"
                                                    >
                                                        <Trash2 className="h-5 w-5" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            <div className="mt-6 text-sm text-gray-500">
                <p>Total Questions: <span className="font-semibold text-gray-700">{questions.length}</span></p>
            </div>
        </div>
    );
};

export default AdminQuestionsPage;
