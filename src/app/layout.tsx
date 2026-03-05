import type { Metadata } from "next";
import { Geist, Geist_Mono, Amiri, IBM_Plex_Sans } from "next/font/google";
import "./globals.css";
import { AppProviders } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const amiri = Amiri({
  variable: "--font-amiri",
  weight: ["400", "700"],
  subsets: ["arabic", "latin"],
});

const ibmPlex = IBM_Plex_Sans({
  variable: "--font-ibm-plex",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "49 Sünnet Uygulaması",
  description: "Peygamber Efendimizin sünnetlerini grup ve maddeler halinde kaydetmek ve okumak için web uygulaması.",
  manifest: "/manifest.json",
  themeColor: "#0D7377",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "49 Sünnet",
  },
  icons: {
    icon: "/icon-192x192.png",
    apple: "/icon-192x192.png",
  },
  formatDetection: {
    telephone: false,
  },
};

export const viewport = {
  themeColor: "#0D7377",
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${amiri.variable} ${ibmPlex.variable} font-sans antialiased bg-[#FAF7F0] text-[#2C3E50]`}
      >
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
