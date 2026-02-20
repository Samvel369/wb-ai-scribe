"use client";

import { useState, useEffect } from "react";
import { Check, Copy, Loader2, Sparkles, ArrowLeft, LogOut, User as UserIcon, History, ChevronRight, Trash2, ChevronDown, Zap } from "lucide-react";
import Link from "next/link";
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { User } from "@supabase/supabase-js";
import { useRouter } from "next/navigation";

interface Generation {
    id: string;
    product_name: string;
    description: string;
    marketplace: string;
    features: string;
    tone: string;
    created_at: string;
}

export default function App() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [user, setUser] = useState<User | null>(null);
    const [history, setHistory] = useState<Generation[]>([]);
    const [generationCount, setGenerationCount] = useState<number>(0);
    const [deletingId, setDeletingId] = useState<string | null>(null);
    const [showLimitModal, setShowLimitModal] = useState(false);

    const [isPremium, setIsPremium] = useState<boolean>(false);
    const [subscriptionPlanId, setSubscriptionPlanId] = useState<string | null>(null);
    const [subscriptionEndDate, setSubscriptionEndDate] = useState<Date | null>(null);
    const [currentSessionId] = useState(() => Math.random().toString(36).substring(2) + Date.now().toString(36));

    // Limits
    const FREE_LIMIT = 3;

    const [formData, setFormData] = useState({
        name: "",
        features: "",
        marketplace: "wb", // 'wb' or 'ozon'
        tone: "selling", // 'selling', 'formal', 'friendly'
    });

    const [isMarketplaceOpen, setIsMarketplaceOpen] = useState(false);

    const marketplaces = [
        { id: 'wb', label: 'Wildberries' },
        { id: 'ozon', label: 'Ozon' },
        { id: 'avito', label: 'Avito' },
        { id: 'instagram', label: 'Instagram' },
        { id: 'telegram', label: 'Telegram' },
        { id: 'max', label: 'MAX' },
        { id: 'yandex', label: 'Яндекс.Маркет' },
    ];

    const [isToneOpen, setIsToneOpen] = useState(false);

    const tones = [
        { id: 'selling', label: 'Продающий (AIDA)' },
        { id: 'formal', label: 'Официальный' },
        { id: 'friendly', label: 'Дружелюбный' },
    ];

    const supabase = createClientComponentClient();
    const router = useRouter();

    const fetchHistory = async (userId?: string) => {
        try {
            const currentUserId = userId || user?.id;
            if (!currentUserId) return;

            // Fetch History
            const { data: historyData, error: historyError } = await supabase
                .from('generations')
                .select('*')
                .eq('user_id', currentUserId)
                .order('created_at', { ascending: false });

            if (historyData) setHistory(historyData);
            if (historyError) console.error("Error fetching history:", historyError);

            // Fetch Profile (Limits)
            const { data: profile } = await supabase
                .from('profiles')
                .select('generation_count, is_premium, subscription_end_date, subscription_plan_id')
                .eq('id', currentUserId)
                .single();

            if (profile) {
                setGenerationCount(profile.generation_count);
                setIsPremium(profile.is_premium);
                setSubscriptionPlanId(profile.subscription_plan_id);
                if (profile.subscription_end_date) {
                    setSubscriptionEndDate(new Date(profile.subscription_end_date));
                }
            }

        } catch (e) {
            console.error("Unexpected error fetching data:", e);
        }
    };

    const handleDeleteClick = (id: string, e: React.MouseEvent) => {
        e.stopPropagation();
        setDeletingId(id);
    };

    const confirmDelete = async () => {
        if (!deletingId) return;

        const { error } = await supabase
            .from('generations')
            .delete()
            .eq('id', deletingId);

        if (error) {
            console.error("Error deleting generation:", error);
            alert("Ошибка при удалении");
        } else {
            setHistory(history.filter(item => item.id !== deletingId));
        }
        setDeletingId(null);
    };

    useEffect(() => {
        const initUser = async () => {
            const { data: { session } } = await supabase.auth.getSession();
            if (session?.user) {
                setUser(session.user);
                fetchHistory(session.user.id);
            }
        };
        initUser();

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session?.user) {
                setUser(session.user);
                fetchHistory(session.user.id);
            }
            if (event === 'SIGNED_OUT') {
                setUser(null);
                setHistory([]);
                router.refresh();
                router.push('/login');
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    // Payment Check Logic
    const [showSuccessModal, setShowSuccessModal] = useState(false);
    useEffect(() => {
        const checkPayment = async () => {
            // Check for URL parameter
            if (typeof window !== 'undefined') {
                const urlParams = new URLSearchParams(window.location.search);
                const paymentCheck = urlParams.get('payment_check');

                if (paymentCheck === 'true') {
                    const paymentId = localStorage.getItem('pending_payment_id');
                    if (paymentId) {
                        try {
                            const response = await fetch('/api/payment/check', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({ paymentId })
                            });

                            const data = await response.json();

                            if (data.success) {
                                setShowSuccessModal(true);
                                localStorage.removeItem('pending_payment_id');
                                // Remove query param without reload
                                const newUrl = window.location.pathname;
                                window.history.replaceState({}, '', newUrl);
                                // Refresh user profile
                                fetchHistory();
                            } else if (data.status === 'pending') {
                                // Maybe show a toast that payment is processing?
                                // For now, silent retry or just ignore.
                                console.log('Payment pending...');
                            } else {
                                console.error('Payment failed or cancelled');
                                // alert('Оплата не прошла или была отменена');
                            }
                        } catch (error) {
                            console.error('Error checking payment:', error);
                        }
                    }
                }
            }
        };

        checkPayment();
    }, []);

    // Session Control Logic
    useEffect(() => {
        if (!user) return;

        const setupSession = async () => {
            // 1. Claim session (update DB with current tab's ID)
            await supabase
                .from('profiles')
                .update({ active_session_id: currentSessionId })
                .eq('id', user.id);

            // 2. Listen for changes
            const channel = supabase
                .channel(`session_${user.id}`)
                .on(
                    'postgres_changes',
                    {
                        event: 'UPDATE',
                        schema: 'public',
                        table: 'profiles',
                        filter: `id=eq.${user.id}`,
                    },
                    (payload) => {
                        const newSessionId = payload.new.active_session_id;
                        if (newSessionId && newSessionId !== currentSessionId) {
                            // Another tab/device took over
                            // alert("Вы вошли с другого устройства. Эта сессия будет завершена."); // Optional: alert user
                            supabase.auth.signOut().then(() => {
                                router.refresh();
                                router.push("/login");
                            });
                        }
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        };

        setupSession();
    }, [user?.id, supabase, currentSessionId, router]);


    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.refresh();
        router.push("/login");
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setResult("");

        try {
            const response = await fetch("/api/generate", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                if (response.status === 403 && errorData.limitReached) {
                    setShowLimitModal(true);
                    setLoading(false);
                    return;
                }
                throw new Error("Failed to generate");
            }

            const data = await response.json();

            // Simulate typing effect for "AI" feel (Faster)
            const text = data.description;
            let i = 0;
            const interval = setInterval(() => {
                setResult((prev) => text.slice(0, i + 1));
                i += 10; // Speed up: 10 chars per tick instead of 1
                if (i >= text.length) {
                    setResult(text);
                    clearInterval(interval);
                }
            }, 5); // Speed of typing

            // Обновляем историю и счетчик после успешной генерации
            fetchHistory();
            // Optimistic update for smoother UX
            setGenerationCount(prev => prev + 1);

        } catch (error) {
            console.error(error);
            setResult("Произошла ошибка при генерации. Попробуйте еще раз.");
        } finally {
            setLoading(false);
        }
    };

    const copyToClipboard = () => {
        navigator.clipboard.writeText(result);
        alert("Скопировано!");
    };

    const loadHistoryItem = (item: Generation) => {
        setFormData({
            name: item.product_name,
            features: item.features || "",
            marketplace: item.marketplace,
            tone: item.tone || "selling"
        });
        setResult(item.description);
    };

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 relative">
            {/* Payment Success Modal */}
            {showSuccessModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <div className="bg-zinc-900 border border-green-500/30 rounded-2xl p-8 max-w-md w-full shadow-2xl shadow-green-900/20 animate-in fade-in zoom-in duration-300 text-center relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-green-500 to-emerald-500"></div>
                        <div className="flex justify-center mb-6">
                            <div className="p-4 rounded-full bg-green-500/10 text-green-400 border border-green-500/20">
                                <Check className="w-12 h-12" />
                            </div>
                        </div>
                        <h3 className="text-2xl font-bold mb-2 text-white">Оплата прошла успешно!</h3>
                        <p className="text-zinc-400 mb-8">
                            Спасибо за подписку! Ваш статус <span className={`${(subscriptionPlanId === '1d' || subscriptionPlanId === '3d') ? 'text-blue-400' : 'text-purple-400'} font-bold uppercase`}>
                                {(subscriptionPlanId === '1d' || subscriptionPlanId === '3d') ? 'FAST' : 'PRO'}
                            </span> активирован.
                            <br />Теперь вам доступны безлимитные генерации.
                        </p>
                        <button
                            onClick={() => setShowSuccessModal(false)}
                            className="w-full py-3 rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold hover:opacity-90 transition shadow-lg shadow-green-900/30"
                        >
                            Отлично!
                        </button>
                    </div>
                </div>
            )}
            {/* Limit Reached Modal */}
            {showLimitModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <div className="flex justify-center mb-4">
                            <div className="p-3 rounded-full bg-purple-500/20 text-purple-400">
                                <Sparkles className="w-8 h-8" />
                            </div>
                        </div>
                        <h3 className="text-xl font-bold mb-2 text-center">Лимит исчерпан</h3>
                        <p className="text-zinc-400 mb-6 text-sm text-center">
                            Вы использовали все бесплатные генерации на сегодня (3 шт).
                            <br />
                            Приходите завтра или перейдите на PRO.
                        </p>
                        <div className="flex gap-3 flex-col">
                            <Link
                                href="/pricing"
                                className="w-full py-3 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold text-center hover:opacity-90 transition"
                            >
                                Перейти на PRO
                            </Link>
                            <button
                                onClick={() => setShowLimitModal(false)}
                                className="w-full py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition font-medium text-zinc-400"
                            >
                                Понятно
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete Confirmation Modal */}
            {deletingId && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 max-w-sm w-full shadow-xl animate-in fade-in zoom-in duration-200">
                        <h3 className="text-lg font-bold mb-2">Удалить описание?</h3>
                        <p className="text-zinc-400 mb-6 text-sm">Это действие нельзя отменить.</p>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setDeletingId(null)}
                                className="flex-1 py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 transition font-medium"
                            >
                                Отмена
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="flex-1 py-2.5 rounded-xl bg-red-500/10 text-red-500 hover:bg-red-500/20 transition font-medium"
                            >
                                Удалить
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Header */}
            <div className="max-w-[1600px] mx-auto flex justify-between items-center mb-6 pl-2">
                {/* ... header content ... */}
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="text-2xl font-bold flex items-center gap-2">
                        <Sparkles className="w-6 h-6 text-purple-500" />
                        Генератор Описаний
                    </h1>
                </div>
                {user && (
                    <div className="flex items-center gap-4">
                        {/* Premium Badge Logic */}
                        {(() => {
                            // Determine badge style based on plan
                            const isFast = subscriptionPlanId === '1d' || subscriptionPlanId === '3d';
                            const badgeStyle = isPremium
                                ? isFast
                                    ? "bg-blue-900/50 border-blue-500/50 text-blue-200 shadow-[0_0_10px_rgba(59,130,246,0.3)]" // FAST Style
                                    : "bg-purple-900/50 border-purple-500/50 text-purple-200 shadow-[0_0_10px_rgba(168,85,247,0.3)]" // PRO Style
                                : "bg-white/5 border-white/10 text-zinc-500"; // Free Style

                            const iconColor = isPremium
                                ? isFast ? "text-blue-400 fill-blue-400" : "text-purple-400 fill-purple-400"
                                : "text-zinc-600";

                            const badgeText = isPremium
                                ? isFast ? "FAST" : "PRO"
                                : "FREE";

                            const textColor = isPremium
                                ? isFast ? "text-blue-100" : "text-purple-100"
                                : "text-zinc-600";

                            return (
                                <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition relative group cursor-help ${badgeStyle}`}>
                                    {isFast ? <Zap className={`w-3 h-3 ${iconColor}`} /> : <Sparkles className={`w-3 h-3 ${iconColor}`} />}
                                    <span className={textColor}>{badgeText}</span>

                                    {/* Tooltip for subscription end date */}
                                    {isPremium && subscriptionEndDate && (
                                        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-48 p-3 rounded-xl bg-[#1e1e1e] border border-white/10 shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 text-center">
                                            <p className="text-[10px] text-zinc-400 uppercase tracking-wider font-bold mb-1">Действует до</p>
                                            <p className="text-white font-medium">
                                                {subscriptionEndDate.toLocaleDateString('ru-RU', {
                                                    day: 'numeric',
                                                    month: 'long',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    )}
                                </div>
                            );
                        })()}

                        <Link
                            href="/pricing"
                            className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-900/50 to-purple-800/50 border border-purple-500/30 hover:border-purple-500/60 transition text-xs font-medium text-purple-200"
                        >
                            <Sparkles className="w-3 h-3" />
                            Тарифы
                        </Link>
                        <div className="hidden md:flex items-center gap-2 text-zinc-400">
                            <UserIcon className="w-4 h-4" />
                            <span className="text-sm">{user.email}</span>
                        </div>
                        <form action="/auth/signout" method="post">
                            <button
                                type="submit"
                                className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 transition text-sm border border-white/10"
                            >
                                <LogOut className="w-4 h-4" />
                                <span className="hidden sm:inline">Выйти</span>
                            </button>
                        </form>
                    </div>
                )}
            </div>

            <div className="max-w-[1600px] mx-auto grid lg:grid-cols-12 gap-6 h-[calc(100vh-100px)]">

                {/* History Sidebar (3 cols) */}
                <div className="lg:col-span-3 glass-card rounded-2xl p-4 flex flex-col h-full overflow-hidden">
                    <div className="flex items-center justify-between mb-4">
                        <div className="flex items-center gap-2 text-zinc-400">
                            <History className="w-5 h-5" />
                            <h2 className="font-semibold">История</h2>
                        </div>
                        {!isPremium && (
                            <div className="text-xs px-2 py-1 rounded-full bg-zinc-800 border border-zinc-700 text-zinc-400" title="Бесплатные генерации">
                                {Math.min(generationCount, FREE_LIMIT)} / {FREE_LIMIT}
                            </div>
                        )}
                    </div>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                        {history.length === 0 ? (
                            <div className="text-center text-zinc-600 py-8 text-sm">
                                История пуста
                            </div>
                        ) : (
                            history.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => loadHistoryItem(item)}
                                    className="w-full text-left p-3 rounded-xl bg-white/5 hover:bg-white/10 transition border border-white/5 hover:border-white/20 group relative pr-8 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <span className="font-medium text-sm truncate w-[90%] block text-zinc-200 group-hover:text-purple-400 transition">
                                            {item.product_name}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-2 text-xs text-zinc-500">
                                        {(() => {
                                            const mp = marketplaces.find(m => m.id === item.marketplace) || { id: item.marketplace, label: item.marketplace };
                                            let colorClass = 'bg-zinc-500/10 text-zinc-400';

                                            switch (item.marketplace) {
                                                case 'wb': colorClass = 'bg-purple-500/10 text-purple-400'; break;
                                                case 'ozon': colorClass = 'bg-blue-500/10 text-blue-400'; break;
                                                case 'avito': colorClass = 'bg-green-500/10 text-green-400'; break;
                                                case 'instagram': colorClass = 'bg-pink-500/10 text-pink-400'; break;
                                                case 'telegram': colorClass = 'bg-sky-500/10 text-sky-400'; break;
                                                case 'max': colorClass = 'bg-orange-500/10 text-orange-400'; break;
                                                case 'yandex': colorClass = 'bg-yellow-500/10 text-yellow-400'; break;
                                            }

                                            return (
                                                <span className={`px-1.5 py-0.5 rounded ${colorClass}`}>
                                                    {mp.label}
                                                </span>
                                            );
                                        })()}
                                        <span>
                                            {new Date(item.created_at).toLocaleDateString()}
                                        </span>
                                    </div>

                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteClick(item.id, e)}
                                        className="absolute top-3 right-2 opacity-0 group-hover:opacity-100 transition p-1 hover:bg-red-500/20 rounded cursor-pointer text-zinc-500 hover:text-red-400 z-10"
                                        title="Удалить"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* Input Form (4 cols) */}
                <div className="lg:col-span-4 flex flex-col h-full overflow-y-auto custom-scrollbar">
                    {/* ... form content ... */}
                    <form onSubmit={handleSubmit} className="space-y-4 glass-card p-6 rounded-2xl h-full">
                        {/* Product Name */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Название товара</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                placeholder="Например: Женское пальто оверсайз шерстяное"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            />
                        </div>

                        {/* Key Features / Keywords */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Характеристики и ключевые слова</label>
                            <textarea
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 h-32 focus:outline-none focus:ring-2 focus:ring-purple-500 transition resize-none"
                                placeholder="Впишите состав, цвет, размеры, особенности (например: непромокаемое, с капюшоном)"
                                value={formData.features}
                                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                            />
                        </div>

                        {/* Marketplace Selection */}
                        <div className={`relative ${isMarketplaceOpen ? 'z-50' : 'z-30'}`}>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Платформа</label>

                            {/* Backdrop for closing */}
                            {isMarketplaceOpen && (
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsMarketplaceOpen(false)}
                                />
                            )}

                            <div className="relative z-20">
                                <button
                                    type="button"
                                    onClick={() => setIsMarketplaceOpen(!isMarketplaceOpen)}
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 flex items-center justify-between transition group ${isMarketplaceOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="text-zinc-200">
                                        {marketplaces.find(m => m.id === formData.marketplace)?.label}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isMarketplaceOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isMarketplaceOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                                        {marketplaces.map((mp) => (
                                            <button
                                                key={mp.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, marketplace: mp.id });
                                                    setIsMarketplaceOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center justify-between ${formData.marketplace === mp.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white shadow-lg shadow-blue-900/20'
                                                    : 'text-zinc-300 hover:bg-white/5'
                                                    }`}
                                            >
                                                {mp.label}
                                                {formData.marketplace === mp.id && <Sparkles className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Tone Selection */}
                        <div className={`relative ${isToneOpen ? 'z-50' : 'z-20'}`}>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Стиль текста</label>

                            {/* Backdrop for closing */}
                            {isToneOpen && (
                                <div
                                    className="fixed inset-0 z-10"
                                    onClick={() => setIsToneOpen(false)}
                                />
                            )}

                            <div className="relative z-20">
                                <button
                                    type="button"
                                    onClick={() => setIsToneOpen(!isToneOpen)}
                                    className={`w-full bg-white/5 border rounded-xl px-4 py-3 flex items-center justify-between transition group ${isToneOpen ? 'border-purple-500 ring-2 ring-purple-500/20' : 'border-white/10 hover:bg-white/10'}`}
                                >
                                    <span className="text-zinc-200">
                                        {tones.find(t => t.id === formData.tone)?.label}
                                    </span>
                                    <ChevronDown className={`w-4 h-4 text-zinc-400 transition-transform duration-200 ${isToneOpen ? 'rotate-180' : ''}`} />
                                </button>

                                {isToneOpen && (
                                    <div className="absolute top-full left-0 right-0 mt-2 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-100 p-1">
                                        {tones.map((tone) => (
                                            <button
                                                key={tone.id}
                                                type="button"
                                                onClick={() => {
                                                    setFormData({ ...formData, tone: tone.id });
                                                    setIsToneOpen(false);
                                                }}
                                                className={`w-full text-left px-3 py-2.5 rounded-lg text-sm transition flex items-center justify-between ${formData.tone === tone.id
                                                    ? 'bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white shadow-lg shadow-blue-900/20'
                                                    : 'text-zinc-300 hover:bg-white/5'
                                                    }`}
                                            >
                                                {tone.label}
                                                {formData.tone === tone.id && <Sparkles className="w-3 h-3" />}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold text-lg hover:opacity-90 transition shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5 fill-current" />}
                                {loading ? "Генерируем..." : "Создать описание"}
                            </button>
                        </div>
                    </form>
                </div>

                {/* Right Column: Result (5 cols) */}
                <div className="lg:col-span-5 flex flex-col h-full overflow-hidden">
                    <div className="flex-1 glass-card rounded-2xl p-6 relative overflow-y-auto custom-scrollbar">
                        {result ? (
                            <>
                                <div className="whitespace-pre-wrap leading-relaxed text-zinc-200">
                                    {result}
                                </div>
                                <button
                                    onClick={copyToClipboard}
                                    className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-lg transition"
                                    title="Скопировать"
                                >
                                    <Copy className="w-5 h-5 text-white" />
                                </button>
                            </>
                        ) : (
                            <div className="h-full flex flex-col items-center justify-center text-zinc-600 space-y-4">
                                <Sparkles className="w-12 h-12 opacity-20" />
                                <p>Здесь появится ваше описание...</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
