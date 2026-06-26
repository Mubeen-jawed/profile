import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ErrorBoundary from "@/components/ErrorBoundary";
import NsfwCheckPopup from "@/components/NsfwCheckPopup";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "redditprofile, Analytics & Backup for Your Reddit Account",
  description:
    "Connect your Reddit account to see your karma breakdown, post and comment history, and top communities — and export it all to CSV.",
  metadataBase: new URL(process.env.APP_URL || "https://redditprofile.com"),
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: ["/logo.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "redditprofile",
    title: "redditprofile, Analytics & Backup for Your Reddit Account",
    description:
      "See your karma, post and comment history, and top communities — and export them to CSV.",
  },
  twitter: {
    card: "summary_large_image",
    title: "redditprofile, Analytics & Backup for Your Reddit Account",
    description:
      "Analytics and CSV backup for your own Reddit account.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <body className="flex min-h-full flex-col bg-background text-foreground antialiased">
        <Header />
        <ErrorBoundary>
          <main className="flex flex-1 flex-col">{children}</main>
        </ErrorBoundary>
        <Footer />
        {/* <NsfwCheckPopup /> */}
      </body>
    </html>
  );
}
