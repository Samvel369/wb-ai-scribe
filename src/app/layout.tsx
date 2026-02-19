import type { Metadata } from "next";
import "./globals.css";
import Footer from '@/components/Footer'

export const metadata: Metadata = {
  title: 'AI Seller — Генератор SEO-описаний для Wildberries, Ozon, Avito, Яндекс.Маркет и MAX',
  description: 'Создавайте продающие описания товаров за 10 секунд. Искусственный интеллект для селлеров на WB, Ozon, Avito, Яндекс.Маркете, Instagram, Telegram и MAX. Попробуйте бесплатно.',
  keywords: [
    'генератор описаний', 'Wildberries', 'Ozon', 'Avito', 'Яндекс.Маркет',
    'MAX мессенджер', 'SEO для маркетплейсов', 'AI копирайтер',
    'карточка товара', 'продающий текст', 'чатгпт для селлеров',
    'описание товара нейросетью', 'автоматизация продаж',
    'продвижение на маркетплейсах', 'оптимизация карточек',
    'инфографика для вайлдберриз', 'тексты для озон',
    'написать объявление авито', 'посты для телеграм магазина',
    'контент для инстаграм магазина', 'продажи в MAX',
    'gpt-4 для бизнеса', 'нейросеть для селлера',
    // English keywords
    'AI product description generator', 'marketplace seo', 'wildberries seo',
    'ozon content', 'avito seller tools', 'sales copy generator',
    'AI copywriter', 'ecommerce tools', 'product card optimization'
  ],
  openGraph: {
    title: 'AI Seller — Генератор контента для маркетплейсов',
    description: 'Увеличьте продажи с помощью продающих описаний от AI. Подходит для WB, Ozon, Avito, Яндекс.Маркет, MAX, Instagram и Telegram.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'AI Seller',
  },
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
