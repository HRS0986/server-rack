'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Button from '../components/Button';
import LoadingSpinner from '../components/LoadingSpinner';
import RoleGuard from '../components/RoleGuard';

export default function AdminPage() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [isLoadingUsers, setIsLoadingUsers] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Fetch users when component mounts
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoadingUsers(true);
      // In a real application, this would be an Appwrite function call
      // Currently Appwrite doesn't expose a direct API to list all users to client-side code
      // You would need a server-side function or Cloud Function for this
      
      // Simulate fetching users for demo purposes
      setTimeout(() => {
        setUsers([
          { id: '1', name: 'Admin User', email: 'admin@example.com', labels: ['admin'] },
          { id: '2', name: 'Regular User', email: 'user@example.com', labels: [] },
          // More users would be listed here
        ]);
        setIsLoadingUsers(false);
      }, 1000);
    } catch (err) {
      setError('Failed to load users');
      setIsLoadingUsers(false);
      console.log('Error fetching users:', err);
    }
  };

  const toggleAdminRole = async (userId, isAdmin) => {
    try {
      // In a real app, this would call an Appwrite function to update user roles
      // Update UI optimistically
      setUsers(users.map(u => {
        if (u.id === userId) {
          const newLabels = isAdmin 
            ? u.labels.filter(l => l !== 'admin')
            : [...u.labels, 'admin'];
          return { ...u, labels: newLabels };
        }
        return u;
      }));
      
      // Success message would normally show after API call completes
    } catch (err) {
      setError('Failed to update user role');
      console.log('Error updating role:', err);
      // Would revert the UI change here
    }
  };

  if (isLoadingUsers) {
    return <LoadingSpinner />;
  }

  return (
    <RoleGuard requiredRole="admin">
      <div className="min-h-screen bg-gray-900">
        <Navbar />
        
        <main className="max-w-6xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
          <div className="bg-gray-800 rounded-lg shadow p-6">
            <h1 className="text-2xl font-bold text-white mb-6">Admin Dashboard</h1>
            
            {error && (
              <div className="mb-6 bg-red-900 border border-red-700 text-white px-4 py-3 rounded relative">
                <span className="block sm:inline">{error}</span>
              </div>
            )}
            
            <div className="mb-6">
              <h2 className="text-xl font-semibold text-gray-200 mb-2">User Management</h2>
              <p className="text-gray-400">Manage user roles and permissions</p>
            </div>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-700">
                <thead className="bg-gray-700">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Name
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Email
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Role
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-gray-800 divide-y divide-gray-700">
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-white">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {user.labels.includes('admin') ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-900 text-blue-200">
                            Admin
                          </span>
                        ) : (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-700 text-gray-300">
                            User
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                        <Button
                          variant={user.labels.includes('admin') ? "secondary" : "primary"}
                          size="sm"
                          onClick={() => toggleAdminRole(user.id, user.labels.includes('admin'))}
                        >
                          {user.labels.includes('admin') ? 'Remove Admin' : 'Make Admin'}
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </RoleGuard>
  );
}