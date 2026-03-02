import type { Metadata } from "next";
import "./globals.css";
import Footer from '@/components/Footer'
import Script from 'next/script'

export const metadata: Metadata = {
  title: 'AI Seller Pro — Генератор SEO-описаний для Wildberries, Ozon, Avito',
  description: 'AI Seller Pro — мощный нейросетевой генератор описаний товаров. Создавайте продающие SEO-описания для карточек на Wildberries, Ozon, Авито, Яндекс.Маркет за 10 секунд. Искусственный интеллект для селлеров.',
  keywords: [
    // Основные целевые запросы пользователя
    'AI Seller Pro', 'ai seller pro', 'seller pro', 'генератор описаний',
    'генератор описаний товаров', 'генератор описаний для вайлдберриз',
    'генератор описаний бесплатно', 'нейросеть генератор описаний',
    'seo генератор', 'ай селлер про', 'купить seller pro', 'селлер про',

    // Платформы и форматы
    'описание для Wildberries', 'SEO для Ozon', 'Avito', 'Яндекс.Маркет',
    'MAX мессенджер', 'описание товара', 'карточка товара', 'текст для карточки товара',
    'инфографика для вайлдберриз', 'продающий текст', 'тексты для озон',
    'написать объявление авито', 'посты для телеграм магазина',
    'контент для инстаграм магазина', 'продажи в MAX',

    // Нейросети и инструменты
    'AI копирайтер', 'чатгпт для селлеров', 'описание товара нейросетью',
    'gpt-4 для бизнеса', 'нейросеть для селлера', 'создание описания ии',
    'автоматизация продаж', 'продвижение на маркетплейсах', 'оптимизация карточек',
    'ИИ', 'Искусственный интеллект', 'ИИ текст', 'АИ текст', 'описания',
    'написать описание', 'сгенерировать описание товара', 'AI генератор текста',

    // Англоязычные синонимы (для широкого охвата)
    'AI product description generator', 'marketplace seo', 'wildberries seo',
    'ozon content', 'avito seller tools', 'sales copy generator',
    'AI copywriter', 'ecommerce tools', 'product card optimization', 'ai seller'
  ],
  openGraph: {
    title: 'AI Seller Pro — Генератор описаний для маркетплейсов',
    description: 'Увеличьте продажи с помощью мощного генератора продающих SEO-описаний на базе искусственного интеллекта. Работает для WB, Ozon, Avito, Яндекс.Маркет, MAX.',
    type: 'website',
    locale: 'ru_RU',
    siteName: 'AI Seller Pro',
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
        <Script id="yandex-metrika" strategy="afterInteractive">
          {`
            (function(m,e,t,r,i,k,a){
                m[i]=m[i]||function(){(m[i].a=m[i].a||[]).push(arguments)};
                m[i].l=1*new Date();
                for (var j = 0; j < document.scripts.length; j++) {if (document.scripts[j].src === r) { return; }}
                k=e.createElement(t),a=e.getElementsByTagName(t)[0],k.async=1,k.src=r,a.parentNode.insertBefore(k,a)
            })(window, document,'script','https://mc.yandex.ru/metrika/tag.js?id=107066108', 'ym');

            ym(107066108, 'init', {ssr:true, webvisor:true, clickmap:true, ecommerce:"dataLayer", referrer: document.referrer, url: location.href, accurateTrackBounce:true, trackLinks:true});
          `}
        </Script>
        <noscript>
          <div>
            <img src="https://mc.yandex.ru/watch/107066108" style={{ position: 'absolute', left: '-9999px' }} alt="" />
          </div>
        </noscript>
      </body>
    </html>
  );
}
