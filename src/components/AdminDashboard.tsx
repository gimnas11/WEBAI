import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, getDocs, query, orderBy, updateDoc, doc } from 'firebase/firestore';
import { db } from '../config/firebase';
import { useToast } from '../hooks/useToast';

interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: 'admin' | 'user';
  createdAt?: any;
  updatedAt?: any;
}

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
}

interface AdminDashboardProps {
  user: User;
  onLogout: () => void;
}

export function AdminDashboard({ user, onLogout }: AdminDashboardProps) {
  const navigate = useNavigate();
  const { success, error: showError } = useToast();
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [roleChangeConfirm, setRoleChangeConfirm] = useState<{ userId: string; userName: string; currentRole: 'admin' | 'user'; newRole: 'admin' | 'user' } | null>(null);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalChats: 0,
    totalFiles: 0,
  });

  // Load users from Firestore
  const loadUsers = async () => {
    if (!db) {
      showError('Firestore tidak tersedia');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const usersList: UserData[] = [];
      let adminCount = 0;
      let userCount = 0;

      querySnapshot.forEach((docSnapshot) => {
        const data = docSnapshot.data();
        usersList.push({
          id: docSnapshot.id,
          email: data.email || '',
          displayName: data.displayName || 'User',
          role: data.role || 'user',
          createdAt: data.createdAt,
          updatedAt: data.updatedAt,
        });

        if (data.role === 'admin') {
          adminCount++;
        } else {
          userCount++;
        }
      });

      setUsers(usersList);
      setStats({
        totalUsers: usersList.length,
        totalChats: 0, // TODO: Implement chat counting
        totalFiles: 0, // TODO: Implement file counting
      });
    } catch (error) {
      console.error('Error loading users:', error);
      showError('Gagal memuat data users');
    } finally {
      setLoading(false);
    }
  };

  const handleRoleChange = (userId: string, userName: string, currentRole: 'admin' | 'user', newRole: 'admin' | 'user') => {
    setRoleChangeConfirm({ userId, userName, currentRole, newRole });
  };

  const confirmRoleChange = async () => {
    if (!roleChangeConfirm) return;
    
    const { userId, newRole } = roleChangeConfirm;
    
    if (!db) {
      showError('Firestore tidak tersedia');
      setRoleChangeConfirm(null);
      return;
    }

    try {
      const userRef = doc(db, 'users', userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: new Date(),
      });

      // Update local state
      setUsers(prevUsers =>
        prevUsers.map(user =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        totalUsers: prevStats.totalUsers, // User count doesn't change
      }));

      success(`Role user berhasil diubah menjadi ${newRole}`);
      setRoleChangeConfirm(null);
    } catch (error) {
      console.error('Error updating user role:', error);
      showError('Gagal mengubah role user');
      setRoleChangeConfirm(null);
    }
  };

  useEffect(() => {
    // Check if user is admin
    if (user && user.role !== 'admin') {
      // Redirect to home if not admin
      navigate('/');
      return;
    }

    if (user && user.role === 'admin') {
      loadUsers();
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const handleBackToChat = () => {
    navigate('/');
  };

  const formatDate = (timestamp: any): string => {
    if (!timestamp) return 'N/A';
    try {
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      return date.toLocaleDateString('id-ID', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'N/A';
    }
  };

  if (!user || user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center bg-chat-darker">
        <div className="text-center">
          <p className="text-gray-400 text-lg mb-4">Akses ditolak</p>
          <p className="text-gray-500 text-sm">Hanya admin yang dapat mengakses halaman ini</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-chat-darker text-white">
      {/* Header */}
      <header className="bg-chat-dark border-b border-chat-border px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`${import.meta.env.BASE_URL}Gambar/ChatGPT_Image_Nov_11__2025__07_22_25_AM-removebg-preview.png`}
              alt="G Chat Logo"
              className="h-8 w-8 object-contain"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <h1 className="text-xl font-semibold">Admin Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-sm text-gray-400">
              {user.name}
            </span>
            <button
              onClick={handleBackToChat}
              className="px-4 py-2 text-sm font-medium text-gray-300 bg-chat-hover rounded-lg hover:bg-chat-border transition-colors"
            >
              Kembali ke Chat
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Users
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalUsers}
                </p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <svg className="w-6 h-6 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Chats
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalChats || 0}
                </p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <svg className="w-6 h-6 text-green-600 dark:text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Files
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {stats.totalFiles || 0}
                </p>
              </div>
              <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-full">
                <svg className="w-6 h-6 text-purple-600 dark:text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Users Management
            </h2>
            <button
              onClick={loadUsers}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Refresh
            </button>
          </div>
          <div className="p-6">
            {loading ? (
              <div className="text-center py-8">
                <div className="text-gray-600 dark:text-gray-400">Loading...</div>
              </div>
            ) : users.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600 dark:text-gray-400">
                  No users found. User management features coming soon.
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Name
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Email
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Role
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Created At
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {users.map((u) => (
                      <tr key={u.id}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                          {u.displayName}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {u.email}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                            u.role === 'admin' 
                              ? 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200' 
                              : 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200'
                          }`}>
                            {u.role}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                          {formatDate(u.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          {u.id !== user.id && (
                            <button
                              onClick={() =>
                                handleRoleChange(u.id, u.displayName, u.role, u.role === 'admin' ? 'user' : 'admin')
                              }
                              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                                u.role === 'admin'
                                  ? 'bg-yellow-600/20 text-yellow-400 hover:bg-yellow-600/30 border border-yellow-600/30'
                                  : 'bg-green-600/20 text-green-400 hover:bg-green-600/30 border border-green-600/30'
                              }`}
                            >
                              {u.role === 'admin' ? 'Make User' : 'Make Admin'}
                            </button>
                          )}
                          {u.id === user.id && (
                            <span className="text-xs text-gray-500 dark:text-gray-400">(You)</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}

