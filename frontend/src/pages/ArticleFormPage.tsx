import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import api from '../api/axios';
import { ArrowLeft, Save, Upload } from 'lucide-react';
import ErrorAlert from '../components/ErrorAlert';

interface ArticleFormData {
    title: string;
    category: string;
    thumbnail_url: string;
    content: string;
    is_published: boolean;
}

const ArticleFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const { register, handleSubmit, formState: { errors }, setValue, watch } = useForm<ArticleFormData>({
        defaultValues: {
            title: '',
            category: 'General',
            thumbnail_url: '',
            content: '',
            is_published: true
        }
    });

    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    const thumbnailUrl = watch('thumbnail_url');

    useEffect(() => {
        if (isEditMode) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            setLoading(true);
            const res = await api.get(`/articles/${id}`);
            const { title, category, thumbnail_url, content, is_published } = res.data;

            setValue('title', title);
            setValue('category', category);
            setValue('thumbnail_url', thumbnail_url || '');
            setValue('content', content);
            setValue('is_published', is_published);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load article');
            setTimeout(() => navigate('/articles'), 2000);
        } finally {
            setLoading(false);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        setError(null);
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);

        try {
            const res = await api.post('/upload/image', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            const imageUrl = `http://localhost:3000${res.data.url}`;
            setValue('thumbnail_url', imageUrl);
            setSelectedFile(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const onSubmit = async (data: ArticleFormData) => {
        try {
            setLoading(true);
            setError(null);

            if (isEditMode) {
                await api.put(`/articles/${id}`, data);
            } else {
                await api.post('/articles', data);
            }
            navigate('/articles');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to save article');
        } finally {
            setLoading(false);
        }
    };

    if (loading && isEditMode) {
        return (
            <div className="max-w-3xl mx-auto mt-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">Loading article...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <button
                onClick={() => navigate('/articles')}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Articles
            </button>

            <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100">
                <h1 className="text-2xl font-bold text-gray-800 mb-6">
                    {isEditMode ? 'Edit Article' : 'Create New Article'}
                </h1>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Title <span className="text-red-500">*</span>
                        </label>
                        <input
                            type="text"
                            {...register('title', {
                                required: 'Title cannot be empty',
                                minLength: {
                                    value: 5,
                                    message: 'Title must be at least 5 characters'
                                },
                                maxLength: {
                                    value: 200,
                                    message: 'Title must not exceed 200 characters'
                                }
                            })}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.title ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Enter article title"
                        />
                        {errors.title && (
                            <p className="text-xs text-red-500 mt-1">{errors.title.message}</p>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                {...register('category')}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            >
                                <option value="General">General</option>
                                <option value="Anxiety">Anxiety</option>
                                <option value="Depression">Depression</option>
                                <option value="Stress">Stress</option>
                                <option value="Self-Care">Self-Care</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Thumbnail URL</label>
                            <input
                                type="text"
                                {...register('thumbnail_url', {
                                    pattern: {
                                        value: /^(https?:\/\/)?([\da-z\.-]+)\.([a-z\.]{2,6})([\/\w \.-]*)*\/?$/,
                                        message: 'Invalid URL format'
                                    }
                                })}
                                className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.thumbnail_url ? 'border-red-500' : 'border-gray-300'
                                    }`}
                                placeholder="https://example.com/image.jpg"
                            />
                            {errors.thumbnail_url && (
                                <p className="text-xs text-red-500 mt-1">{errors.thumbnail_url.message}</p>
                            )}
                        </div>
                    </div>

                    {/* Image Upload Section */}
                    <div className="border-2 border-dashed border-gray-300 rounded-lg p-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Or Upload Image from Computer
                        </label>
                        <div className="flex items-center gap-4">
                            <input
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="flex-1 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-green-50 file:text-green-700 hover:file:bg-green-100"
                            />
                            <button
                                type="button"
                                onClick={handleUpload}
                                disabled={!selectedFile || uploading}
                                className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                {uploading ? 'Uploading...' : 'Upload'}
                            </button>
                        </div>
                        {thumbnailUrl && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                <img
                                    src={thumbnailUrl}
                                    alt="Thumbnail preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).src = 'https://via.placeholder.com/400x200?text=Invalid+Image';
                                    }}
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Content <span className="text-red-500">*</span>
                        </label>
                        <textarea
                            {...register('content', {
                                required: 'Content is required',
                                minLength: {
                                    value: 50,
                                    message: 'Content must be at least 50 characters'
                                }
                            })}
                            rows={10}
                            className={`w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 ${errors.content ? 'border-red-500' : 'border-gray-300'
                                }`}
                            placeholder="Write your article content here..."
                        />
                        {errors.content && (
                            <p className="text-xs text-red-500 mt-1">{errors.content.message}</p>
                        )}
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            {loading ? 'Saving...' : 'Save Article'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleFormPage;
