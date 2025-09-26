"use client";

import React, { useState, useEffect } from "react";
import { useLanguage } from "../../contexts/LanguageContext";

interface SystemSettings {
  siteName: string;
  siteDescription: string;
  contactEmail: string;
  maxFileSize: number;
  allowedFileTypes: string[];
  enableRegistration: boolean;
  enableComments: boolean;
  enableBookmarks: boolean;
  maintenanceMode: boolean;
  analyticsId: string;
  socialMedia: {
    facebook: string;
    twitter: string;
    youtube: string;
    discord: string;
  };
  seoSettings: {
    metaTitle: string;
    metaDescription: string;
    keywords: string[];
  };
}

const AdminSystemSettings: React.FC = () => {
  const { t } = useLanguage();
  const [settings, setSettings] = useState<SystemSettings>({
    siteName: "Web Truyện",
    siteDescription: "Nền tảng đọc truyện online hàng đầu",
    contactEmail: "admin@webtruyen.com",
    maxFileSize: 10,
    allowedFileTypes: ["jpg", "jpeg", "png", "gif", "mp3", "wav"],
    enableRegistration: true,
    enableComments: true,
    enableBookmarks: true,
    maintenanceMode: false,
    analyticsId: "",
    socialMedia: {
      facebook: "",
      twitter: "",
      youtube: "",
      discord: "",
    },
    seoSettings: {
      metaTitle: "Web Truyện - Đọc truyện online miễn phí",
      metaDescription:
        "Đọc truyện online miễn phí với hàng ngàn đầu truyện hay nhất",
      keywords: ["truyện", "đọc truyện", "truyện online", "light novel"],
    },
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<
    "general" | "features" | "social" | "seo" | "advanced"
  >("general");

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with actual API call
      setTimeout(() => {
        setIsLoading(false);
      }, 1000);
    } catch (error) {
      console.error("Error fetching settings:", error);
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      // Mock save - replace with actual API call
      setTimeout(() => {
        setIsSaving(false);
        alert(t("admin.settings.save_success"));
      }, 1500);
    } catch (error) {
      console.error("Error saving settings:", error);
      setIsSaving(false);
      alert(t("admin.settings.save_error"));
    }
  };

  const handleFileTypeAdd = (newType: string) => {
    if (newType && !settings.allowedFileTypes.includes(newType)) {
      setSettings((prev) => ({
        ...prev,
        allowedFileTypes: [...prev.allowedFileTypes, newType],
      }));
    }
  };

  const handleFileTypeRemove = (typeToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      allowedFileTypes: prev.allowedFileTypes.filter(
        (type) => type !== typeToRemove
      ),
    }));
  };

  const handleKeywordAdd = (newKeyword: string) => {
    if (newKeyword && !settings.seoSettings.keywords.includes(newKeyword)) {
      setSettings((prev) => ({
        ...prev,
        seoSettings: {
          ...prev.seoSettings,
          keywords: [...prev.seoSettings.keywords, newKeyword],
        },
      }));
    }
  };

  const handleKeywordRemove = (keywordToRemove: string) => {
    setSettings((prev) => ({
      ...prev,
      seoSettings: {
        ...prev.seoSettings,
        keywords: prev.seoSettings.keywords.filter(
          (keyword) => keyword !== keywordToRemove
        ),
      },
    }));
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-8 bg-gray-300 dark:bg-gray-600 rounded w-1/4"></div>
            <div className="space-y-3">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="h-10 bg-gray-300 dark:bg-gray-600 rounded"
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
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.title")}
            </h3>
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              {isSaving
                ? "💾 " + t("admin.settings.saving")
                : "💾 " + t("admin.settings.save")}
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="p-6">
          <div className="flex space-x-4 border-b border-gray-200 dark:border-gray-700">
            {[
              {
                key: "general",
                label: t("admin.settings.general"),
                icon: "⚙️",
              },
              {
                key: "features",
                label: t("admin.settings.features"),
                icon: "🔧",
              },
              { key: "social", label: t("admin.settings.social"), icon: "🌐" },
              { key: "seo", label: t("admin.settings.seo"), icon: "🔍" },
              {
                key: "advanced",
                label: t("admin.settings.advanced"),
                icon: "🚀",
              },
            ].map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key as any)}
                className={`px-4 py-2 font-medium text-sm rounded-t-lg transition-colors ${
                  activeTab === tab.key
                    ? "text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300"
                }`}
              >
                {tab.icon} {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.general")}
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.settings.site_name")}
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      siteName: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  {t("admin.settings.contact_email")}
                </label>
                <input
                  type="email"
                  value={settings.contactEmail}
                  onChange={(e) =>
                    setSettings((prev) => ({
                      ...prev,
                      contactEmail: e.target.value,
                    }))
                  }
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.site_description")}
              </label>
              <textarea
                value={settings.siteDescription}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    siteDescription: e.target.value,
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}

        {/* Features Settings */}
        {activeTab === "features" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.features")}
            </h4>

            <div className="space-y-4">
              {[
                {
                  key: "enableRegistration",
                  label: t("admin.settings.enable_registration"),
                  desc: t("admin.settings.enable_registration_desc"),
                },
                {
                  key: "enableComments",
                  label: t("admin.settings.enable_comments"),
                  desc: t("admin.settings.enable_comments_desc"),
                },
                {
                  key: "enableBookmarks",
                  label: t("admin.settings.enable_bookmarks"),
                  desc: t("admin.settings.enable_bookmarks_desc"),
                },
                {
                  key: "maintenanceMode",
                  label: t("admin.settings.maintenance_mode"),
                  desc: t("admin.settings.maintenance_mode_desc"),
                },
              ].map((feature) => (
                <div
                  key={feature.key}
                  className="flex items-center justify-between p-4 border border-gray-200 dark:border-gray-600 rounded-lg"
                >
                  <div>
                    <h5 className="font-medium text-gray-900 dark:text-white">
                      {feature.label}
                    </h5>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {feature.desc}
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={
                        settings[feature.key as keyof SystemSettings] as boolean
                      }
                      onChange={(e) =>
                        setSettings((prev) => ({
                          ...prev,
                          [feature.key]: e.target.checked,
                        }))
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div>
                  </label>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Social Media Settings */}
        {activeTab === "social" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.social")}
            </h4>

            <div className="space-y-4">
              {Object.entries(settings.socialMedia).map(([platform, url]) => (
                <div key={platform}>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    {platform.charAt(0).toUpperCase() + platform.slice(1)} URL
                  </label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) =>
                      setSettings((prev) => ({
                        ...prev,
                        socialMedia: {
                          ...prev.socialMedia,
                          [platform]: e.target.value,
                        },
                      }))
                    }
                    placeholder={`https://${platform}.com/your-page`}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Settings */}
        {activeTab === "seo" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.seo")}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.meta_title")}
              </label>
              <input
                type="text"
                value={settings.seoSettings.metaTitle}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    seoSettings: {
                      ...prev.seoSettings,
                      metaTitle: e.target.value,
                    },
                  }))
                }
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.meta_description")}
              </label>
              <textarea
                value={settings.seoSettings.metaDescription}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    seoSettings: {
                      ...prev.seoSettings,
                      metaDescription: e.target.value,
                    },
                  }))
                }
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.keywords")}
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {settings.seoSettings.keywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                    >
                      {keyword}
                      <button
                        onClick={() => handleKeywordRemove(keyword)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={t("admin.settings.add_keyword")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      handleKeywordAdd(e.currentTarget.value.trim());
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>
          </div>
        )}

        {/* Advanced Settings */}
        {activeTab === "advanced" && (
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
              {t("admin.settings.advanced")}
            </h4>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.max_file_size")} (MB)
              </label>
              <input
                type="number"
                value={settings.maxFileSize}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    maxFileSize: parseInt(e.target.value) || 0,
                  }))
                }
                min="1"
                max="100"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("admin.settings.allowed_file_types")}
              </label>
              <div className="space-y-2">
                <div className="flex flex-wrap gap-2">
                  {settings.allowedFileTypes.map((type, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    >
                      .{type}
                      <button
                        onClick={() => handleFileTypeRemove(type)}
                        className="ml-2 hover:text-red-600"
                      >
                        ×
                      </button>
                    </span>
                  ))}
                </div>
                <input
                  type="text"
                  placeholder={t("admin.settings.add_file_type")}
                  onKeyPress={(e) => {
                    if (e.key === "Enter" && e.currentTarget.value.trim()) {
                      handleFileTypeAdd(
                        e.currentTarget.value.trim().replace(".", "")
                      );
                      e.currentTarget.value = "";
                    }
                  }}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Google Analytics ID
              </label>
              <input
                type="text"
                value={settings.analyticsId}
                onChange={(e) =>
                  setSettings((prev) => ({
                    ...prev,
                    analyticsId: e.target.value,
                  }))
                }
                placeholder="G-XXXXXXXXXX"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminSystemSettings;
