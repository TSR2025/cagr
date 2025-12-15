import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Compound Interest Calculator",
  description: "Friendly fintech compound interest calculator",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="font-sans bg-[#F8FAFC] min-h-screen">
        {children}
      </body>
    </html>
  );
}
