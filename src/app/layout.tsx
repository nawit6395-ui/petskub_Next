import type { Metadata } from "next";
import Script from "next/script";
import { Prompt } from "next/font/google"; // Import fonts
import "./globals.css";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BackToTopButton from "@/components/BackToTopButton";
import CookieConsent from "@/components/CookieConsent";
import { Providers } from "@/components/Providers";



const prompt = Prompt({
  weight: ["400", "500", "600", "700"],
  subsets: ["thai", "latin"],
  variable: "--font-prompt",
  display: "swap",
});



const siteUrl = "https://petskub.com";
const siteName = "PetsKub";
const siteTitle = "Petskub – หมาหาบ้าน แมวหาบ้าน รับเลี้ยงสุนัข รับเลี้ยงแมว ลงประกาศหาบ้านฟรี";
const siteDescription = "Petskub พื้นที่สื่อกลางสำหรับคนรักสัตว์ หาบ้านให้หมา หาบ้านให้แมว รับเลี้ยงสุนัข รับเลี้ยงแมว ลงประกาศหาบ้านให้สัตว์เลี้ยงฟรี แจ้งพิกัดสัตว์จรจัด ครอบคลุมกรุงเทพฯ และทั่วประเทศไทย";
const ogImage = "/Logo.png"; // stored in public for faster, reliable fetch by crawlers

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: "%s | PetsKub",
  },
  description: siteDescription,
  applicationName: siteName,
  keywords: [
    "Petskub",
    "หมาหาบ้าน",
    "แมวหาบ้าน",
    "รับเลี้ยงสุนัข",
    "รับเลี้ยงแมว",
    "ลงประกาศหาบ้าน",
    "หาบ้านให้หมา",
    "หาบ้านให้แมว",
    "สัตว์จรจัด",
    "ลูกสุนัขแจกฟรี",
    "ลูกแมวหาบ้าน",
    "สุนัขหาบ้าน",
    "แจ้งพิกัดสัตว์จร",
    "รับเลี้ยงสัตว์",
    "อาสาสมัครดูแลสัตว์",
    "กรุงเทพ",
    "ปทุมธานี",
  ],
  authors: [{ name: "Petskub Community" }],
  alternates: {
    canonical: siteUrl,
  },
  openGraph: {
    type: "website",
    url: siteUrl,
    title: siteTitle,
    description: siteDescription,
    siteName,
    images: [{ url: ogImage, width: 1200, height: 630, alt: siteTitle }],
    locale: "th_TH",
  },
  twitter: {
    card: "summary_large_image",
    site: "@Petskub",
    title: siteTitle,
    description: siteDescription,
    images: [ogImage],
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon.svg", type: "image/svg+xml" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/web-app-manifest-192x192.png", sizes: "192x192", type: "image/png" },
      { url: "/web-app-manifest-512x512.png", sizes: "512x512", type: "image/png" },
    ],
    apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    shortcut: ["/favicon.ico"],
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  themeColor: "#f4a259",
  width: "device-width",
  initialScale: 1,
};

const organizationJsonLd = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: siteName,
  url: siteUrl,
  logo: ogImage,
  description: siteDescription,
  sameAs: [
    "https://facebook.com/PetsKub",
    "https://www.instagram.com/PetsKub",
    "https://twitter.com/PetsKub",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    contactType: "customer support",
    areaServed: "TH",
    availableLanguage: ["th", "en"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable}`}>
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" />
        <link rel="preconnect" href="https://img5.pic.in.th" />
      </head>
      <body className="bg-background text-foreground font-sans antialiased">
        <Providers>
          <div className="flex flex-col min-h-screen">
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
            <BackToTopButton />
            <CookieConsent />
          </div>
        </Providers>
        <Script id="organization-ld-json" type="application/ld+json" suppressHydrationWarning>
          {JSON.stringify(organizationJsonLd)}
        </Script>
      </body>
    </html>
  );
}
