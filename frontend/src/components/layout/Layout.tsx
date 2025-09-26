"use client";

import React, { useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../store";
import { setTheme } from "../../store/slices/uiSlice";
import Navbar from "./Navbar";
import Footer from "./Footer";
import AudioPlayer from "../audio/AudioPlayer";

interface LayoutContentProps {
  children: React.ReactNode;
}

const LayoutContent: React.FC<LayoutContentProps> = ({ children }) => {
  const dispatch = useDispatch();
  // Tạm thời dùng default values
  const theme = "light" as "light" | "dark";
  const audioPlayerOpen = false;

  // Apply theme on mount and when it changes
  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
  }, [theme]);

  return (
    <div
      className={`min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-200 ${theme}`}
    >
      <Navbar />

      <main className="flex-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">{children}</div>
      </main>

      <Footer />

      {/* Audio Player */}
      {audioPlayerOpen && <AudioPlayer />}

      {/* Global Loading Overlay */}
      <div
        id="loading-overlay"
        className="fixed inset-0 bg-black bg-opacity-50 z-50 items-center justify-center"
        style={{ display: "none" }}
      >
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 flex items-center space-x-4">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="text-gray-900 dark:text-white">Đang tải...</span>
        </div>
      </div>

      {/* Toast Notifications Container */}
      <div id="toast-container" className="fixed top-4 right-4 z-50 space-y-2">
        {/* Toasts will be dynamically added here */}
      </div>
    </div>
  );
};

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  return <LayoutContent>{children}</LayoutContent>;
};

export default Layout;
