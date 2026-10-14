import type { Metadata } from "next";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/contexts/AuthContext";
import { LanguageProvider } from "@/contexts/LanguageContext";



export const metadata: Metadata = {
  metadataBase: new URL("https://makkahrefrigerators.com"),
  title: {
    default: "مصنع مكة للثلاجات | Makkah Refrigerators Factory - Cairo, Egypt",
    template: "%s | مصنع مكة للثلاجات",
  },
  description: "مصنع مكة للثلاجات - متخصصون في تصنيع الثلاجات التجارية والصناعية وغرف التبريد في مصر | Makkah Refrigerators Factory - Commercial & industrial refrigerators, display fridges, and cold rooms manufacturer in Cairo, Egypt.",
  keywords: [
    // عربي
    "مصنع مكة للثلاجات",
    "ثلاجات تجارية",
    "ثلاجات عرض",
    "ثلاجات صناعية",
    "غرف تبريد",
    "ثلاجات لحوم",
    "تبريد القاهرة",
    "ثلاجات مصر",
    // English
    "Makkah Refrigerators",
    "commercial refrigerators Egypt",
    "display fridge manufacturer",
    "industrial freezers Egypt",
    "cold room manufacturer Cairo",
    "refrigerator factory Egypt",
    "meat fridge Egypt",
  ],
  authors: [{ name: "مصنع مكة للثلاجات" }],
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/logo.png', type: 'image/png', sizes: '512x512' },
    ],
    apple: '/logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
    },
  },
  alternates: {
    canonical: "https://makkahrefrigerators.com",
    languages: {
      'ar-EG': 'https://makkahrefrigerators.com',
      'en-US': 'https://makkahrefrigerators.com',
    },
  },
  openGraph: {
    title: "مصنع مكة للثلاجات | Makkah Refrigerators Factory",
    description: "حلول تبريد متكاملة - ثلاجات تجارية وصناعية | Complete refrigeration solutions - commercial & industrial refrigerators",
    url: "https://makkahrefrigerators.com",
    siteName: "مصنع مكة للثلاجات",
    images: ["/logo.png"],
    type: "website",
    locale: "ar_EG",
    alternateLocale: ["en_US"],
  },
  twitter: {
    card: "summary_large_image",
    title: "مصنع مكة للثلاجات | Makkah Refrigerators Factory",
    description: "حلول تبريد متكاملة - ثلاجات تجارية وصناعية | Complete refrigeration solutions",
    images: ["/logo.png"],
  },
};
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <body
        className="antialiased bg-background text-foreground font-tajawal"
      >
        <LanguageProvider>
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </LanguageProvider>
      </body>
    </html>
  );
}