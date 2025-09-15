import React, { useState, useEffect, useCallback } from 'react';
import api from './mockApi.ts';
import { User, UserRole } from './types.ts';
import { PlusCircleIcon, EditIcon, TrashIcon } from './icons.tsx';
import { useAuth } from './App.tsx';
import { Navigate } from 'react-router-dom';

const UserModal = ({ user, onClose, onSave }: { user: Partial<User> | null, onClose: () => void, onSave: (user: User) => void }) => {
    const [formData, setFormData] = useState<Partial<User>>({});
    const [allUsers, setAllUsers] = useState<User[]>([]);
    
    useEffect(() => {
        setFormData(user || {});
        api.getUsers().then(setAllUsers);
    }, [user]);

    if (!user) return null;

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSave = () => {
        onSave(formData as User);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h2 className="text-2xl font-bold mb-4">{user.id ? 'Edit User' : 'Add User'}</h2>
                <div className="space-y-4">
                    <input name="name" value={formData.name || ''} onChange={handleChange} placeholder="Name" className="w-full p-2 border rounded" />
                    <select name="role" value={formData.role || ''} onChange={handleChange} className="w-full p-2 border rounded">
                        {Object.values(UserRole).map(role => <option key={role} value={role}>{role}</option>)}
                    </select>
                    {formData.role === UserRole.USER && (
                        <select name="managerId" value={formData.managerId || ''} onChange={handleChange} className="w-full p-2 border rounded">
                             <option value="">Select Manager</option>
                            {allUsers.filter(u => u.role === UserRole.MANAGER).map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                    )}
                    <input name="level" value={formData.level || ''} onChange={handleChange} placeholder="Level" className="w-full p-2 border rounded" />
                    <input name="department" value={formData.department || ''} onChange={handleChange} placeholder="Department" className="w-full p-2 border rounded" />
                     <input name="doj" type="date" value={formData.doj || ''} onChange={handleChange} placeholder="Date of Joining" className="w-full p-2 border rounded" />
                </div>
                <div className="flex justify-end space-x-2 mt-6">
                    <button onClick={onClose} className="bg-gray-300 text-gray-800 px-4 py-2 rounded">Cancel</button>
                    <button onClick={handleSave} className="bg-primary text-white px-4 py-2 rounded">Save</button>
                </div>
            </div>
        </div>
    );
};


const AdminView: React.FC = () => {
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [editingUser, setEditingUser] = useState<Partial<User> | null>(null);

    const fetchUsers = useCallback(() => {
        api.getUsers().then(setUsers);
    }, []);

    useEffect(() => {
        fetchUsers();
    }, [fetchUsers]);

    if (user?.role !== UserRole.ADMIN) {
        return <Navigate to="/" />;
    }

    const handleSaveUser = async (userToSave: User) => {
        if (userToSave.id) {
            await api.updateUser(userToSave);
        } else {
            await api.createUser(userToSave);
        }
        setEditingUser(null);
        fetchUsers();
    };

    const handleDeleteUser = async (userId: string) => {
        if (window.confirm('Are you sure you want to delete this user?')) {
            await api.deleteUser(userId);
            fetchUsers();
        }
    };
    
    return (
        <div className="bg-white p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">User Management</h2>
                <button onClick={() => setEditingUser({})} className="flex items-center bg-primary text-white px-4 py-2 rounded hover:bg-sky-700">
                    <PlusCircleIcon className="w-5 h-5 mr-2" /> Add User
                </button>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Department</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map(u => (
                            <tr key={u.id}>
                                <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{u.role}</td>
                                <td className="px-6 py-4 whitespace-nowrap">{u.department}</td>
                                <td className="px-6 py-4 whitespace-nowrap space-x-2">
                                    <button onClick={() => setEditingUser(u)} className="text-blue-600 hover:text-blue-900"><EditIcon className="w-5 h-5" /></button>
                                    <button onClick={() => handleDeleteUser(u.id)} className="text-red-600 hover:text-red-900"><TrashIcon className="w-5 h-5" /></button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {editingUser && <UserModal user={editingUser} onClose={() => setEditingUser(null)} onSave={handleSaveUser} />}
        </div>
    );
};

export default AdminView;
