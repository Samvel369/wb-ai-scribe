"use client";

import { useState } from "react";
import { Loader2, Sparkles, Zap } from "lucide-react";
import { useRouter } from "next/navigation";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";

type BillingCycle = '1m' | '3m' | '6m' | '1y';
type FastDuration = '1d' | '3d';
type PlanType = 'free' | 'fast' | 'pro';

const TARIFFS = {
    '1m': { price: 990, label: '/ мес', savings: null },
    '3m': { price: 2490, label: '/ 3 мес', savings: 'Выгода 15%' },
    '6m': { price: 4790, label: '/ 6 мес', savings: 'Выгода 20%' },
    '1y': { price: 8990, label: '/ год', savings: 'Выгода 25%' },
};

export default function PricingCards() {
    const router = useRouter();
    const [cycle, setCycle] = useState<BillingCycle>('1m');
    const [fastDuration, setFastDuration] = useState<FastDuration>('1d');
    const [selectedPlan, setSelectedPlan] = useState<PlanType | null>(null);
    const [loading, setLoading] = useState(false);

    const handleSubscribe = async (planType: PlanType) => {
        if (planType === 'free') {
            router.push('/app');
            return;
        }

        // Check authentication
        const supabase = createClientComponentClient();
        const { data: { session } } = await supabase.auth.getSession();

        if (!session) {
            router.push('/login?reason=premium');
            return;
        }

        setLoading(true);

        try {
            // Determine plan ID based on selection
            let planId = '';
            if (planType === 'fast') {
                planId = fastDuration;
            } else if (planType === 'pro') {
                planId = cycle;
            }

            // Call API to get payment URL
            const response = await fetch('/api/payment/init', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ plan: planId })
            });

            if (response.ok) {
                const data = await response.json();
                if (data.url && data.payment_id) {
                    // Store payment_id to check status later
                    localStorage.setItem('pending_payment_id', data.payment_id);
                    window.location.href = data.url;
                } else {
                    alert('Ошибка: не получена ссылка на оплату');
                    setLoading(false);
                }
            } else {
                const error = await response.json();
                console.error("Payment Error:", error);
                alert(`Ошибка оплаты:\n${error.error}\n\nДетали: ${JSON.stringify(error.details, null, 2)}`);
                setLoading(false);
            }
        } catch (e) {
            console.error(e);
            alert('Произошла ошибка сети или сервера при инициализации оплаты');
            setLoading(false);
        }
    };

    return (
        <div className="grid md:grid-cols-12 gap-6 max-w-6xl mx-auto items-start">
            {/* Колонка 1: Start (Free) */}
            <div
                onClick={() => setSelectedPlan('free')}
                className={`md:col-span-4 glass-card p-6 rounded-3xl border relative flex flex-col transition-all duration-300 cursor-pointer h-full ${selectedPlan === 'free'
                    ? "border-zinc-500 bg-zinc-900/50"
                    : "border-white/5 hover:border-white/10 opacity-80 hover:opacity-100"
                    }`}
            >
                <div className="mb-6">
                    <h3 className="text-xl font-bold mb-2 text-zinc-100">Старт</h3>
                    <div className="flex items-baseline gap-1">
                        <span className="text-4xl font-bold">0 ₽</span>
                        <span className="text-zinc-500">/ мес</span>
                    </div>
                </div>

                <ul className="space-y-4 mb-8 flex-1">
                    <li className="flex items-center gap-3 text-zinc-300">
                        <div className="p-1 rounded-full bg-white/10">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span>3 генерации в день</span>
                    </li>
                    <li className="flex items-center gap-3 text-zinc-300">
                        <div className="p-1 rounded-full bg-white/10">
                            <Sparkles className="w-3 h-3 text-white" />
                        </div>
                        <span>GPT-4o Mini (Быстро)</span>
                    </li>
                </ul>

                <button
                    onClick={(e) => { e.stopPropagation(); handleSubscribe('free'); }}
                    className="w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-medium text-white"
                >
                    Попробовать
                </button>
            </div>

            {/* Колонка 2: FAST (Tripwire) - ХИТ */}
            <div
                onClick={() => setSelectedPlan('fast')}
                className={`md:col-span-4 relative group rounded-3xl transition-all duration-300 cursor-pointer h-full ${selectedPlan === 'fast' ? "transform scale-[1.02] z-10" : "opacity-90 hover:opacity-100"
                    }`}
            >
                {/* Dynamic Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-orange-500 rounded-3xl blur transition duration-500 ${selectedPlan === 'fast' ? "opacity-75" : "opacity-0 group-hover:opacity-30"
                    }`}></div>

                <div className="relative bg-[#0a0a0a] rounded-3xl p-6 h-full border border-blue-500/30 flex flex-col">

                    {/* Бейдж ХИТ */}
                    <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3">
                        <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-lg flex items-center gap-1 animate-pulse">
                            🔥 ХИТ СТАРТА
                        </span>
                    </div>

                    <div className="mb-4">
                        <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-orange-400">FAST</h3>
                        <p className="text-zinc-400 text-sm mt-1">Тест-драйв без подписки</p>
                    </div>

                    {/* Переключатель (Visible on selection) */}
                    <div className={`overflow-hidden transition-all duration-300 ${selectedPlan === 'fast' ? 'max-h-20 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                        <div className="bg-zinc-900 p-1 rounded-xl flex relative">
                            <button
                                onClick={(e) => { e.stopPropagation(); setFastDuration('1d'); }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all z-10 ${fastDuration === '1d' ? 'text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                1 День
                            </button>
                            <button
                                onClick={(e) => { e.stopPropagation(); setFastDuration('3d'); }}
                                className={`flex-1 py-1.5 text-xs font-medium rounded-lg transition-all z-10 ${fastDuration === '3d' ? 'text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
                            >
                                3 Дня
                            </button>
                            {/* Анимированная подложка */}
                            <div className={`absolute top-1 bottom-1 w-[calc(50%-4px)] bg-zinc-800 rounded-lg transition-all duration-300 ${fastDuration === '1d' ? 'left-1' : 'left-[calc(50%+2px)]'}`}></div>
                        </div>
                    </div>

                    <div className="mb-6">
                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold text-white transition-all duration-300">
                                {fastDuration === '1d' ? '79' : '149'} ₽
                            </span>
                        </div>
                        <p className="text-xs text-zinc-500 mt-1">
                            {fastDuration === '1d' ? 'Цена чашки кофе ☕' : 'Выгодно: 50₽ в день'}
                        </p>
                    </div>

                    <div className="space-y-4 mb-8 flex-1">
                        <div className="flex items-center gap-3">
                            <Sparkles className="w-5 h-5 text-blue-400 shrink-0" />
                            <span className="text-zinc-300 text-sm">Полный безлимит</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Zap className="w-5 h-5 text-yellow-400 shrink-0" />
                            <span className="text-zinc-300 text-sm">Моментальная скорость</span>
                        </div>
                    </div>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleSubscribe('fast'); }}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-orange-600 text-white font-bold hover:opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 ${selectedPlan === 'fast' ? 'opacity-100' : 'opacity-80'}`}
                    >
                        {loading && selectedPlan === 'fast' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (fastDuration === '1d' ? 'Взять за 79₽' : 'Взять за 149₽')}
                    </button>
                </div>
            </div>

            {/* Колонка 3: PRO (Основной) */}
            <div
                onClick={() => setSelectedPlan('pro')}
                className={`md:col-span-4 relative group rounded-3xl transition-all duration-300 cursor-pointer h-full ${selectedPlan === 'pro' ? "transform scale-[1.02] z-10" : "opacity-90 hover:opacity-100"
                    }`}
            >
                {/* Dynamic Glow */}
                <div className={`absolute -inset-0.5 bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 rounded-3xl blur transition duration-500 ${selectedPlan === 'pro' ? "opacity-75" : "opacity-0 group-hover:opacity-30"
                    }`}></div>

                <div className="relative bg-[#0a0a0a] rounded-3xl p-6 h-full border border-purple-500/30 flex flex-col">

                    <div className="mb-6 relative">
                        <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
                            PRO
                            {TARIFFS[cycle].savings && (
                                <span className="text-xs font-normal bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                                    {TARIFFS[cycle].savings}
                                </span>
                            )}
                        </h3>

                        {/* Переключатель (Visible on selection) */}
                        <div className={`overflow-hidden transition-all duration-300 ${selectedPlan === 'pro' ? 'max-h-32 opacity-100 mb-6' : 'max-h-0 opacity-0 mb-0'}`}>
                            <div className="flex flex-wrap gap-2">
                                {(['1m', '3m', '6m', '1y'] as const).map((c) => (
                                    <button
                                        key={c}
                                        onClick={(e) => { e.stopPropagation(); setCycle(c); }}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition border flex-1 whitespace-nowrap ${cycle === c
                                            ? "bg-purple-600 text-white border-purple-500"
                                            : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                                            }`}
                                    >
                                        {c === '1m' && "1 Мес"}
                                        {c === '3m' && "3 Мес"}
                                        {c === '6m' && "6 Мес"}
                                        {c === '1y' && "1 Год"}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="flex items-baseline gap-1">
                            <span className="text-4xl font-bold transition-all duration-300">
                                {TARIFFS[cycle].price} ₽
                            </span>
                        </div>
                        <p className="text-zinc-500 text-sm">{TARIFFS[cycle].label}</p>
                    </div>

                    <ul className="space-y-4 mb-8 flex-1">
                        <li className="flex items-center gap-3 text-zinc-200">
                            <div className="p-1 rounded-full bg-purple-500/20">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                            </div>
                            <span><b>Безлимит</b> генераций</span>
                        </li>
                        <li className="flex items-center gap-3 text-zinc-200">
                            <div className="p-1 rounded-full bg-purple-500/20">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                            </div>
                            <span>GPT-4o Mini (Лучшее качество)</span>
                        </li>
                        <li className="flex items-center gap-3 text-zinc-200">
                            <div className="p-1 rounded-full bg-purple-500/20">
                                <Sparkles className="w-3 h-3 text-purple-400" />
                            </div>
                            <span>Приоритетная поддержка</span>
                        </li>
                    </ul>

                    <button
                        onClick={(e) => { e.stopPropagation(); handleSubscribe('pro'); }}
                        disabled={loading}
                        className={`w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 via-purple-600 to-fuchsia-600 hover:opacity-90 transition font-bold text-white shadow-lg shadow-purple-900/30 group-hover:scale-[1.02] transform duration-200 disabled:opacity-50 ${selectedPlan === 'pro' ? 'opacity-100' : 'opacity-80'}`}
                    >
                        {loading && selectedPlan === 'pro' ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : 'Подключить PRO'}
                    </button>
                </div>
            </div>
        </div>
    );
}
