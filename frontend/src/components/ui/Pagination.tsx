"use client";

import React from "react";

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  className = "",
}) => {
  console.log(
    JSON.stringify({ currentPage, totalPages, totalItems, itemsPerPage })
  );

  const generatePageNumbers = () => {
    const pages: (number | string)[] = [];
    const delta = 2; // Number of pages to show around current page

    if (totalPages <= 7) {
      // Show all pages if total is 7 or less
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      // Always show first page
      pages.push(1);

      if (currentPage <= 4) {
        // Show 1, 2, 3, 4, 5, ..., last
        for (let i = 2; i <= Math.min(5, totalPages - 1); i++) {
          pages.push(i);
        }
        if (totalPages > 5) {
          pages.push("...");
          pages.push(totalPages);
        }
      } else if (currentPage >= totalPages - 3) {
        // Show 1, ..., last-4, last-3, last-2, last-1, last
        pages.push("...");
        for (let i = Math.max(totalPages - 4, 2); i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        // Show 1, ..., current-1, current, current+1, ..., last
        pages.push("...");
        for (let i = currentPage - delta; i <= currentPage + delta; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const startItem = (currentPage - 1) * itemsPerPage + 1;
  const endItem = Math.min(currentPage * itemsPerPage, totalItems);

  if (totalPages <= 1) return null;

  return (
    <div className={`flex flex-col items-center space-y-4 ${className}`}>
      {/* Pagination Controls */}
      <nav className="flex items-center justify-center">
        <div className="flex items-center space-x-1 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-1 shadow-sm">
          {/* Previous Button */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`
              flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-sm font-medium
              transition-all duration-200 select-none
              ${
                currentPage === 1
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
              }
            `}
            title="Trang trước"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 19l-7-7 7-7"
              />
            </svg>
          </button>

          {/* Page Numbers */}
          <div className="flex items-center space-x-1">
            {generatePageNumbers().map((page, index) => (
              <React.Fragment key={index}>
                {typeof page === "string" ? (
                  <span className="flex items-center justify-center min-w-[32px] h-8 text-gray-400 dark:text-gray-500 text-sm select-none">
                    {page}
                  </span>
                ) : (
                  <button
                    onClick={() => onPageChange(page)}
                    className={`
                      flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-sm font-medium
                      transition-all duration-200 select-none active:scale-95
                      ${
                        currentPage === page
                          ? "bg-blue-600 text-white shadow-md hover:bg-blue-700"
                          : "text-gray-700 dark:text-gray-300 hover:bg-blue-50 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400"
                      }
                    `}
                  >
                    {page}
                  </button>
                )}
              </React.Fragment>
            ))}
          </div>

          {/* Next Button */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`
              flex items-center justify-center min-w-[32px] h-8 px-2 rounded-md text-sm font-medium
              transition-all duration-200 select-none
              ${
                currentPage === totalPages
                  ? "text-gray-400 dark:text-gray-600 cursor-not-allowed"
                  : "text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 hover:text-blue-600 dark:hover:text-blue-400 active:scale-95"
              }
            `}
            title="Trang sau"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </nav>

      {/* Pagination Info */}
      <div className="text-sm text-gray-500 dark:text-gray-400 text-center">
        Hiển thị{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {startItem.toLocaleString()}
        </span>{" "}
        -{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {endItem.toLocaleString()}
        </span>{" "}
        trong tổng số{" "}
        <span className="font-semibold text-gray-700 dark:text-gray-300">
          {totalItems.toLocaleString()}
        </span>{" "}
        kết quả
      </div>
    </div>
  );
};

export default Pagination;
