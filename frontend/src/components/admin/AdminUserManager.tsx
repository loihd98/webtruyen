"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { User } from "../../types";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  premiumUsers: number;
}

const AdminUserManager: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({ totalUsers: 0, activeUsers: 0, newUsers: 0, premiumUsers: 0 });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "PREMIUM" | "ADMIN">("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "ACTIVE" | "INACTIVE" | "BANNED">("ALL");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      setTimeout(() => {
        const mockUsers: User[] = [
          {
            id: "1",
            username: "admin_user",
            name: "Administrator",
            email: "admin@example.com",
            displayName: "Administrator",
            avatar: "https://via.placeholder.com/100x100?text=ADMIN",
            role: "ADMIN",
            status: "ACTIVE",
            createdAt: "2025-01-01T00:00:00Z",
            lastLoginAt: "2025-09-22T10:30:00Z",
            _count: {
              stories: 5,
              bookmarks: 23,
              comments: 45,
              unlockedChapters: 0
            }
          },
          {
            id: "2",
            username: "premium_user",
            name: "Người dùng VIP",
            email: "premium@example.com",
            displayName: "Người dùng VIP",
            avatar: "https://via.placeholder.com/100x100?text=VIP",
            role: "PREMIUM",
            status: "ACTIVE",
            createdAt: "2025-02-15T00:00:00Z",
            lastLoginAt: "2025-09-22T09:15:00Z",
            _count: {
              stories: 0,
              bookmarks: 156,
              comments: 89,
              unlockedChapters: 25
            }
          },
          {
            id: "3",
            username: "regular_user",
            name: "Người đọc thường",
            email: "user@example.com",
            displayName: "Người đọc thường",
            avatar: "https://via.placeholder.com/100x100?text=USER",
            role: "USER",
            status: "ACTIVE",
            createdAt: "2025-03-10T00:00:00Z",
            lastLoginAt: "2025-09-21T18:45:00Z",
            _count: {
              stories: 0,
              bookmarks: 12,
              comments: 5,
              unlockedChapters: 2
            }
          },
          {
            id: "4",
            username: "inactive_user",
            name: "Tài khoản ngừng hoạt động",
            email: "inactive@example.com",
            displayName: "Tài khoản ngừng hoạt động",
            role: "USER",
            status: "INACTIVE",
            createdAt: "2025-01-20T00:00:00Z",
            lastLoginAt: "2025-07-15T00:00:00Z",
            _count: {
              stories: 0,
              bookmarks: 3,
              comments: 1,
              unlockedChapters: 0
            }
          },
          {
            id: "5",
            username: "banned_user",
            name: "Tài khoản bị cấm",
            email: "banned@example.com",
            displayName: "Tài khoản bị cấm",
            role: "USER",
            status: "BANNED",
            createdAt: "2025-02-05T00:00:00Z",
            lastLoginAt: "2025-08-01T00:00:00Z",
            _count: {
              stories: 0,
              bookmarks: 0,
              comments: 0,
              unlockedChapters: 0
            }
          }
        ];
        setUsers(mockUsers);
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching users:", error);
      setIsLoading(false);
    }
  };

  const fetchStats = async () => {
    // Mock stats - replace with actual API call
    setStats({
      totalUsers: 12567,
      activeUsers: 8934,
      newUsers: 234,
      premiumUsers: 1456
    });
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.username || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (user.displayName && user.displayName.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = filterRole === "ALL" || user.role === filterRole;
    const matchesStatus = filterStatus === "ALL" || user.status === filterStatus;
    
    return matchesSearch && matchesRole && matchesStatus;
  });

  const handleStatusChange = async (userId: string, newStatus: "ACTIVE" | "INACTIVE" | "BANNED") => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, status: newStatus } : user
    ));
  };

  const handleRoleChange = async (userId: string, newRole: "USER" | "PREMIUM" | "ADMIN") => {
    setUsers(prev => prev.map(user => 
      user.id === userId ? { ...user, role: newRole } : user
    ));
  };

  const handleDeleteUser = async (userId: string) => {
    if (window.confirm(t("admin.users.confirm_delete"))) {
      setUsers(prev => prev.filter(user => user.id !== userId));
    }
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "👑 " + t("admin.users.role_admin") },
      PREMIUM: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: "⭐ " + t("admin.users.role_premium") },
      USER: { color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200", text: "👤 " + t("admin.users.role_user") },
    };
    
    const config = roleConfig[role as keyof typeof roleConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: { color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200", text: "🟢 " + t("admin.users.status_active") },
      INACTIVE: { color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200", text: "⏸️ " + t("admin.users.status_inactive") },
      BANNED: { color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200", text: "🚫 " + t("admin.users.status_banned") },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}>
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="animate-pulse">
                <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-3/4 mb-2"></div>
                <div className="h-6 bg-gray-300 dark:bg-gray-600 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-16 bg-gray-300 dark:bg-gray-600 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👥</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.users.total_users")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.totalUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🟢</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.users.active_users")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.activeUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🆕</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.users.new_users")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.newUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">⭐</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{t("admin.users.premium_users")}</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">{stats.premiumUsers.toLocaleString()}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Users Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.users.title")}
            </h3>
            <button
              onClick={() => setShowUserModal(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
            >
              + {t("admin.users.create_new")}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.users.search")}
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder={t("admin.users.search_placeholder")}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.users.role")}
              </label>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t("admin.users.all_roles")}</option>
                <option value="ADMIN">{t("admin.users.role_admin")}</option>
                <option value="PREMIUM">{t("admin.users.role_premium")}</option>
                <option value="USER">{t("admin.users.role_user")}</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.users.status")}
              </label>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value as any)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="ALL">{t("admin.users.all_statuses")}</option>
                <option value="ACTIVE">{t("admin.users.status_active")}</option>
                <option value="INACTIVE">{t("admin.users.status_inactive")}</option>
                <option value="BANNED">{t("admin.users.status_banned")}</option>
              </select>
            </div>

            <div className="flex items-end">
              <button
                onClick={fetchUsers}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 {t("admin.users.refresh")}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.user")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.role")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.status")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.activity")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.stats")}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  {t("admin.users.actions")}
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={user.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.username || user.name)}&background=random`}
                        alt={user.username || user.name}
                        className="h-10 w-10 rounded-full object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {user.displayName || user.username || user.name}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-400">
                          {user.email}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {getRoleBadge(user.role)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {user.status ? getStatusBadge(user.status) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>📅 {new Date(user.createdAt).toLocaleDateString()}</div>
                      {user.lastLoginAt && (
                        <div>🕐 {new Date(user.lastLoginAt).toLocaleDateString()}</div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>📚 {user._count?.stories || 0}</div>
                      <div>🔖 {user._count?.bookmarks || 0}</div>
                      <div>💬 {user._count?.comments || 0}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setEditingUser(user)}
                        className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                      >
                        ✏️
                      </button>
                      <select
                        value={user.status || "ACTIVE"}
                        onChange={(e) => handleStatusChange(user.id, e.target.value as "ACTIVE" | "INACTIVE" | "BANNED")}
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white"
                      >
                        <option value="ACTIVE">Active</option>
                        <option value="INACTIVE">Inactive</option>
                        <option value="BANNED">Banned</option>
                      </select>
                      <button
                        onClick={() => handleDeleteUser(user.id)}
                        className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm ? t("admin.users.no_results") : t("admin.users.no_users")}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminUserManager;