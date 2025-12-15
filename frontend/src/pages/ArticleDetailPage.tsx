import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, User, Tag, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';

interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    thumbnail_url?: string;
    created_at: string;
    author: {
        id: number;
        full_name: string;
    };
}

const ArticleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [article, setArticle] = useState<Article | null>(null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const res = await api.get(`/articles/${id}`);
            setArticle(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load article');
            setTimeout(() => navigate('/articles'), 2000);
        }
    };

    const handleDelete = async () => {
        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/articles/${id}`);
            navigate('/articles');
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete article');
            setShowDeleteDialog(false);
        } finally {
            setDeleting(false);
        }
    };

    if (!article) {
        return (
            <div className="max-w-4xl mx-auto mt-8 mb-12">
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center">
                    <p className="text-gray-500">Loading...</p>
                </div>
            </div>
        );
    }

    // Check if current user can edit/delete (admin or author)
    const canModify = user?.role === 'ADMIN' || user?.id === article.author.id;

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <ConfirmDialog
                isOpen={showDeleteDialog}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDelete}
                onCancel={() => setShowDeleteDialog(false)}
            />

            <div className="flex justify-between items-center mb-6">
                <button
                    onClick={() => navigate('/articles')}
                    className="flex items-center text-gray-500 hover:text-gray-800 transition-colors"
                >
                    <ArrowLeft className="h-5 w-5 mr-2" />
                    Back to Articles
                </button>

                {canModify && (
                    <div className="flex gap-2">
                        <button
                            onClick={() => navigate(`/articles/edit/${article.id}`)}
                            className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Edit className="h-4 w-4 mr-2" />
                            Edit
                        </button>
                        <button
                            onClick={() => setShowDeleteDialog(true)}
                            disabled={deleting}
                            className="flex items-center px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
                        >
                            <Trash2 className="h-4 w-4 mr-2" />
                            {deleting ? 'Deleting...' : 'Delete'}
                        </button>
                    </div>
                )}
            </div>

            <article className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                {article.thumbnail_url && (
                    <div className="h-64 w-full">
                        <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
                    </div>
                )}

                <div className="p-8 md:p-12">
                    <div className="flex flex-wrap gap-4 mb-6 text-sm text-gray-500">
                        <span className="flex items-center bg-green-50 text-green-700 px-3 py-1 rounded-full font-medium">
                            <Tag className="h-4 w-4 mr-2" />
                            {article.category}
                        </span>
                        <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-2" />
                            {new Date(article.created_at).toLocaleDateString()}
                        </span>
                        <span className="flex items-center">
                            <User className="h-4 w-4 mr-2" />
                            {article.author.full_name}
                        </span>
                    </div>

                    <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8 leading-tight">
                        {article.title}
                    </h1>

                    <div className="prose prose-green max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                        {article.content}
                    </div>
                </div>
            </article>
        </div>
    );
};

export default ArticleDetailPage;
