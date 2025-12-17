import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { Lock, User, CreditCard } from 'lucide-react';

const RegisterPage = () => {
    const { register, handleSubmit, watch, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            setError('');
            setSuccess('');
            await api.post('/auth/register-student', {
                full_name: data.full_name,
                email: data.email,
                nim: data.nim,
                password: data.password,
                confirm_password: data.confirm_password
            });

            setSuccess('Registration successful! Please wait for admin verification.');
            setTimeout(() => navigate('/login'), 3000);

        } catch (err: any) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };


    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-green-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-600 mb-2">Join WeCareU</h1>
                    <p className="text-gray-500">Create your student account</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-50 text-green-600 p-3 rounded-lg mb-4 text-sm">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('full_name', { required: 'Full Name is required' })}
                                type="text"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="John Doe"
                            />
                        </div>
                        {errors.full_name && <span className="text-xs text-red-500 mt-1">{errors.full_name.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email (Optional)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('email', {
                                    pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
                                })}
                                type="email"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="student@example.com"
                            />
                        </div>
                        {errors.email && <span className="text-xs text-red-500 mt-1">{errors.email.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">NIM</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <CreditCard className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('nim', {
                                    required: 'NIM is required',
                                    pattern: { value: /^[0-9]+$/, message: 'NIM must be numeric' },
                                    minLength: { value: 6, message: 'NIM too short' }
                                })}
                                type="text"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="1234567890"
                            />
                        </div>
                        {errors.nim && <span className="text-xs text-red-500 mt-1">{errors.nim.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('password', {
                                    required: 'Password is required',
                                    minLength: { value: 3, message: 'Password must be at least 3 chars' }
                                })}
                                type="password"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Min 3 chars"
                            />
                        </div>
                        {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Confirm Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('confirm_password', {
                                    required: 'Confirm Password is required',
                                    validate: (val: string) => {
                                        if (watch('password') != val) {
                                            return "Your passwords do no match";
                                        }
                                    }
                                })}
                                type="password"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Confirm password"
                            />
                        </div>
                        {errors.confirm_password && <span className="text-xs text-red-500 mt-1">{errors.confirm_password.message as string}</span>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg mt-4"
                    >
                        Register
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link to="/login" className="text-green-600 hover:text-green-700 font-medium">
                        Login here
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default RegisterPage;
