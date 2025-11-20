import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api/axios';
import { useAuth } from '../context/AuthContext';
import { Lock, User } from 'lucide-react';

const LoginPage = () => {
    const { register, handleSubmit, formState: { errors } } = useForm();
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const onSubmit = async (data: any) => {
        try {
            setError('');
            const response = await api.post('/auth/login', {
                identifier: data.identifier,
                password: data.password
            });

            login(response.data.token, response.data.user);

            // Redirect based on role
            const role = response.data.user.role;
            if (role === 'ADMIN') navigate('/admin/dashboard');
            else if (role === 'COUNSELOR') navigate('/counselor');
            else navigate('/student');

        } catch (err: any) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-green-50">
            <div className="bg-white p-8 rounded-2xl shadow-lg w-full max-w-md border border-green-100">
                <div className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-green-600 mb-2">WeCareU</h1>
                    <p className="text-gray-500">Welcome back, please login to continue.</p>
                </div>

                {error && (
                    <div className="bg-red-50 text-red-600 p-3 rounded-lg mb-4 text-sm">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Email or NIM</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <User className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('identifier', { required: 'Email or NIM is required' })}
                                type="text"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your Email or NIM"
                            />
                        </div>
                        {errors.identifier && <span className="text-xs text-red-500 mt-1">{errors.identifier.message as string}</span>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <Lock className="h-5 w-5 text-gray-400" />
                            </div>
                            <input
                                {...register('password', { required: 'Password is required' })}
                                type="password"
                                className="pl-10 w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                                placeholder="Enter your password"
                            />
                        </div>
                        {errors.password && <span className="text-xs text-red-500 mt-1">{errors.password.message as string}</span>}
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200 shadow-md hover:shadow-lg"
                    >
                        Login
                    </button>
                </form>

                <div className="mt-6 text-center text-sm text-gray-600">
                    Don't have an account?{' '}
                    <Link to="/register" className="text-green-600 hover:text-green-700 font-medium">
                        Register as Student
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
