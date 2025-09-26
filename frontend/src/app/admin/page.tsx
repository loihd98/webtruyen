import { Metadata } from "next";
import AdminDashboard from "../../components/admin/AdminDashboard";

export const metadata: Metadata = {
  title: "Admin Dashboard - Web Truyện",
  description: "Admin panel for managing stories, users, and system settings",
  robots: "noindex, nofollow", // Don't index admin pages
};

export default function AdminPage() {
  return <AdminDashboard />;
}
