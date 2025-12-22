'use client';

import { useState, useEffect } from 'react';
import apiClient from '@/utils/api';

const STORAGE_KEY = 'dailyPopupData';
const MAX_DAILY_SHOWS = 2;

// Check if device is mobile
const isMobileDevice = () => {
    if (typeof window === 'undefined') return false;

    const userAgent = navigator.userAgent || navigator.vendor || (window as any).opera;

    // Check for mobile devices
    return /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini|mobile|tablet/i.test(
        userAgent.toLowerCase()
    );
};

// Get daily popup data from localStorage
const getDailyPopupData = () => {
    try {
        const data = localStorage.getItem(STORAGE_KEY);
        if (!data) return { date: '', count: 0 };
        
        const parsed = JSON.parse(data);
        const today = new Date().toDateString();
        
        // Reset count if it's a new day
        if (parsed.date !== today) {
            return { date: today, count: 0 };
        }
        
        return parsed;
    } catch (error) {
        return { date: new Date().toDateString(), count: 0 };
    }
};

// Save daily popup data to localStorage
const saveDailyPopupData = (count: number) => {
    const today = new Date().toDateString();
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ date: today, count }));
};

interface DailyPopupProps {
    storyId: string;
    affiliateLink?: string;
}

export default function DailyPopup({ storyId, affiliateLink }: DailyPopupProps) {
    const [isVisible, setIsVisible] = useState(false);
    const [popupLink, setPopupLink] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const checkAndShowPopup = async () => {
            try {
                // Only show on mobile devices
                if (!isMobileDevice()) {
                    setIsLoading(false);
                    return;
                }

                // Check daily show count
                const popupData = getDailyPopupData();
                
                // Don't show if already shown MAX_DAILY_SHOWS times today
                if (popupData.count >= MAX_DAILY_SHOWS) {
                    setIsLoading(false);
                    return;
                }

                // Fetch affiliate links from API
                const response = await apiClient.get('/affiliate/public/active?limit=10');

                if (response.data.success && response.data.data) {
                    const affiliateLinks = response.data.data;
                    
                    // Select link based on current show count
                    // First show (count = 0): use affiliateLinks[0]
                    // Second show (count = 1): use affiliateLinks[1]
                    const linkIndex = popupData.count;
                    const selectedLink = affiliateLinks[linkIndex];

                    if (selectedLink?.targetUrl) {
                        setPopupLink(selectedLink.targetUrl);
                        setIsVisible(true);
                    }
                }
            } catch (error) {
                console.error('Error loading affiliate link:', error);
            } finally {
                setIsLoading(false);
            }
        };

        checkAndShowPopup();
    }, [storyId, affiliateLink]);

    const handleClose = () => {
        // Increment show count
        const popupData = getDailyPopupData();
        saveDailyPopupData(popupData.count + 1);

        // Redirect to link if available
        if (popupLink) {
            window.open(popupLink, '_blank', 'noopener,noreferrer');
        }

        setIsVisible(false);
    };

    if (isLoading || !isVisible) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div
                className="relative bg-gradient-to-br from-white to-gray-50 rounded-2xl shadow-2xl max-w-md w-full mx-4 p-8 transform transition-all"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-purple-400/20 rounded-full blur-3xl -z-10"></div>
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-pink-400/20 to-orange-400/20 rounded-full blur-3xl -z-10"></div>

                {/* Content */}
                <div className="relative z-10">

                    {/* Title */}
                    <h2 className="text-xl md:text-2xl font-bold text-center mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Một click ngàn lời cảm ơn
                    </h2>

                    {/* Description */}
                    <p className="text-gray-700 text-center mb-8 leading-relaxed">
                        Cảm ơn bạn đã ghé thăm nhà của khotruyen.vn Mỗi click sang Shopee, Tiktok của bạn đều là một lời cổ vũ,
                        tiếp thêm năng lượng để chúng mình mang đến nhiều câu chuyện hấp dẫn hơn nữa
                    </p>

                    {/* Button */}
                    <button
                        onClick={handleClose}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-4 px-6 rounded-xl shadow-lg hover:shadow-xl transform hover:scale-[1.02] transition-all duration-200 active:scale-95"
                    >
                        Nhấn để tắt
                    </button>

                    {/* Small thank you note */}
                    <p className="text-center text-xs text-gray-500 mt-4">
                        💙 Cảm ơn sự ủng hộ của bạn
                    </p>
                </div>
            </div>
        </div>
    );
}
