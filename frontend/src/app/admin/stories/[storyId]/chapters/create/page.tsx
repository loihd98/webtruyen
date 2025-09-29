"use client";

import React from "react";
import AdminChapterForm from "@/components/admin/AdminChapterForm";
import { useParams } from "next/navigation";

const CreateChapterPage: React.FC = () => {
  const params = useParams();
  const storyId = params?.storyId as string;

  if (!storyId) return <p>Loading...</p>;

  return (
    <div>
      <AdminChapterForm storyId={storyId} />
    </div>
  );
};

export default CreateChapterPage;
