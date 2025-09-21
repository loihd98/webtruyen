import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import ClientProvider from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Web Truyện - Đọc truyện online",
  description: "Website đọc truyện văn bản và audio miễn phí",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <body className={inter.className}>
        <ClientProvider>{children}</ClientProvider>
      </body>
    </html>
  );
}
