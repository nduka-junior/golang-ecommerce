import type { Metadata } from "next";
import { Inter, Figtree } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { cn } from "@/lib/utils";
import { Toaster } from "sonner";

const figtree = Figtree({subsets:['latin'],variable:'--font-sans'});

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "E-Commerce Store",
  description: "Modern e-commerce built with Next.js & Go",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={cn("font-sans", figtree.variable)}>
      <body className={inter.className}>
        <Navbar />
        <main className="min-h-screen bg-gray-50">
          {children}
          <Toaster richColors position="top-right" />
        </main>
        <Footer />
      </body>
    </html>
  );
}
