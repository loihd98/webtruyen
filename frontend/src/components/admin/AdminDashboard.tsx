"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../store";
import { useLanguage } from "../../contexts/LanguageContext";
import Layout from "../layout/Layout";
import AdminStats from "./AdminStats";
import AdminStoryManager from "./AdminStoryManager";
import AdminChapterManager from "./AdminChapterManager";
import AdminAffiliatePage from "./AdminAffiliatePage";
import AdminUserManager from "./AdminUserManager";
import AdminMediaUpload from "./AdminMediaUpload";
import AdminSystemSettings from "./AdminSystemSettings";
import AdminGenresManager from "./AdminGenresManager";
import AdminSidebar from "./AdminSidebar";
import { AdminTab } from "../../types/admin";

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);
  const [showUserDropdown, setShowUserDropdown] = useState(false);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  const handleLogout = () => {
    // Clear auth data
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");

    // Redirect to home page
    window.location.href = "/";
  };

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/auth/login?redirect=/admin");
      return;
    }

    if (user?.role !== "ADMIN") {
      router.push("/");
      return;
    }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  useEffect(() => {
    router.replace(`/admin?tab=${activeTab}`);
  }, [activeTab]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (showUserDropdown) {
        const target = event.target as Element;
        if (!target.closest(".user-dropdown")) {
          setShowUserDropdown(false);
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showUserDropdown]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
          {t("common.loading")}
        </span>
      </div>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminStats />;
      case "stories":
        return <AdminStoryManager />;
      case "chapters":
        return <AdminChapterManager />;
      case "genres":
        return <AdminGenresManager />;
      case "affiliate-links":
        return <AdminAffiliatePage />;
      case "users":
        return <AdminUserManager />;
      case "media":
        return <AdminMediaUpload />;
      case "settings":
        return <AdminSystemSettings />;
      default:
        return <AdminStats />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen overflow-hidden">
        {/* Sidebar */}
        <AdminSidebar
          activeTab={activeTab}
          onTabChange={handleTabChange}
          user={user}
        />

        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden lg:ml-0">
          {/* Mobile Header */}
          <header className="lg:hidden bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6">
              <div className="flex items-center justify-between h-16">
                <button className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300">
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 6h16M4 12h16M4 18h16"
                    />
                  </svg>
                </button>
                <h1 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {t("admin.dashboard")}
                </h1>
                <div className="w-6"></div>
              </div>
            </div>
          </header>

          {/* Desktop Header */}
          <header className="hidden lg:block bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
            <div className="px-4 sm:px-6 lg:px-8">
              <div className="flex items-center justify-between h-16">
                <div className="flex items-center">
                  <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {t("admin.dashboard")}
                  </h1>
                </div>

                {/* User Info */}
                <div className="flex items-center space-x-4">
                  <div className="relative user-dropdown">
                    <button
                      onClick={() => setShowUserDropdown(!showUserDropdown)}
                      className="flex items-center space-x-3 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg p-2 transition-colors"
                    >
                      {user?.avatar ? (
                        <img
                          src={user.avatar}
                          alt={user.name}
                          className="h-8 w-8 rounded-full object-cover ring-2 ring-blue-500"
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white text-sm font-medium">
                          {user?.name.charAt(0).toUpperCase()}
                        </div>
                      )}
                      <div className="hidden md:block text-left">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {t("admin.role")}
                        </p>
                      </div>
                      <svg
                        className={`w-4 h-4 text-gray-500 transition-transform ${
                          showUserDropdown ? "rotate-180" : ""
                        }`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </button>

                    {/* Dropdown Menu */}
                    {showUserDropdown && (
                      <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
                        <div className="py-2">
                          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
                            <p className="text-sm font-medium text-gray-900 dark:text-white">
                              {user?.name}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              {user?.email}
                            </p>
                          </div>

                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              router.push("/");
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
                              />
                            </svg>
                            Về trang chủ
                          </button>

                          <button
                            onClick={() => {
                              setShowUserDropdown(false);
                              handleLogout();
                            }}
                            className="w-full text-left px-4 py-2 text-sm text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 flex items-center"
                          >
                            <svg
                              className="w-4 h-4 mr-2"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                              />
                            </svg>
                            Đăng xuất
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 overflow-auto p-4 sm:p-6 lg:p-8">
            <div className="max-w-7xl mx-auto">{renderActiveTab()}</div>
          </main>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
