import type { Metadata } from "next";
import { Inter, Newsreader } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navbar";

const bodyFont = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const headingFont = Newsreader({
  variable: "--font-heading",
  subsets: ["latin"],
  style: "italic",
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
      className={`${headingFont.variable} ${bodyFont.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col pt-14">
        <Navbar />
        {children}
      </body>
    </html>
  );
}
