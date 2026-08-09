import type { Metadata } from "next";
import { Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";
import { Navbar } from "@/components/common/Navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MarketGenius AI • Stock Market Predictor & Trading Engine",
  description: "Advanced AI-powered financial analytics, Prophet stock forecasting, and paper trading suite.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${jetbrainsMono.variable} dark`}>
      <body className="bg-background text-slate-100 antialiased min-h-screen font-sans bg-grid-pattern selection:bg-aiAccent/30 selection:text-white">
        <Navbar />
        <main className="w-full min-h-[calc(100vh-4rem)]">
          {children}
        </main>
      </body>
    </html>
  );
}
