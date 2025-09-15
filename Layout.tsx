import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from './App.tsx';
import { UserRole } from './types.ts';
import { HomeIcon, FileTextIcon, UsersIcon, SettingsIcon, LogOutIcon, ChevronDownIcon } from './icons.tsx';

const Sidebar: React.FC = () => {
    const { user } = useAuth();

    const navItems = [
        { to: "/", icon: <HomeIcon className="w-5 h-5" />, text: "Dashboard", roles: [UserRole.USER, UserRole.MANAGER, UserRole.CEO, UserRole.ADMIN] },
        { to: `/bsc/new`, icon: <FileTextIcon className="w-5 h-5" />, text: "My BSC", roles: [UserRole.USER] },
        { to: "/", icon: <UsersIcon className="w-5 h-5" />, text: "Team BSCs", roles: [UserRole.MANAGER] },
        { to: "/", icon: <UsersIcon className="w-5 h-5" />, text: "Company BSCs", roles: [UserRole.CEO] },
        { to: "/admin", icon: <SettingsIcon className="w-5 h-5" />, text: "Admin Panel", roles: [UserRole.ADMIN] },
    ];

    return (
        <aside className="w-64 bg-slate-800 text-slate-100 flex flex-col">
            <div className="p-4 text-2xl font-bold text-white border-b border-slate-700">
                3S Global
            </div>
            <nav className="flex-1 px-2 py-4 space-y-2">
                {navItems.filter(item => user && item.roles.includes(user.role)).map(item => (
                    <NavLink
                        key={item.to}
                        to={item.to}
                        className={({ isActive }) =>
                            `flex items-center px-4 py-2.5 text-sm font-medium rounded-md transition-colors duration-200 ${
                            isActive ? 'bg-primary text-white' : 'hover:bg-slate-700 hover:text-white'
                            }`
                        }
                    >
                        {item.icon}
                        <span className="ml-3">{item.text}</span>
                    </NavLink>
                ))}
            </nav>
        </aside>
    );
};


const Header: React.FC = () => {
    const { user, logout } = useAuth();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    return (
        <header className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-16">
                    <h1 className="text-xl font-semibold text-gray-800">BSC Management Portal</h1>
                    <div className="relative">
                        <button onClick={() => setDropdownOpen(!dropdownOpen)} className="flex items-center space-x-2 p-2 rounded-md hover:bg-gray-100">
                            <span className="font-medium text-gray-700">{user?.name}</span>
                            <ChevronDownIcon className={`w-5 h-5 text-gray-500 transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} />
                        </button>
                        {dropdownOpen && (
                            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
                                <button
                                    onClick={() => { logout(); setDropdownOpen(false); }}
                                    className="w-full text-left flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                                >
                                    <LogOutIcon className="w-4 h-4 mr-2" />
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};


const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    return (
        <div className="flex h-screen bg-gray-100">
            <Sidebar />
            <div className="flex-1 flex flex-col overflow-hidden">
                <Header />
                <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-4 md:p-8">
                    {children}
                </main>
            </div>
        </div>
    );
};

export default Layout;
