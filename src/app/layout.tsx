import type { Metadata, Viewport } from "next";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { ThemeProvider } from "@/context/ThemeContext";
import { SleepProvider } from "@/context/SleepContext";
import AppLayout from "@/components/layout/AppLayout";

export const metadata: Metadata = {
  title: "LifeSync – Personal Wellness & Productivity Platform",
  description: "An all-in-one personal wellness and productivity platform tracking sleep, activity, nutrition, habits, and screen time.",
  manifest: "/manifest.json",
  icons: {
    icon: "/icon-192.svg",
    apple: "/icon-192.svg",
  },
};

export const viewport: Viewport = {
  themeColor: "#6366F1",
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
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased select-none">
        <ThemeProvider>
          <AuthProvider>
            <SleepProvider>
              <AppLayout>{children}</AppLayout>
            </SleepProvider>
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}

