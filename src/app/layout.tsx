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
  title: "redditprofile, Reddit Profile Intelligence",
  description:
    "Instantly surface posts, comments, karma, and activity patterns for any Reddit user. Complete public profile analysis in seconds.",
  metadataBase: new URL(process.env.APP_URL || "https://redditprofile.com"),
  icons: {
    icon: [{ url: "/avatar-removebg.png", type: "image/png" }],
    shortcut: ["/avatar-removebg.png"],
    apple: ["/avatar-removebg.png"],
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    siteName: "redditprofile",
    title: "redditprofile, Reddit Profile Intelligence",
    description:
      "Surface the complete public history of any Reddit user in seconds.",
  },
  twitter: {
    card: "summary_large_image",
    title: "redditprofile, Reddit Profile Intelligence",
    description:
      "Instantly analyze posts, comments, and karma for any Reddit user.",
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
