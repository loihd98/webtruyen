"use client";

import React, { useState, useEffect, useCallback } from "react";
import { useLanguage } from "../../contexts/LanguageContext";
import { User } from "../../types";
import apiClient from "../../utils/api";
import toast from "react-hot-toast";
import Modal from "./Modal";

interface UserStats {
  totalUsers: number;
  activeUsers: number;
  newUsers: number;
  adminUsers: number;
}

interface PaginationData {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

const AdminUserManager: React.FC = () => {
  const { t } = useLanguage();
  const [users, setUsers] = useState<User[]>([]);
  const [stats, setStats] = useState<UserStats>({
    totalUsers: 0,
    activeUsers: 0,
    newUsers: 0,
    adminUsers: 0,
  });
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    limit: 20,
    total: 0,
    pages: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterRole, setFilterRole] = useState<"ALL" | "USER" | "ADMIN">("ALL");
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [updatingUsers, setUpdatingUsers] = useState<Set<string>>(new Set());
  const [deletingUsers, setDeletingUsers] = useState<Set<string>>(new Set());
  const [userForm, setUserForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "USER" as "USER" | "ADMIN",
  });

  useEffect(() => {
    fetchUsers();
    fetchStats();
  }, [searchTerm, filterRole, pagination.page]);

  const fetchUsers = useCallback(async () => {
    try {
      setIsLoading(true);

      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      if (filterRole !== "ALL") {
        params.append("role", filterRole);
      }

      const response = await apiClient.get(`/admin/users?${params}`);
      setUsers(response.data.users);
      setPagination(response.data.pagination);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast.error("Có lỗi xảy ra khi lấy danh sách người dùng");
    } finally {
      setIsLoading(false);
    }
  }, [searchTerm, filterRole, pagination.page, pagination.limit]);

  const fetchStats = async () => {
    try {
      const response = await apiClient.get("/admin/dashboard/stats");
      const statsData = response.data;
      setStats({
        totalUsers: statsData.totalUsers || 0,
        activeUsers: statsData.activeUsers || 0,
        newUsers: statsData.newUsers || 0,
        adminUsers: statsData.adminUsers || 0,
      });
    } catch (error) {
      console.error("Error fetching stats:", error);
      // Keep default stats if API fails
    }
  };

  // Since we're fetching filtered data from API, we can display users directly
  const filteredUsers = users;

  const handleRoleChange = async (
    userId: string,
    newRole: "USER" | "ADMIN"
  ) => {
    if (updatingUsers.has(userId)) return;

    try {
      setUpdatingUsers((prev) => new Set(Array.from(prev).concat([userId])));

      const response = await apiClient.patch(`/admin/users/${userId}/role`, {
        role: newRole,
      });
      const data = response.data;

      // Update local state
      setUsers((prev) =>
        prev.map((user) =>
          user.id === userId ? { ...user, role: newRole } : user
        )
      );

      toast.success(data.message || "Cập nhật role thành công");
    } catch (error: any) {
      console.error("Error updating user role:", error);
      toast.error(error.message || "Có lỗi xảy ra khi cập nhật role");
    } finally {
      setUpdatingUsers((prev) => {
        const newArray = Array.from(prev).filter((id) => id !== userId);
        return new Set(newArray);
      });
    }
  };

  const handleRefresh = () => {
    setPagination((prev) => ({ ...prev, page: 1 }));
    fetchUsers();
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!userForm.name || !userForm.email || !userForm.password) {
      toast.error("Vui lòng điền đầy đủ thông tin");
      return;
    }

    try {
      const response = await apiClient.post("/admin/users", userForm);
      const newUser = response.data.user;

      setUsers((prev) => [newUser, ...prev]);
      setShowUserModal(false);
      setUserForm({ name: "", email: "", password: "", role: "USER" });
      toast.success("Tạo người dùng thành công");
      fetchUsers(); // Refresh to get updated data
      fetchStats(); // Update stats
    } catch (error: any) {
      console.error("Error creating user:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi tạo người dùng"
      );
    }
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
    setUserForm({
      name: user.name || "",
      email: user.email || "",
      password: "", // Don't pre-fill password
      role: user.role as "USER" | "ADMIN",
    });
    setShowUserModal(true);
  };

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!editingUser) return;

    try {
      const updateData: any = {
        name: userForm.name.trim(),
        email: userForm.email.trim(),
        role: userForm.role,
      };

      // Only include password if provided
      if (userForm.password.trim()) {
        updateData.password = userForm.password;
      }

      const response = await apiClient.patch(
        `/admin/users/${editingUser.id}`,
        updateData
      );
      const { data } = response;

      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingUser.id ? { ...user, ...data.user } : user
        )
      );

      toast.success(data.message || "Cập nhật người dùng thành công");
      handleCloseModal();
      fetchStats(); // Update stats
    } catch (error: any) {
      console.error("Error updating user:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi cập nhật người dùng"
      );
    }
  };

  const handleDeleteUser = async (userId: string, userName: string) => {
    if (
      !confirm(
        `Bạn có chắc chắn muốn xóa người dùng "${userName}"? Hành động này không thể hoàn tác.`
      )
    ) {
      return;
    }

    if (deletingUsers.has(userId)) return;

    try {
      setDeletingUsers((prev) => new Set(Array.from(prev).concat([userId])));

      await apiClient.delete(`/admin/users/${userId}`);

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      toast.success("Xóa người dùng thành công");
      fetchStats(); // Update stats
    } catch (error: any) {
      console.error("Error deleting user:", error);
      toast.error(
        error.response?.data?.message || "Có lỗi xảy ra khi xóa người dùng"
      );
    } finally {
      setDeletingUsers((prev) => {
        const newArray = Array.from(prev).filter((id) => id !== userId);
        return new Set(newArray);
      });
    }
  };

  const handleCloseModal = () => {
    setShowUserModal(false);
    setEditingUser(null);
    setUserForm({ name: "", email: "", password: "", role: "USER" });
  };

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      ADMIN: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        text: "👑 Admin",
      },
      USER: {
        color: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200",
        text: "👤 User",
      },
    };

    const config =
      roleConfig[role as keyof typeof roleConfig] || roleConfig.USER;
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      ACTIVE: {
        color:
          "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
        text: "🟢 " + t("admin.users.status_active"),
      },
      INACTIVE: {
        color:
          "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200",
        text: "⏸️ " + t("admin.users.status_inactive"),
      },
      BANNED: {
        color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200",
        text: "🚫 " + t("admin.users.status_banned"),
      },
    };

    const config = statusConfig[status as keyof typeof statusConfig];
    return (
      <span
        className={`px-2 py-1 text-xs font-medium rounded-full ${config.color}`}
      >
        {config.text}
      </span>
    );
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6"
            >
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
                <div
                  key={i}
                  className="h-16 bg-gray-300 dark:bg-gray-600 rounded"
                ></div>
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
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("admin.users.total_users")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🟢</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("admin.users.active_users")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.activeUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">🆕</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                {t("admin.users.new_users")}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.newUsers.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center">
            <div className="text-3xl mr-4">👑</div>
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Admin Users
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.adminUsers.toLocaleString()}
              </p>
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
                Total Users
              </label>
              <div className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-700">
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  {pagination.total.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">
                  users found
                </span>
              </div>
            </div>

            <div className="flex items-end">
              <button
                onClick={handleRefresh}
                disabled={isLoading}
                className="w-full bg-gray-600 hover:bg-gray-700 disabled:bg-gray-400 text-white px-4 py-2 rounded-lg font-medium transition-colors"
              >
                🔄 {isLoading ? "Loading..." : "Refresh"}
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
                  STT
                </th>
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
              {filteredUsers.map((user, index) => (
                <tr
                  key={user.id}
                  className="hover:bg-gray-50 dark:hover:bg-gray-700"
                >
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {(pagination.page - 1) * pagination.limit + index + 1}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <img
                        src={
                          user.avatar ||
                          `https://ui-avatars.com/api/?name=${encodeURIComponent(
                            user.username || user.name
                          )}&background=random`
                        }
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
                    {user.status ? (
                      getStatusBadge(user.status)
                    ) : (
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200">
                        Unknown
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    <div className="space-y-1">
                      <div>
                        📅 {new Date(user.createdAt).toLocaleDateString()}
                      </div>
                      {user.lastLoginAt && (
                        <div>
                          🕐 {new Date(user.lastLoginAt).toLocaleDateString()}
                        </div>
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
                    <div className="flex space-x-2 items-center">
                      <select
                        value={user.role}
                        onChange={(e) =>
                          handleRoleChange(
                            user.id,
                            e.target.value as "USER" | "ADMIN"
                          )
                        }
                        disabled={
                          updatingUsers.has(user.id) ||
                          deletingUsers.has(user.id)
                        }
                        className="text-xs px-2 py-1 border border-gray-300 dark:border-gray-600 rounded dark:bg-gray-700 dark:text-white disabled:opacity-50"
                      >
                        <option value="USER">User</option>
                        <option value="ADMIN">Admin</option>
                      </select>

                      <button
                        onClick={() => handleEditUser(user)}
                        disabled={
                          updatingUsers.has(user.id) ||
                          deletingUsers.has(user.id)
                        }
                        className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-blue-50 dark:hover:bg-blue-900"
                        title="Chỉnh sửa người dùng"
                      >
                        <svg
                          className="w-4 h-4"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                        </svg>
                      </button>

                      <button
                        onClick={() =>
                          handleDeleteUser(
                            user.id,
                            user.displayName || user.username || user.name
                          )
                        }
                        disabled={
                          updatingUsers.has(user.id) ||
                          deletingUsers.has(user.id)
                        }
                        className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed p-1 rounded hover:bg-red-50 dark:hover:bg-red-900"
                        title="Xóa người dùng"
                      >
                        {deletingUsers.has(user.id) ? (
                          <div className="animate-spin text-red-500">⚪</div>
                        ) : (
                          <svg
                            className="w-4 h-4"
                            fill="currentColor"
                            viewBox="0 0 20 20"
                          >
                            <path
                              fillRule="evenodd"
                              d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                              clipRule="evenodd"
                            />
                          </svg>
                        )}
                      </button>

                      {updatingUsers.has(user.id) &&
                        !deletingUsers.has(user.id) && (
                          <div className="animate-spin text-blue-500">⚪</div>
                        )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredUsers.length === 0 && !isLoading && (
          <div className="text-center py-12">
            <div className="text-gray-400 text-4xl mb-4">👥</div>
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm
                ? "No users found matching your search"
                : "No users found"}
            </p>
          </div>
        )}

        {isLoading && (
          <div className="text-center py-12">
            <div className="animate-spin text-4xl mb-4">⚪</div>
            <p className="text-gray-500 dark:text-gray-400">Loading users...</p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {pagination.pages > 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-700 dark:text-gray-300">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} users
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page - 1 }))
                }
                disabled={pagination.page <= 1 || isLoading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded border dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Previous
              </button>

              {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                const pageNum = pagination.page - 2 + i;
                if (pageNum < 1 || pageNum > pagination.pages) return null;

                return (
                  <button
                    key={pageNum}
                    onClick={() =>
                      setPagination((prev) => ({ ...prev, page: pageNum }))
                    }
                    disabled={isLoading}
                    className={`px-3 py-1 text-sm rounded border ${
                      pageNum === pagination.page
                        ? "bg-blue-500 text-white border-blue-500"
                        : "bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
                    } disabled:opacity-50 disabled:cursor-not-allowed`}
                  >
                    {pageNum}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  setPagination((prev) => ({ ...prev, page: prev.page + 1 }))
                }
                disabled={pagination.page >= pagination.pages || isLoading}
                className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded border dark:bg-gray-700 dark:hover:bg-gray-600 dark:text-white"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* User Creation Modal */}
      <Modal
        isOpen={showUserModal}
        onClose={handleCloseModal}
        title={editingUser ? "Chỉnh sửa người dùng" : "Tạo người dùng mới"}
      >
        <form
          onSubmit={editingUser ? handleUpdateUser : handleCreateUser}
          className="space-y-4"
        >
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Tên người dùng *
            </label>
            <input
              type="text"
              value={userForm.name}
              onChange={(e) =>
                setUserForm({ ...userForm, name: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập tên người dùng"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Email *
            </label>
            <input
              type="email"
              value={userForm.email}
              onChange={(e) =>
                setUserForm({ ...userForm, email: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder="Nhập email"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Mật khẩu{" "}
              {editingUser ? "(để trống nếu không muốn thay đổi)" : "*"}
            </label>
            <input
              type="password"
              value={userForm.password}
              onChange={(e) =>
                setUserForm({ ...userForm, password: e.target.value })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              placeholder={
                editingUser ? "Nhập mật khẩu mới (tùy chọn)" : "Nhập mật khẩu"
              }
              minLength={6}
              required={!editingUser}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Vai trò
            </label>
            <select
              value={userForm.role}
              onChange={(e) =>
                setUserForm({
                  ...userForm,
                  role: e.target.value as "USER" | "ADMIN",
                })
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="USER">👤 User</option>
              <option value="ADMIN">👑 Admin</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={handleCloseModal}
              className="px-4 py-2 text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg font-medium transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
            >
              {editingUser ? "Cập nhật người dùng" : "Tạo người dùng"}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default AdminUserManager;
