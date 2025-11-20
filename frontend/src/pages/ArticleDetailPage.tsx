import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Calendar, User, Tag } from 'lucide-react';

interface Article {
    id: number;
    title: string;
    content: string;
    category: string;
    thumbnail_url?: string;
    created_at: string;
    author: {
        full_name: string;
    };
}

const ArticleDetailPage = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [article, setArticle] = useState<Article | null>(null);

    useEffect(() => {
        fetchArticle();
    }, [id]);

    const fetchArticle = async () => {
        try {
            const res = await api.get(`/articles/${id}`);
            setArticle(res.data);
        } catch (err) {
            console.error(err);
            navigate('/articles');
        }
    };

    if (!article) return <div className="p-8 text-center">Loading...</div>;

    return (
        <div className="max-w-4xl mx-auto mt-8 mb-12">
            <button
                onClick={() => navigate('/articles')}
                className="flex items-center text-gray-500 hover:text-gray-800 mb-6 transition-colors"
            >
                <ArrowLeft className="h-5 w-5 mr-2" />
                Back to Articles
            </button>

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
