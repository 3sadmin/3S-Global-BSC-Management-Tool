import React, { useState, useEffect } from 'react';
import { useAuth } from './App.tsx';
import type { User } from './types.ts';
import api from './mockApi.ts';

const Login: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<string>('');
  const { login, loading } = useAuth();

  useEffect(() => {
    api.getUsers().then(setUsers);
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedUserId) {
      login(selectedUserId);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800">3S Global</h1>
          <p className="text-secondary mt-2">BSC Management Portal</p>
        </div>
        <form onSubmit={handleLogin}>
          <div className="mb-6">
            <label htmlFor="user-select" className="block text-sm font-medium text-slate-700 mb-2">
              Select User to Login
            </label>
            <select
              id="user-select"
              value={selectedUserId}
              onChange={(e) => setSelectedUserId(e.target.value)}
              className="w-full px-4 py-2 border border-slate-300 rounded-md shadow-sm focus:ring-primary focus:border-primary"
            >
              <option value="" disabled>-- Please choose a user --</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.name} ({user.role})
                </option>
              ))}
            </select>
          </div>
          <button
            type="submit"
            disabled={!selectedUserId || loading}
            className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:bg-sky-300"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;
