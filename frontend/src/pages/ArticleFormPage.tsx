import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Save, Upload } from 'lucide-react';

const ArticleFormPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!id;

    const [formData, setFormData] = useState({
        title: '',
        category: 'General',
        thumbnail_url: '',
        content: '',
        is_published: true
    });
    const [uploading, setUploading] = useState(false);
    const [selectedFile, setSelectedFile] = useState<File | null>(null);

    useEffect(() => {
        if (isEditMode) {
            fetchArticle();
        }
    }, [id]);

    const fetchArticle = async () => {
        try {
            const res = await api.get(`/articles/${id}`);
            const { title, category, thumbnail_url, content, is_published } = res.data;
            setFormData({ title, category, thumbnail_url: thumbnail_url || '', content, is_published });
        } catch (err) {
            console.error(err);
            navigate('/articles');
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            setSelectedFile(e.target.files[0]);
        }
    };

    const handleUpload = async () => {
        if (!selectedFile) return;

        setUploading(true);
        const formDataUpload = new FormData();
        formDataUpload.append('image', selectedFile);

        try {
            const res = await api.post('/upload/image', formDataUpload, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            // Set the uploaded image URL
            const imageUrl = `http://localhost:3000${res.data.url}`;
            setFormData((prev) => ({ ...prev, thumbnail_url: imageUrl }));
            setSelectedFile(null);
            alert('Image uploaded successfully!');
        } catch (err) {
            console.error(err);
            alert('Failed to upload image');
        } finally {
            setUploading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            if (isEditMode) {
                await api.put(`/articles/${id}`, formData);
            } else {
                await api.post('/articles', formData);
            }
            navigate('/articles');
        } catch (err) {
            console.error(err);
            alert('Failed to save article');
        }
    };

    return (
        <div className="max-w-3xl mx-auto mt-8 mb-12">
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

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        <input
                            type="text"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            required
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Enter article title"
                        />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
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
                                name="thumbnail_url"
                                value={formData.thumbnail_url}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                                placeholder="https://example.com/image.jpg"
                            />
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
                        {formData.thumbnail_url && (
                            <div className="mt-4">
                                <p className="text-sm text-gray-600 mb-2">Preview:</p>
                                <img
                                    src={formData.thumbnail_url}
                                    alt="Thumbnail preview"
                                    className="w-full h-48 object-cover rounded-lg"
                                />
                            </div>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
                        <textarea
                            name="content"
                            value={formData.content}
                            onChange={handleChange}
                            required
                            rows={10}
                            className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-green-500"
                            placeholder="Write your article content here..."
                        />
                    </div>

                    <div className="flex justify-end pt-4">
                        <button
                            type="submit"
                            className="flex items-center bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors"
                        >
                            <Save className="h-5 w-5 mr-2" />
                            Save Article
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ArticleFormPage;
