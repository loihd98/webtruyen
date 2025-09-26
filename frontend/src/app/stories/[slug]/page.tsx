"use client";

import React from "react";
import { notFound } from "next/navigation";

interface StoryPageProps {
  params: {
    slug: string;
  };
}

export default function StoryPage({ params }: StoryPageProps) {
  const { slug } = params;

  // Basic story page - will be enhanced later
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
              {slug.replace(/-/g, " ")}
            </h1>
            <div className="mt-6 text-gray-700 dark:text-gray-300">
              <p>Story details and chapters will be loaded here...</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
