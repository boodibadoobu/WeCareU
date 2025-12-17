import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

interface QuestionData {
    question_text: string;
    dimension: string;
}

interface QuestionFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: QuestionData) => void;
    initialData?: Partial<QuestionData>;
    isEdit?: boolean;
}

const QuestionFormModal = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }: QuestionFormModalProps) => {
    const { register, handleSubmit, formState: { errors }, reset, setValue } = useForm<QuestionData>({
        defaultValues: {
            question_text: '',
            dimension: 'general'
        }
    });

    useEffect(() => {
        if (isOpen && initialData) {
            Object.keys(initialData).forEach((key) => {
                setValue(key as keyof QuestionData, initialData[key as keyof QuestionData] as any);
            });
        } else if (!isOpen) {
            reset();
        }
    }, [isOpen, initialData, reset, setValue]);

    const handleFormSubmit = (data: QuestionData) => {
        onSubmit(data);
        reset();
    };

    const handleBackdropClick = (e: React.MouseEvent) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
            onClick={handleBackdropClick}
        >
            <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full mx-4 overflow-hidden animate-scale-in">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isEdit ? 'Edit Question' : 'Add New Question'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                            aria-label="Close"
                        >
                            <X className="h-6 w-6" />
                        </button>
                    </div>
                </div>

                <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-6">
                    {/* Question Text */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Question Text <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('question_text', {
                                required: 'Question text is required',
                                minLength: {
                                    value: 10,
                                    message: 'Question must be at least 10 characters'
                                },
                                maxLength: {
                                    value: 500,
                                    message: 'Question must not exceed 500 characters'
                                }
                            })}
                            rows={4}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.question_text ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter the stress test question (e.g., 'I found it hard to calm down')"
                        />
                        {errors.question_text && (
                            <p className="text-xs text-red-500 mt-1">{errors.question_text.message}</p>
                        )}
                        <p className="text-xs text-gray-500 mt-1">Minimum 10 characters, maximum 500 characters</p>
                    </div>

                    {/* Dimension */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Dimension <span className="text-red-500">*</span>
                        </label>
                        <select
                            {...register('dimension', { required: 'Dimension is required' })}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.dimension ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="general">General</option>
                            <option value="stress">Stress</option>
                            <option value="anxiety">Anxiety</option>
                            <option value="depression">Depression</option>
                        </select>
                        {errors.dimension && (
                            <p className="text-xs text-red-500 mt-1">{errors.dimension.message}</p>
                        )}
                    </div>

                    {/* Info Box */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <p className="text-sm text-blue-800">
                            <strong>Note:</strong> Questions use a 0-3 scale:
                            <br />• 0 = Never
                            <br />• 1 = Sometimes
                            <br />• 2 = Often
                            <br />• 3 = Always
                        </p>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            {isEdit ? 'Update Question' : 'Create Question'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default QuestionFormModal;
