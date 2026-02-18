import type { Metadata } from "next";
import "./globals.css";
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Seller - Генератор описаний',
  description: 'Генерация продающих описаний для маркетплейсов с помощью AI',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className={`font-sans min-h-screen flex flex-col bg-[#0a0a0a]`}>
        <main className="flex-grow">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
