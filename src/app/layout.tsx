import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Porta - Your Portfolio's AI Research Assistant",
  description: "Bloomberg Terminal intelligence, reimagined for everyday investors. Get AI-powered portfolio insights, market analysis, and research assistance.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="antialiased bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100">
        {children}
      </body>
    </html>
  );
}
