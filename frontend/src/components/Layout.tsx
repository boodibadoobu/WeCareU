import React from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
    LayoutDashboard,
    Calendar,
    MessageSquare,
    FileText,
    LogOut,
    Menu,
    X,
    User,
    Activity
} from 'lucide-react';
import clsx from 'clsx';

const Layout = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const navItems = [
        { label: 'Dashboard', path: `/${user?.role.toLowerCase()}`, icon: LayoutDashboard, roles: ['STUDENT', 'COUNSELOR', 'ADMIN'] },
        { label: 'My Sessions', path: '/sessions', icon: Calendar, roles: ['STUDENT', 'COUNSELOR'] },
        { label: 'Stress Test', path: '/stress-test', icon: Activity, roles: ['STUDENT'] },
        { label: 'Articles', path: '/articles', icon: FileText, roles: ['STUDENT', 'COUNSELOR', 'ADMIN'] },
        { label: 'Anon Chat', path: '/anon-chat', icon: MessageSquare, roles: ['STUDENT'] },
        { label: 'Anon History', path: '/student/anon-history', icon: MessageSquare, roles: ['STUDENT'] },
        { label: 'Anon Chats', path: '/counselor/anon-chats', icon: MessageSquare, roles: ['COUNSELOR'] },
        { label: 'Requests', path: '/counselor/requests', icon: Calendar, roles: ['COUNSELOR'] },
        { label: 'Users', path: '/admin/users', icon: User, roles: ['ADMIN'] },
    ];

    const filteredNavItems = navItems.filter(item => item.roles.includes(user?.role || ''));

    return (
        <div className="min-h-screen bg-gray-50 flex">
            {/* Sidebar */}
            <aside className={clsx(
                "fixed inset-y-0 left-0 z-50 w-64 bg-white shadow-lg transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0",
                isSidebarOpen ? "translate-x-0" : "-translate-x-full"
            )}>
                <div className="h-full flex flex-col">
                    <div className="h-16 flex items-center justify-center border-b border-gray-100">
                        <h1 className="text-2xl font-bold text-green-600">WeCareU</h1>
                    </div>

                    <nav className="flex-1 p-4 space-y-1">
                        {filteredNavItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={clsx(
                                    "flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors",
                                    location.pathname === item.path
                                        ? "bg-green-50 text-green-700"
                                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                                )}
                            >
                                <item.icon className="h-5 w-5 mr-3" />
                                {item.label}
                            </Link>
                        ))}
                    </nav>

                    <div className="p-4 border-t border-gray-100">
                        <div className="flex items-center mb-4 px-4">
                            <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center text-green-700 font-bold">
                                {user?.name.charAt(0)}
                            </div>
                            <div className="ml-3">
                                <p className="text-sm font-medium text-gray-700">{user?.name}</p>
                                <p className="text-xs text-gray-500 capitalize">{user?.role.toLowerCase()}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center px-4 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="h-5 w-5 mr-3" />
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Main Content */}
            <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
                <header className="bg-white shadow-sm lg:hidden">
                    <div className="h-16 flex items-center justify-between px-4">
                        <h1 className="text-xl font-bold text-green-600">WeCareU</h1>
                        <button
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                        >
                            {isSidebarOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-4 sm:p-8">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Layout;
