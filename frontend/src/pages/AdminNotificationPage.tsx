import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Send, ArrowLeft, Bell } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

interface NotificationFormData {
    type: 'SESSION' | 'STRESS_RESULT' | 'SYSTEM';
    title: string;
    body: string;
    target_type: 'ALL' | 'ROLE' | 'USER';
    target_role?: 'STUDENT' | 'COUNSELOR' | 'ADMIN';
    target_user_id?: number;
}

const AdminNotificationPage = () => {
    const { register, handleSubmit, formState: { errors }, watch } = useForm<NotificationFormData>({
        defaultValues: {
            type: 'SYSTEM',
            title: '',
            body: '',
            target_type: 'ALL'
        }
    });

    const navigate = useNavigate();
    const [sending, setSending] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    const targetType = watch('target_type');

    const onSubmit = async (data: NotificationFormData) => {
        try {
            setSending(true);
            setError(null);
            setSuccess(false);

            await api.post('/admin/notifications/send', data);
            setSuccess(true);

            // Reset form and redirect after 2 seconds
            setTimeout(() => {
                navigate('/notifications');
            }, 2000);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to send notification');
        } finally {
            setSending(false);
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            {success && (
                <div className="fixed top-4 right-4 z-50 max-w-md animate-slide-in">
                    <div className="bg-green-50 border border-green-200 rounded-lg shadow-lg p-4 flex items-start">
                        <Bell className="h-5 w-5 text-green-600 mt-0.5 mr-3 flex-shrink-0" />
                        <div className="flex-1">
                            <h3 className="text-sm font-semibold text-green-800 mb-1">Success</h3>
                            <p className="text-sm text-green-700">Notification sent successfully!</p>
                        </div>
                    </div>
                </div>
            )}

            <button
                onClick={() => navigate('/notifications')}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Notifications
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center mb-8">
                    <div className="bg-purple-100 p-3 rounded-lg mr-4">
                        <Bell className="h-8 w-8 text-purple-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800">Send Notification</h1>
                        <p className="text-gray-500">Create and send notifications to users</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Type <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('type', { required: 'Type is required' })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="SYSTEM">System</option>
                                <option value="SESSION">Session</option>
                                <option value="STRESS_RESULT">Stress Result</option>
                            </select>
                            {errors.type && (
                                <p className="text-xs text-red-500 mt-1">{errors.type.message}</p>
                            )}
                        </div>

                        {/* Target Type */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Send To <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('target_type', { required: 'Target is required' })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.target_type ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="ALL">All Users</option>
                                <option value="ROLE">Specific Role</option>
                                <option value="USER">Specific User</option>
                            </select>
                            {errors.target_type && (
                                <p className="text-xs text-red-500 mt-1">{errors.target_type.message}</p>
                            )}
                        </div>

                        {/* Conditional: Role Selection */}
                        {targetType === 'ROLE' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Select Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    {...register('target_role', {
                                        required: targetType === 'ROLE' ? 'Role is required' : false
                                    })}
                                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.target_role ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Select a role</option>
                                    <option value="STUDENT">Students</option>
                                    <option value="COUNSELOR">Counselors</option>
                                    <option value="ADMIN">Admins</option>
                                </select>
                                {errors.target_role && (
                                    <p className="text-xs text-red-500 mt-1">{errors.target_role.message}</p>
                                )}
                            </div>
                        )}

                        {/* Conditional: User ID */}
                        {targetType === 'USER' && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    User ID <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    {...register('target_user_id', {
                                        required: targetType === 'USER' ? 'User ID is required' : false,
                                        min: { value: 1, message: 'Invalid user ID' }
                                    })}
                                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.target_user_id ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter user ID"
                                />
                                {errors.target_user_id && (
                                    <p className="text-xs text-red-500 mt-1">{errors.target_user_id.message}</p>
                                )}
                            </div>
                        )}
                    </div>

                    {/* Title */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title', {
                                required: 'Title is required',
                                maxLength: {
                                    value: 100,
                                    message: 'Title must not exceed 100 characters'
                                }
                            })}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter notification title"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    {/* Body */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Message <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('body', {
                                required: 'Message is required',
                                minLength: {
                                    value: 10,
                                    message: 'Message must be at least 10 characters'
                                }
                            })}
                            rows={6}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500 ${errors.body ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter notification message..."
                        />
                        {errors.body && (
                            <p className="text-xs text-red-500 mt-1">{errors.body.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4 border-t border-gray-100">
                        <button
                            type="submit"
                            disabled={sending}
                            className="flex items-center bg-purple-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shadow-lg shadow-purple-200"
                        >
                            <Send className="h-5 w-5 mr-2" />
                            {sending ? 'Sending...' : 'Send Notification'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AdminNotificationPage;
