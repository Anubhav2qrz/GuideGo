import type { Metadata } from "next";
import { Inter, Outfit } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
  display: "swap",
});

const outfit = Outfit({
  variable: "--font-heading",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "GuideGo — Explore Every City Like a Local",
    template: "%s | GuideGo",
  },
  description:
    "Connect with verified local guides for personalized, authentic city experiences across India. Food walks, heritage tours, photography, and more.",
  keywords: [
    "local guide",
    "city tours",
    "India travel",
    "verified guides",
    "food walks",
    "heritage tours",
    "travel marketplace",
  ],
  openGraph: {
    title: "GuideGo — Explore Every City Like a Local",
    description:
      "Connect with verified local guides for personalized, authentic city experiences across India.",
    type: "website",
    locale: "en_IN",
    siteName: "GuideGo",
  },
  twitter: {
    card: "summary_large_image",
    title: "GuideGo — Explore Every City Like a Local",
    description:
      "Connect with verified local guides for personalized, authentic city experiences across India.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col antialiased">
        <ThemeProvider defaultTheme="system" storageKey="guidego-theme">
          <AuthProvider>
            <Navbar />
            <main className="flex-1">{children}</main>
            <Footer />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
