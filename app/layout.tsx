import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { getSiteOrigin, siteDescription, siteName, siteTitle } from "./lib/site";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#101820",
};

export async function generateMetadata(): Promise<Metadata> {
  const socialImage = {
    url: "/og.jpg",
    width: 1200,
    height: 630,
    alt: "Circadian Primer — Medicine in the 4th Dimension",
  };

  return {
    metadataBase: await getSiteOrigin(),
    title: siteTitle,
    description: siteDescription,
    alternates: {
      canonical: "/",
    },
    icons: {
      icon: "/favicon.svg",
      shortcut: "/favicon.svg",
    },
    openGraph: {
      type: "website",
      url: "/",
      siteName,
      title: siteTitle,
      description: siteDescription,
      images: [socialImage],
    },
    twitter: {
      card: "summary_large_image",
      title: siteTitle,
      description: siteDescription,
      images: [socialImage],
    },
  };
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
