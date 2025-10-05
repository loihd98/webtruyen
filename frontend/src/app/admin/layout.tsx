import { Metadata } from "next";
import AdminGuard from "../../components/admin/AdminGuard";

export const metadata: Metadata = {
  title: "Admin Panel - khotruyen.vn",
  description: "Admin panel for managing stories, users, and system settings",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminGuard>{children}</AdminGuard>;
}
