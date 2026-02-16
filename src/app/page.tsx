"use client";

import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Zap } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-600 to-fuchsia-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            WB.Scribe
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-zinc-400">
            <Link href="#features" className="hover:text-white transition">Возможности</Link>
            <Link href="#pricing" className="hover:text-white transition">Цены</Link>
          </div>
          <Link
            href="/login"
            className="px-4 py-2 rounded-full bg-white text-black text-sm font-medium hover:bg-zinc-200 transition"
          >
            Войти
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-purple-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-purple-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-purple-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-purple-500"></span>
            </span>
            Доступно для Wildberries и Ozon
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            SEO-описания для товаров <br />
            <span className="text-gradient">за 10 секунд</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Искусственный интеллект, который знает алгоритмы маркетплейсов.
            Повышаем позиции в поиске и увеличиваем конверсию в корзину.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-purple-900/20"
            >
              <Zap className="w-5 h-5 fill-current" />
              Попробовать бесплатно
            </Link>
            <Link
              href="#demo"
              className="w-full sm:w-auto px-8 py-4 rounded-xl glass-card text-white hover:bg-white/5 transition font-medium"
            >
              Смотреть демо
            </Link>
          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Fake for MVP) */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          <div>
            <div className="text-3xl font-bold text-white">2.5x</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Рост продаж</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">10k+</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Описаний создано</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">Top 1</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">В категории Tools</div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Почему селлеры выбирают нас?
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">SEO-оптимизация</h3>
              <p className="text-zinc-400 leading-relaxed">
                Алгоритм автоматически вставляет высокочастотные ключи, чтобы товар попал в топ выдачи WB и Ozon.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center text-purple-400">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Скорость работы</h3>
              <p className="text-zinc-400 leading-relaxed">
                Забудьте про копирайтеров. Получите готовое, продающее описание за 5-10 секунд.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-pink-500/10 flex items-center justify-center text-pink-400">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Продающий стиль</h3>
              <p className="text-zinc-400 leading-relaxed">
                Тексты пишутся по формуле AIDA, закрывая боли клиента и побуждая к покупке.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 bg-[#0a0a0a]">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold text-center mb-16">
            Тарифы
          </h2>

          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <div className="glass-card p-8 rounded-2xl flex flex-col border-zinc-800">
              <h3 className="text-xl font-bold mb-2">Старт</h3>
              <div className="text-3xl font-bold mb-6">0 ₽ <span className="text-sm font-normal text-zinc-500">/ мес</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-2 text-zinc-300">
                  <Zap className="w-4 h-4 text-zinc-500" />
                  3 генерации в день
                </li>
                <li className="flex items-center gap-2 text-zinc-300">
                  <Zap className="w-4 h-4 text-zinc-500" />
                  Базовое качество
                </li>
              </ul>
              <Link
                href="/app"
                className="w-full py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-center transition"
              >
                Попробовать
              </Link>
            </div>

            {/* Pro Plan */}
            <div className="glass-card p-8 rounded-2xl flex flex-col border-purple-500/50 relative overflow-hidden group hover:border-purple-500/80 transition duration-300">
              <h3 className="text-xl font-bold mb-2">Premium</h3>
              <div className="text-3xl font-bold mb-6">990 ₽ <span className="text-sm font-normal text-zinc-500">/ мес</span></div>
              <ul className="space-y-4 mb-8 flex-1">
                <li className="flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Безлимитные генерации
                </li>
                <li className="flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  GPT-4o Mini (Умнее и быстрее)
                </li>
                <li className="flex items-center gap-2 text-white">
                  <Sparkles className="w-4 h-4 text-purple-400" />
                  Поддержка
                </li>
              </ul>
              <Link
                href="/pricing"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-fuchsia-600 text-white font-bold text-center hover:opacity-90 transition shadow-lg shadow-purple-900/20"
              >
                Подключить PRO
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-white/5 text-center text-zinc-600 text-sm">
        <p>&copy; 2024 WB.Scribe. Все права защищены.</p>
      </footer>
    </div>
  );
}
