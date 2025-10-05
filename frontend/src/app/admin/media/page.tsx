import { Metadata } from "next";
import MediaManager from "../../../components/admin/MediaManager";

export const metadata: Metadata = {
  title: "Media Manager - Admin Panel",
  description: "Manage uploaded files and media assets",
  robots: "noindex, nofollow",
};

export default function MediaPage() {
  return <MediaManager />;
}
