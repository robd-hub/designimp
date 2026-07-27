import type { Metadata } from "next";
import { DM_Sans } from "next/font/google";
import "./globals.css";

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Design Imp",
    template: "%s — Design Imp",
  },
  description: "Custom websites for small and medium businesses. Craft-led studio, fixed price, one point of contact.",
  openGraph: {
    type: "website",
    siteName: "Design Imp",
    locale: "en_GB",
  },
  twitter: {
    card: "summary_large_image",
    site: "@designimp_com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${dmSans.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a
          href="#main-content"
          className="absolute left-4 top-4 z-[200] -translate-y-20 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform duration-150 focus:translate-y-0"
        >
          Skip to main content
        </a>
        {children}
      </body>
    </html>
  );
}
