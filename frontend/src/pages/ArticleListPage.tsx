import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Link } from 'react-router-dom';
import { BookOpen, User, Plus, Edit, Trash2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import ConfirmDialog from '../components/ConfirmDialog';
import ErrorAlert from '../components/ErrorAlert';

interface Article {
    id: number;
    title: string;
    category: string;
    thumbnail_url?: string;
    created_at: string;
    author: {
        id: number;
        full_name: string;
    };
}

const ArticleListPage = () => {
    const { user } = useAuth();
    const [articles, setArticles] = useState<Article[]>([]);
    const [deleteId, setDeleteId] = useState<number | null>(null);
    const [deleting, setDeleting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        try {
            const res = await api.get('/articles');
            setArticles(res.data);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to load articles');
        }
    };

    const handleDeleteClick = (id: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDeleteId(id);
    };

    const handleDeleteConfirm = async () => {
        if (!deleteId) return;

        try {
            setDeleting(true);
            setError(null);
            await api.delete(`/articles/${deleteId}`);
            setArticles(articles.filter(a => a.id !== deleteId));
            setDeleteId(null);
        } catch (err: any) {
            setError(err.response?.data?.message || 'Failed to delete article');
            setDeleteId(null);
        } finally {
            setDeleting(false);
        }
    };

    const canModifyArticle = (article: Article) => {
        return user?.role === 'ADMIN' || user?.id === article.author.id;
    };

    const canCreateArticle = user?.role === 'ADMIN' || user?.role === 'COUNSELOR';

    return (
        <div className="max-w-5xl mx-auto mt-8 mb-12">
            <ErrorAlert
                message={error}
                onClose={() => setError(null)}
            />

            <ConfirmDialog
                isOpen={deleteId !== null}
                title="Delete Article"
                message="Are you sure you want to delete this article? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                type="danger"
                onConfirm={handleDeleteConfirm}
                onCancel={() => setDeleteId(null)}
            />

            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-gray-800">Mental Health Articles</h1>
                    <p className="text-gray-500 mt-1">Read the latest insights and tips from our professionals.</p>
                </div>
                {canCreateArticle && (
                    <Link
                        to="/articles/new"
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                    >
                        <Plus className="h-5 w-5 mr-2" />
                        Create Article
                    </Link>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {articles.map((article) => (
                    <div key={article.id} className="group relative">
                        <Link to={`/articles/${article.id}`} className="block">
                            <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow h-full flex flex-col">
                                <div className="h-48 bg-gray-200 relative">
                                    {article.thumbnail_url ? (
                                        <img src={article.thumbnail_url} alt={article.title} className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-green-50">
                                            <BookOpen className="h-12 w-12 text-green-200" />
                                        </div>
                                    )}
                                    <span className="absolute top-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-xs font-semibold text-green-700">
                                        {article.category}
                                    </span>
                                </div>
                                <div className="p-5 flex-1 flex flex-col">
                                    <h3 className="text-xl font-bold text-gray-800 mb-2 group-hover:text-green-600 transition-colors line-clamp-2">
                                        {article.title}
                                    </h3>
                                    <div className="mt-auto pt-4 flex items-center justify-between text-sm text-gray-500 border-t border-gray-50">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-2" />
                                            <span>{article.author.full_name}</span>
                                        </div>
                                        <span>{new Date(article.created_at).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </Link>

                        {/* Action Buttons */}
                        {canModifyArticle(article) && (
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                <Link
                                    to={`/articles/edit/${article.id}`}
                                    onClick={(e) => e.stopPropagation()}
                                    className="p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 shadow-md"
                                    title="Edit"
                                >
                                    <Edit className="h-4 w-4" />
                                </Link>
                                <button
                                    onClick={(e) => handleDeleteClick(article.id, e)}
                                    disabled={deleting}
                                    className="p-2 bg-red-600 text-white rounded-lg hover:bg-red-700 shadow-md disabled:opacity-50"
                                    title="Delete"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {articles.length === 0 && (
                <div className="text-center py-20 bg-white rounded-xl border border-gray-100">
                    <BookOpen className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-600">No articles found</h3>
                    <p className="text-gray-400">Check back later for new content.</p>
                </div>
            )}
        </div>
    );
};

export default ArticleListPage;
