// app/layout.tsx (RootLayout - server component)
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "../../styles/globals.css";
import ClientProvider from "./providers";
import ThemeProvider from "@/components/layout/ThemeProvider";

const inter = Inter({ subsets: ["latin"] });

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://khotruyen.vn";
const siteName = "khotruyen.vn";
const siteDescription =
  "Kho truyện online miễn phí với hàng ngàn truyện chữ và truyện audio hấp dẫn. Đọc và nghe truyện mọi lúc mọi nơi. Cập nhật liên tục các thể loại: tiên hiệp, kiếm hiệp, ngôn tình, huyền huyễn, đô thị...";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "khotruyen.vn - Đọc truyện online miễn phí",
    template: "%s | khotruyen.vn",
  },
  description: siteDescription,
  keywords: [
    "đọc truyện online",
    "truyện chữ",
    "truyện audio",
    "truyện hay",
    "kho truyện",
    "truyện miễn phí",
    "tiên hiệp",
    "kiếm hiệp",
    "ngôn tình",
    "huyền huyễn",
    "truyện full",
    "đọc truyện miễn phí",
  ],
  authors: [{ name: "Evanloi9x", url: siteUrl }],
  creator: "Evanloi9x",
  publisher: "Evanloi9x",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "vi_VN",
    url: siteUrl,
    siteName: siteName,
    title: "khotruyen.vn - Đọc truyện online miễn phí",
    description: siteDescription,
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "khotruyen.vn - Kho truyện online",
        type: "image/svg+xml",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "khotruyen.vn - Đọc truyện online miễn phí",
    description: siteDescription,
    images: ["/og-image.svg"],
    creator: "@Evanloi9x",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: [
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon.ico", sizes: "any" },
    ],
    apple: [{ url: "/apple-touch-icon.svg", type: "image/svg+xml" }],
    other: [
      {
        rel: "mask-icon",
        url: "/logo.svg",
        color: "#1e40af",
      },
    ],
  },
  manifest: "/manifest.json",
  alternates: {
    canonical: siteUrl,
  },
  verification: {
    // Thêm các mã xác thực của bạn ở đây khi có
    // google: 'your-google-verification-code',
    // yandex: 'your-yandex-verification-code',
    // bing: 'your-bing-verification-code',
  },
  category: "entertainment",
  other: {
    "fb:app_id": "your-facebook-app-id", // Thêm Facebook App ID của bạn
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi">
      <head>
        <meta name="theme-color" content="#1e40af" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="khotruyen.vn" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="application-name" content="khotruyen.vn" />
        <link rel="author" href={`${siteUrl}/humans.txt`} />
      </head>
      <body className={inter.className}>
        <ClientProvider>
          <ThemeProvider>{children}</ThemeProvider>
        </ClientProvider>
      </body>
    </html>
  );
}
