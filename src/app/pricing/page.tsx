"use client";

import { useState } from "react";
import { Check, Sparkles, ArrowLeft, Zap } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type BillingCycle = '1m' | '3m' | '6m' | '1y';

const TARIFFS = {
    '1m': { price: 990, label: '/ мес', savings: null },
    '3m': { price: 2490, label: '/ 3 мес', savings: 'Выгода 15%' },
    '6m': { price: 4790, label: '/ 6 мес', savings: 'Выгода 20%' },
    '1y': { price: 8990, label: '/ год', savings: 'Выгода 25%' },
};

export default function PricingPage() {
    const router = useRouter();
    const [cycle, setCycle] = useState<BillingCycle>('1m');

    const handleSubscribe = async (plan: string) => {
        if (plan === 'free') {
            router.push('/app');
        } else {
            alert(`Подключение тарифа на ${TARIFFS[cycle].label} (ID: ${cycle}) в процесссе...`);
            // TODO: Pay with RoboKassa
        }
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 font-sans">
            <div className="max-w-[1200px] mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row items-center justify-between mb-12 pt-4 pl-2 gap-6">
                    <div className="flex items-center gap-4 self-start md:self-auto">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition text-zinc-400 hover:text-white">
                            <ArrowLeft className="w-6 h-6" />
                        </Link>
                        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                            Тарифы
                        </h1>
                    </div>
                </div>

                {/* Period Selector */}
                <div className="flex flex-wrap justify-center gap-2 mb-10 max-w-4xl mx-auto">
                    {(['1m', '3m', '6m', '1y'] as const).map((c) => (
                        <button
                            key={c}
                            onClick={() => setCycle(c)}
                            className={`px-4 py-2 rounded-xl text-sm font-medium transition border ${cycle === c
                                ? "bg-white text-black border-white"
                                : "bg-white/5 text-zinc-400 border-white/5 hover:bg-white/10"
                                } relative`}
                        >
                            {c === '1m' && "1 Месяц"}
                            {c === '3m' && "3 Месяца"}
                            {c === '6m' && "6 Месяцев"}
                            {c === '1y' && "1 Год"}
                        </button>
                    ))}
                </div>

                <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                    {/* Free Plan */}
                    <div className="glass-card p-8 rounded-3xl border border-white/5 relative flex flex-col hover:border-white/10 transition duration-300">
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
                                {/* <span className="text-xs text-zinc-500 ml-auto">(Всего 5)</span> */}
                            </li>
                            <li className="flex items-center gap-3 text-zinc-300">
                                <div className="p-1 rounded-full bg-white/10">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                                <span>Базовое качество</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe('free')}
                            className="w-full py-4 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 transition font-medium text-white"
                        >
                            Попробовать
                        </button>
                    </div>

                    {/* PRO Plan */}
                    <div className="glass-card p-8 rounded-3xl border border-purple-500/30 relative flex flex-col hover:border-purple-500/50 transition duration-300 shadow-2xl shadow-purple-900/10 group">
                        {cycle === '1y' && (
                            <div className="absolute -top-4 right-8 bg-purple-600 px-3 py-1 rounded-full text-xs font-bold tracking-wider uppercase shadow-lg flex items-center gap-1">
                                <Zap className="w-3 h-3 fill-current" />
                                ХИТ ПРОДАЖ
                            </div>
                        )}

                        <div className="mb-6 relative">
                            <h3 className="text-xl font-bold mb-2 text-white flex items-center gap-2">
                                Premium
                                {TARIFFS[cycle].savings && (
                                    <span className="text-xs font-normal bg-green-500/20 text-green-400 border border-green-500/30 px-2 py-0.5 rounded-full">
                                        {TARIFFS[cycle].savings}
                                    </span>
                                )}
                            </h3>
                            <div className="flex items-baseline gap-1">
                                <span className="text-4xl font-bold transition-all duration-300">
                                    {TARIFFS[cycle].price} ₽
                                </span>
                                <span className="text-zinc-500 transition-all duration-300">
                                    {TARIFFS[cycle].label}
                                </span>
                            </div>
                            {cycle === '1y' && (
                                <p className="text-xs text-zinc-400 mt-1">
                                    (~750 ₽ / мес)
                                </p>
                            )}
                        </div>

                        <ul className="space-y-4 mb-8 flex-1">
                            <li className="flex items-center gap-3 text-zinc-200">
                                <div className="p-1 rounded-full bg-purple-500/20">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                </div>
                                <span>Безлимитные генерации</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-200">
                                <div className="p-1 rounded-full bg-purple-500/20">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                </div>
                                <span><b>GPT-4o Mini</b> (Умнее и быстрее)</span>
                            </li>
                            <li className="flex items-center gap-3 text-zinc-200">
                                <div className="p-1 rounded-full bg-purple-500/20">
                                    <Sparkles className="w-3 h-3 text-purple-400" />
                                </div>
                                <span>Поддержка</span>
                            </li>
                        </ul>

                        <button
                            onClick={() => handleSubscribe('pro')}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-purple-500 hover:from-purple-500 hover:to-purple-400 transition font-bold text-white shadow-lg shadow-purple-900/30 group-hover:scale-[1.02] transform duration-200"
                        >
                            Подключить PRO
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
