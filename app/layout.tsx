import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import "./globals.css";
import ResponsiveNav from "./components/ResponsiveNav";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ferramentaria",
  description: "Sistema de gestão de chamados - Ferramentaria",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <div style={{ display: "flex", minHeight: "100vh", flexDirection: "column" }}>
          <ResponsiveNav />
          <main className="app-main" style={{ flex: 1, background: "#f7fafc", paddingTop: 0 }}>
            <div style={{ maxWidth: "100%", padding: "16px" }}>{children}</div>
          </main>
        </div>
      </body>
    </html>
  );
}
