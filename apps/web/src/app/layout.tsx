import type { Metadata, Viewport } from "next";
import "./globals.css";
import PWARegister from "@/components/pwa-register";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { PWAInstallProvider } from "@/components/pwa-install-provider";

export const metadata: Metadata = {
  title: "SEAS",
  description: "Smart Emergency Alert System",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "SEAS",
  },
};

export const viewport: Viewport = {
  themeColor: "#0F172A",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen">
        <ThemeProvider>
          <PWAInstallProvider>
            <PWARegister />
            {children}
          </PWAInstallProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}