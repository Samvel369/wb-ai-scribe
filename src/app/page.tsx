import Link from "next/link";
import { ArrowRight, Sparkles, TrendingUp, Zap, Infinity as InfinityIcon } from "lucide-react";
import PricingCards from "./components/PricingCards";

export default function Home() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Navbar */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/5 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-600 to-fuchsia-600 flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            AI Seller
          </div>

          <div className="flex items-center gap-6">
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
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-32 pb-20 px-4">
        {/* Background Gradients */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] bg-blue-600/20 rounded-full blur-[120px] -z-10" />

        <div className="max-w-4xl mx-auto text-center space-y-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-xs text-blue-300 mb-4">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
            </span>
            Специально для селлеров маркетплейсов
          </div>

          <h1 className="text-5xl md:text-7xl font-bold tracking-tight leading-tight">
            SEO-описания для товаров <br />
            <span className="text-gradient">за 10 секунд</span>
          </h1>

          <p className="text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto">
            Искусственный интеллект, оптимизированный для алгоритмов маркетплейсов.
            Создаем контент для повышения позиций в поиске и конверсии в корзину.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link
              href="/app"
              className="w-full sm:w-auto px-8 py-4 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold text-lg hover:opacity-90 transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
            >
              <Zap className="w-5 h-5 fill-current" />
              Попробовать бесплатно
            </Link>

          </div>
        </div>
      </section>

      {/* Stats/Social Proof (Fake for MVP) */}
      <section className="py-10 border-y border-white/5 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto px-4 flex flex-wrap justify-center gap-12 md:gap-24 text-center">
          <div>
            <div className="text-3xl font-bold text-white">~10 сек</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">На одно описание</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">99%</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Уникальность текста</div>
          </div>
          <div>
            <div className="text-3xl font-bold text-white">7</div>
            <div className="text-sm text-zinc-500 uppercase tracking-wider mt-1">Популярных площадок</div>
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
                Алгоритм автоматически использует высокочастотные ключи для улучшения ранжирования и видимости товара.
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

            {/* Feature 4 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center text-green-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">7 популярных платформ</h3>
              <p className="text-zinc-400 leading-relaxed">
                Генерируйте контент, адаптированный под требования: <br />
                <span className="text-zinc-300 font-medium">Wildberries • Ozon • Avito • Яндекс.Маркет • Instagram • Telegram • MAX</span>
              </p>
            </div>

            {/* Feature 5 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center text-orange-400">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="w-6 h-6"
                >
                  <path d="M12 20.94c1.5 0 2.75 1.06 4 1.06 3 0 6-8 6-12.22A4.91 4.91 0 0 0 17 5c-2.22 0-4 1.44-5 2-1-.56-2.78-2-5-2a4.9 4.9 0 0 0-5 4.78C2 14 5 22 8 22c1.25 0 2.5-1.06 4-1.06Z" />
                  <path d="M10 2c1 .5 2 2 2 5" />
                </svg>
              </div>
              <h3 className="text-xl font-bold">Human-like текст</h3>
              <p className="text-zinc-400 leading-relaxed">
                Нейросеть пишет живым, естественным языком, который неотличим от текста, написанного профессиональным копирайтером.
              </p>
            </div>

            {/* Feature 6 */}
            <div className="glass-card p-8 rounded-2xl space-y-4 hover:border-purple-500/30 transition duration-300">
              <div className="w-12 h-12 rounded-lg bg-fuchsia-500/10 flex items-center justify-center text-fuchsia-400">
                <InfinityIcon className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold">Безлимитные генерации</h3>
              <p className="text-zinc-400 leading-relaxed">
                Никаких ограничений. Создавайте столько описаний, сколько нужно вашему бизнесу, 24/7.
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

          <PricingCards />
        </div>
      </section>


    </div>
  );
}
