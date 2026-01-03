import type { Metadata } from "next";
import { Lato } from "next/font/google";
import "./globals.css";

import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/lib/AuthContext";
import { Toaster } from "@/components/ui/sonner";

const lato = Lato({
  subsets: ["latin"],
  weight: ["100", "300", "400", "700", "900"],
});

export const metadata: Metadata = {
  metadataBase: new URL("http://localhost:3000"),
  title: "Prioritize",
  description: "Master your tasks with clarity and focus",
  icons: {
    icon: "/favicon.ico",
  },
  openGraph: {
    title: "Prioritize",
    description: "Master your tasks with clarity and focus",
    url: "https://prioritize.urcodingbuddy.space",
    siteName: "Prioritize",
    images: [
      {
        url: "/logo-white.png",
        width: 1200,
        height: 630,
        alt: "Prioritize - Master your tasks",
      },
    ],
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Prioritize",
    description: "Master your tasks with clarity and focus",
    images: ["/frontpage-ref.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={lato.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <AuthProvider>
            {children}
            <Toaster />
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
