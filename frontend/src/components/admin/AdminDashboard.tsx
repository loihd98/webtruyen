"use client";

import React, { useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useRouter } from "next/navigation";
import { RootState } from "../../store";
import { useLanguage } from "../../contexts/LanguageContext";
import Layout from "../layout/Layout";
import AdminStats from "./AdminStats";
import AdminStoryManager from "./AdminStoryManager";
import AdminUserManager from "./AdminUserManager";
import AdminMediaUpload from "./AdminMediaUpload";
import AdminSystemSettings from "./AdminSystemSettings";
import AdminSidebar from "./AdminSidebar";

type AdminTab = "dashboard" | "stories" | "users" | "media" | "settings";

const AdminDashboard: React.FC = () => {
  const { user, isAuthenticated } = useSelector(
    (state: RootState) => state.auth
  );
  const { t } = useLanguage();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<AdminTab>("dashboard");
  const [isLoading, setIsLoading] = useState(true);

  const handleTabChange = (tab: AdminTab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    // if (!isAuthenticated) {
    //   router.push("/auth/login?redirect=/admin");
    //   return;
    // }

    // if (user?.role !== "ADMIN") {
    //   router.push("/");
    //   return;
    // }

    setIsLoading(false);
  }, [isAuthenticated, user, router]);

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <span className="ml-3 text-lg text-gray-600 dark:text-gray-400">
            {t("common.loading")}
          </span>
        </div>
      </Layout>
    );
  }

  const renderActiveTab = () => {
    switch (activeTab) {
      case "dashboard":
        return <AdminStats />;
      case "stories":
        return <AdminStoryManager />;
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
    <Layout>
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
                    <div className="flex items-center space-x-3">
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
                      <div className="hidden md:block">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {user?.name}
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          {t("admin.role")}
                        </p>
                      </div>
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
    </Layout>
  );
};

export default AdminDashboard;
