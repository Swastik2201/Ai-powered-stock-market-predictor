import type { Metadata } from "next";
import "@/styles/globals.css";

export const metadata: Metadata = {
  title: "AI Financial & Stock Market Predictor",
  description: "Advanced AI-powered financial analytics, stock market forecasting, and portfolio allocation.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="bg-background text-slate-100 antialiased min-h-screen">
        {children}
      </body>
    </html>
  );
}
