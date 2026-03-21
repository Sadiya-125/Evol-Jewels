import type { Metadata } from "next";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import "./globals.css";
import LayoutWrapper from "@/components/layout/LayoutWrapper";
import { TRPCProvider } from "@/components/providers/TRPCProvider";
import FlyToCartProvider from "@/components/animations/FlyToCartProvider";

export const metadata: Metadata = {
  title: "Evol Jewels",
  description: "Modern Fine Jewellery for Self-Expression. Thoughtful Pieces that Express who you are, and Who you're Growing into.",
  keywords: ["jewellery", "fine jewellery", "modern jewellery", "diamond jewellery", "gold jewellery", "self-love"],
  authors: [{ name: "Evol Jewels" }],
  openGraph: {
    title: "Evol Jewels",
    description: "Modern Fine Jewellery for Self-Expression. Thoughtful Pieces that Express who you are, and Who you're Growing into.",
    type: "website",
    locale: "en_IN",
    url: "https://evoljewels.com",
    siteName: "Evol Jewels",
  },
  twitter: {
    card: "summary_large_image",
    title: "Evol Jewels",
    description: "Modern Fine Jewellery for Self-Expression",
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: "/favicon/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased">
        <TRPCProvider>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false}>
            <FlyToCartProvider>
              <LayoutWrapper>{children}</LayoutWrapper>
              <Toaster position="top-right" />
            </FlyToCartProvider>
          </ThemeProvider>
        </TRPCProvider>
      </body>
    </html>
  );
}
