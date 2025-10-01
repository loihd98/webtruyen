"use client";

import React from "react";
import AdminSystemSettings from "../../../components/admin/AdminSystemSettings";

const AdminSettingsPage: React.FC = () => {
  return (
    <div className="container mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          ⚙️ System Settings
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Manage your website configuration and system settings
        </p>
      </div>

      <AdminSystemSettings />
    </div>
  );
};

export default AdminSettingsPage;
