import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X } from 'lucide-react';

interface UserFormData {
    full_name: string;
    email?: string;
    nim?: string;
    role: 'ADMIN' | 'COUNSELOR' | 'STUDENT';
    password: string;
    status: 'PENDING' | 'ACTIVE' | 'SUSPENDED';
}

interface UserFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: UserFormData) => void;
    initialData?: Partial<UserFormData>;
    isEdit?: boolean;
}

const UserFormModal = ({ isOpen, onClose, onSubmit, initialData, isEdit = false }: UserFormModalProps) => {
    const { register, handleSubmit, formState: { errors }, watch, reset, setValue } = useForm<UserFormData>({
        defaultValues: {
            full_name: '',
            email: '',
            nim: '',
            role: 'STUDENT',
            password: '',
            status: 'ACTIVE'
        }
    });

    const selectedRole = watch('role');

    useEffect(() => {
        if (isOpen && initialData) {
            Object.keys(initialData).forEach((key) => {
                setValue(key as keyof UserFormData, initialData[key as keyof UserFormData] as any);
            });
        } else if (!isOpen) {
            reset();
        }
    }, [isOpen, initialData, reset, setValue]);

    const handleFormSubmit = (data: UserFormData) => {
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
                            {isEdit ? 'Edit User' : 'Create New User'}
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
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                {...register('full_name', {
                                    required: 'Full name is required',
                                    minLength: {
                                        value: 3,
                                        message: 'Name must be at least 3 characters'
                                    }
                                })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.full_name ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="Enter full name"
                            />
                            {errors.full_name && (
                                <p className="text-xs text-red-500 mt-1">{errors.full_name.message}</p>
                            )}
                        </div>

                        {/* Role */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('role', { required: 'Role is required' })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.role ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="STUDENT">Student</option>
                                <option value="COUNSELOR">Counselor</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                            {errors.role && (
                                <p className="text-xs text-red-500 mt-1">{errors.role.message}</p>
                            )}
                        </div>

                        {/* Status */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status <span className="text-red-500">*</span>
                            </label>
                            <select
                                {...register('status', { required: 'Status is required' })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.status ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            >
                                <option value="PENDING">Pending</option>
                                <option value="ACTIVE">Active</option>
                                <option value="SUSPENDED">Suspended</option>
                            </select>
                            {errors.status && (
                                <p className="text-xs text-red-500 mt-1">{errors.status.message}</p>
                            )}
                        </div>

                        {/* Conditional Fields based on Role */}
                        {selectedRole === 'STUDENT' ? (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    NIM <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    {...register('nim', {
                                        required: selectedRole === 'STUDENT' ? 'NIM is required for students' : false,
                                        pattern: {
                                            value: /^[0-9]+$/,
                                            message: 'NIM must contain only numbers'
                                        }
                                    })}
                                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.nim ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter student NIM"
                                />
                                {errors.nim && (
                                    <p className="text-xs text-red-500 mt-1">{errors.nim.message}</p>
                                )}
                            </div>
                        ) : (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    {...register('email', {
                                        required: selectedRole !== 'STUDENT' ? 'Email is required' : false,
                                        pattern: {
                                            value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                                            message: 'Invalid email address'
                                        }
                                    })}
                                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter email address"
                                />
                                {errors.email && (
                                    <p className="text-xs text-red-500 mt-1">{errors.email.message}</p>
                                )}
                            </div>
                        )}

                        {/* Password */}
                        {!isEdit && (
                            <div className="md:col-span-2">
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    {...register('password', {
                                        required: !isEdit ? 'Password is required' : false,
                                        minLength: {
                                            value: 6,
                                            message: 'Password must be at least 6 characters'
                                        }
                                    })}
                                    className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.password ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter password"
                                />
                                {errors.password && (
                                    <p className="text-xs text-red-500 mt-1">{errors.password.message}</p>
                                )}
                            </div>
                        )}
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
                            {isEdit ? 'Update User' : 'Create User'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UserFormModal;
