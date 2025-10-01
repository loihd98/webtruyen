"use client";

import React, { useState, useEffect } from "react";
import apiClient from "../../utils/api";

interface AffiliateLink {
  id: string;
  provider: string;
  label?: string;
  targetUrl: string;
}

interface AffiliateLinkSelectProps {
  value?: string;
  onChange: (affiliateId: string | null) => void;
  placeholder?: string;
  className?: string;
}

const AffiliateLinkSelect: React.FC<AffiliateLinkSelectProps> = ({
  value,
  onChange,
  placeholder = "Chọn affiliate link...",
  className = "",
}) => {
  const [affiliateLinks, setAffiliateLinks] = useState<AffiliateLink[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [selectedLink, setSelectedLink] = useState<AffiliateLink | null>(null);

  useEffect(() => {
    if (isOpen) {
      searchAffiliateLinks();
    }
  }, [isOpen, searchTerm]);

  useEffect(() => {
    if (value && !selectedLink) {
      // Find the selected link info
      const findSelectedLink = async () => {
        try {
          const response = await apiClient.get(
            "/admin/affiliate-links?limit=100"
          );
          if (response.data.success) {
            const found = response.data.data.affiliateLinks.find(
              (link: AffiliateLink) => link.id === value
            );
            if (found) {
              setSelectedLink(found);
            }
          }
        } catch (error) {
          console.error("Error fetching selected affiliate link:", error);
        }
      };
      findSelectedLink();
    }
  }, [value, selectedLink]);

  const searchAffiliateLinks = async () => {
    try {
      setIsLoading(true);
      const params = new URLSearchParams({
        limit: "20",
        isActive: "true",
      });

      if (searchTerm) {
        params.append("search", searchTerm);
      }

      const response = await apiClient.get(`/admin/affiliate-links?${params}`);
      if (response.data.success) {
        setAffiliateLinks(response.data.data.affiliateLinks);
      }
    } catch (error) {
      console.error("Error searching affiliate links:", error);
      setAffiliateLinks([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelect = (link: AffiliateLink) => {
    setSelectedLink(link);
    onChange(link.id);
    setIsOpen(false);
    setSearchTerm("");
  };

  const handleClear = () => {
    setSelectedLink(null);
    onChange(null);
  };

  return (
    <div className={`relative ${className}`}>
      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full px-3 py-2 text-left border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white bg-white"
        >
          {selectedLink ? (
            <div className="flex items-center justify-between">
              <div>
                <span className="font-medium">{selectedLink.provider}</span>
                {selectedLink.label && (
                  <span className="text-gray-500 ml-2">
                    - {selectedLink.label}
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleClear();
                }}
                className="text-red-500 hover:text-red-700 ml-2"
              >
                ✕
              </button>
            </div>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </button>

        {isOpen && (
          <div className="absolute z-10 w-full mt-1 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-lg shadow-lg max-h-60 overflow-hidden">
            <div className="p-2 border-b border-gray-200 dark:border-gray-600">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Tìm kiếm affiliate link..."
                className="w-full px-2 py-1 text-sm border border-gray-300 dark:border-gray-600 rounded focus:ring-1 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                autoFocus
              />
            </div>

            <div className="max-h-48 overflow-y-auto">
              {isLoading ? (
                <div className="p-3 text-center text-gray-500">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600 mx-auto"></div>
                </div>
              ) : affiliateLinks.length > 0 ? (
                affiliateLinks.map((link) => (
                  <button
                    key={link.id}
                    type="button"
                    onClick={() => handleSelect(link)}
                    className="w-full px-3 py-2 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">
                      {link.provider}
                    </div>
                    {link.label && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {link.label}
                      </div>
                    )}
                    <div className="text-xs text-gray-400 dark:text-gray-500 truncate">
                      {link.targetUrl}
                    </div>
                  </button>
                ))
              ) : (
                <div className="p-3 text-center text-gray-500 dark:text-gray-400">
                  {searchTerm
                    ? "Không tìm thấy kết quả"
                    : "Không có affiliate link nào"}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Overlay to close dropdown when clicking outside */}
      {isOpen && (
        <div className="fixed inset-0 z-5" onClick={() => setIsOpen(false)} />
      )}
    </div>
  );
};

export default AffiliateLinkSelect;
