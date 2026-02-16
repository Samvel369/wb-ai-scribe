"use client";

import { useState, useEffect } from "react";
import { Copy, Loader2, Sparkles, ArrowLeft, LogOut, User as UserIcon, History, ChevronRight, Trash2 } from "lucide-react";
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

    // Limits
    const FREE_LIMIT = 3;

    const [formData, setFormData] = useState({
        name: "",
        features: "",
        marketplace: "wb", // 'wb' or 'ozon'
        tone: "selling", // 'selling', 'formal', 'friendly'
    });

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
                .select('generation_count, is_premium')
                .eq('id', currentUserId)
                .single();

            if (profile) {
                setGenerationCount(profile.generation_count);
                setIsPremium(profile.is_premium);
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

            // Simulate typing effect for "AI" feel
            const text = data.description;
            let i = 0;
            const interval = setInterval(() => {
                setResult((prev) => text.slice(0, i + 1));
                i++;
                if (i >= text.length) clearInterval(interval);
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
                                        <span className={`px-1.5 py-0.5 rounded ${item.marketplace === 'wb' ? 'bg-purple-500/10 text-purple-400' : 'bg-blue-500/10 text-blue-400'}`}>
                                            {item.marketplace === 'wb' ? 'WB' : 'OZON'}
                                        </span>
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
                        <div className="grid grid-cols-2 gap-4">
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, marketplace: "wb" })}
                                className={`p-4 rounded-xl border transition text-center ${formData.marketplace === "wb"
                                    ? "bg-purple-600 border-purple-500 text-white"
                                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                    }`}
                            >
                                Wildberries
                            </button>
                            <button
                                type="button"
                                onClick={() => setFormData({ ...formData, marketplace: "ozon" })}
                                className={`p-4 rounded-xl border transition text-center ${formData.marketplace === "ozon"
                                    ? "bg-blue-600 border-blue-500 text-white"
                                    : "bg-white/5 border-white/10 text-zinc-400 hover:bg-white/10"
                                    }`}
                            >
                                Ozon
                            </button>
                        </div>

                        {/* Tone Selection */}
                        <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Стиль текста</label>
                            <select
                                className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 option:bg-black"
                                value={formData.tone}
                                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                            >
                                <option value="selling" className="bg-zinc-900">Продающий (AIDA)</option>
                                <option value="formal" className="bg-zinc-900">Официальный</option>
                                <option value="friendly" className="bg-zinc-900">Дружелюбный</option>
                            </select>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-accent text-white font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
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
