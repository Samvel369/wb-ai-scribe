"use client";

import { useState } from "react";
import { Copy, Loader2, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function App() {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState("");
    const [formData, setFormData] = useState({
        name: "",
        features: "",
        marketplace: "wb", // 'wb' or 'ozon'
        tone: "selling", // 'selling', 'formal', 'friendly'
    });

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

            if (!response.ok) throw new Error("Failed to generate");

            const data = await response.json();

            // Simulate typing effect for "AI" feel
            const text = data.description;
            let i = 0;
            const interval = setInterval(() => {
                setResult((prev) => text.slice(0, i + 1));
                i++;
                if (i >= text.length) clearInterval(interval);
            }, 5); // Speed of typing

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

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white p-4 md:p-8">
            <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-8">

                {/* Left Column: Input Form */}
                <div className="space-y-6">
                    <div className="flex items-center gap-4 mb-8">
                        <Link href="/" className="p-2 rounded-full hover:bg-white/5 transition">
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-2xl font-bold flex items-center gap-2">
                            <Sparkles className="w-6 h-6 text-purple-500" />
                            Генератор Описаний
                        </h1>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6 glass-card p-6 rounded-2xl">
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

                        {/* Simulate Tone Selection (Just visible for perceived value) */}
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

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-4 rounded-xl bg-gradient-to-r from-purple-600 to-accent text-white font-bold text-lg hover:opacity-90 transition shadow-lg shadow-purple-900/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 className="animate-spin" /> : <Sparkles className="w-5 h-5 fill-current" />}
                            {loading ? "Генерируем..." : "Создать описание"}
                        </button>
                    </form>
                </div>

                {/* Right Column: Result */}
                <div className="flex flex-col h-full space-y-4">
                    <h2 className="text-xl font-bold text-zinc-400">Результат</h2>
                    <div className="flex-1 glass-card rounded-2xl p-6 relative min-h-[500px]">
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
