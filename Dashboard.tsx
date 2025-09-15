import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useAuth } from './App.tsx';
import { Bsc, BscStatus, UserRole } from './types.ts';
import api from './mockApi.ts';
import { FileTextIcon, UsersIcon, HomeIcon, PlusCircleIcon } from './icons.tsx';

const StatusBadge = ({ status }: { status: BscStatus }) => {
    const statusConfig = {
        [BscStatus.APPROVED]: 'bg-green-100 text-green-800',
        [BscStatus.PENDING_CEO]: 'bg-yellow-100 text-yellow-800',
        [BscStatus.PENDING_MANAGER]: 'bg-yellow-100 text-yellow-800',
        [BscStatus.REJECTED_BY_CEO]: 'bg-red-100 text-red-800',
        [BscStatus.REJECTED_BY_MANAGER]: 'bg-red-100 text-red-800',
        [BscStatus.QUERIED_BY_MANAGER]: 'bg-blue-100 text-blue-800',
        [BscStatus.DRAFT]: 'bg-gray-100 text-gray-800',
    };
    return (
        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${statusConfig[status] || 'bg-gray-100 text-gray-800'}`}>
            {status}
        </span>
    );
};

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [bscs, setBscs] = useState<Bsc[]>([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    useEffect(() => {
        if (!user) return;
        setLoading(true);
        let fetchBscs;
        if (user.role === UserRole.USER) {
            fetchBscs = api.getBscsByUserId(user.id);
        } else if (user.role === UserRole.MANAGER) {
            fetchBscs = api.getBscsForManager(user.id);
        } else { // CEO & Admin
            fetchBscs = api.getBscs();
        }
        
        fetchBscs.then(data => {
            setBscs(data);
            setLoading(false);
        });
    }, [user]);

    if (loading) return <div>Loading dashboard...</div>;
    if (!user) return null;

    const statusCounts = bscs.reduce((acc, bsc) => {
        acc[bsc.status] = (acc[bsc.status] || 0) + 1;
        return acc;
    }, {} as Record<BscStatus, number>);

    const chartData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
    const COLORS = {
        [BscStatus.APPROVED]: '#22c55e',
        [BscStatus.PENDING_CEO]: '#f59e0b',
        [BscStatus.PENDING_MANAGER]: '#facc15',
        [BscStatus.REJECTED_BY_CEO]: '#ef4444',
        [BscStatus.REJECTED_BY_MANAGER]: '#f87171',
        [BscStatus.QUERIED_BY_MANAGER]: '#3b82f6',
        [BscStatus.DRAFT]: '#6b7280',
    };

    const pendingReviewCount = user.role === UserRole.MANAGER ? statusCounts[BscStatus.PENDING_MANAGER] || 0 : statusCounts[BscStatus.PENDING_CEO] || 0;

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-gray-800">Welcome, {user.name}!</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-sky-100 p-3 rounded-full"><HomeIcon className="w-6 h-6 text-sky-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Role</p>
                        <p className="text-lg font-semibold text-gray-800">{user.role}</p>
                    </div>
                </div>
                 <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                    <div className="bg-green-100 p-3 rounded-full"><FileTextIcon className="w-6 h-6 text-green-600" /></div>
                    <div>
                        <p className="text-sm text-gray-500">Total BSCs</p>
                        <p className="text-lg font-semibold text-gray-800">{bscs.length}</p>
                    </div>
                </div>
                {user.role !== UserRole.USER && (
                    <div className="bg-white p-6 rounded-lg shadow-md flex items-center space-x-4">
                        <div className="bg-yellow-100 p-3 rounded-full"><UsersIcon className="w-6 h-6 text-yellow-600" /></div>
                        <div>
                            <p className="text-sm text-gray-500">Pending Review</p>
                            <p className="text-lg font-semibold text-gray-800">{pendingReviewCount}</p>
                        </div>
                    </div>
                )}
                 {user.role === UserRole.USER && (
                    <button onClick={() => navigate('/bsc/new')} className="bg-primary text-white p-6 rounded-lg shadow-md flex items-center justify-center space-x-4 hover:bg-sky-700 transition-colors">
                        <PlusCircleIcon className="w-8 h-8"/>
                        <p className="text-lg font-semibold">Create New BSC</p>
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
                <div className="lg:col-span-3 bg-white p-6 rounded-lg shadow-md">
                    <h3 className="text-xl font-semibold text-gray-800 mb-4">BSC Overview</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {bscs.map(bsc => (
                                    <tr key={bsc.id}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{bsc.userName}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{bsc.date}</td>
                                        <td className="px-6 py-4 whitespace-nowrap"><StatusBadge status={bsc.status} /></td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <button onClick={() => navigate(`/bsc/${bsc.id}`)} className="text-primary hover:text-sky-700 font-medium text-sm">View Details</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
                {user.role !== UserRole.USER && (
                    <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow-md">
                        <h3 className="text-xl font-semibold text-gray-800 mb-4">Status Distribution</h3>
                        <ResponsiveContainer width="100%" height={300}>
                            <PieChart>
                                <Pie data={chartData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} fill="#8884d8" label>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[entry.name as BscStatus]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Dashboard;
