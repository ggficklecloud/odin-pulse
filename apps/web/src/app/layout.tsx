import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const inter = Inter({
  variable: "--font-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Odin Pulse | 精英业务门户",
  description: "资讯聚合、业务决策、行情监控一站式门户",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="zh-CN"
      className={`${inter.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-14 font-sans">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
