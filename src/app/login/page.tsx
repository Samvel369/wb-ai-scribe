"use client";

import { createClient } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Link from "next/link";
import { ArrowLeft, Loader2, Sparkles } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Login() {
    const supabase = createClient();
    const router = useRouter();

    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [view, setView] = useState<'login' | 'sign_up'>('login');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.refresh();
                router.push('/app');
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (view === 'sign_up') {
                if (password !== confirmPassword) {
                    throw new Error("Пароли не совпадают");
                }
                const { error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: {
                        emailRedirectTo: `${location.origin}/auth/callback`,
                    },
                });
                if (error) throw error;
                // For sign up, we might need to verify email or auto-login depending on settings
                // Assuming default Supabase setting (confirm email), show message
                // Or if auto-confirm is on, it will auto-login
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
            }
        } catch (err: any) {
            setError(err.message || "Произошла ошибка");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleLogin = async () => {
        await supabase.auth.signInWithOAuth({
            provider: 'google',
            options: {
                redirectTo: `${location.origin}/auth/callback`,
            },
        });
    };

    const searchParams = useSearchParams();
    const reason = searchParams.get('reason');

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
            <Link href="/" className="fixed top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white z-50 backdrop-blur-md border border-white/5">
                <ArrowLeft className="w-6 h-6" />
            </Link>

            <div className="w-full max-w-md space-y-8">

                <div className="glass-card p-8 rounded-2xl border border-white/10 relative overflow-hidden">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Вход в AI Seller</h1>
                        <p className="text-zinc-400">
                            {view === 'login' ? 'Войдите, чтобы продолжить' : 'Создайте аккаунт для начала работы'}
                        </p>
                    </div>

                    {reason === 'premium' && (
                        <div className="bg-purple-500/10 border border-purple-500/20 rounded-xl p-4 mb-6 text-purple-300 text-sm text-center flex flex-col items-center gap-2 animate-in fade-in zoom-in duration-300">
                            <span className="p-2 bg-purple-500/20 rounded-full">
                                <Sparkles className="w-5 h-5 text-purple-400" />
                            </span>
                            <p>
                                Для подключения <b>PRO</b> необходимо <br />войти или зарегистрироваться.
                            </p>
                        </div>
                    )}

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-4 mb-6 text-red-400 text-sm text-center">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Email адрес</label>
                            <input
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                placeholder="name@example.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm text-zinc-400 mb-2">Пароль</label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                placeholder="••••••••"
                            />
                        </div>

                        {view === 'sign_up' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                                <label className="block text-sm text-zinc-400 mb-2">Повторите пароль</label>
                                <input
                                    type="password"
                                    required
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    className="w-full bg-zinc-800/50 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-purple-500 transition"
                                    placeholder="••••••••"
                                />
                            </div>
                        )}

                        {view === 'sign_up' && (
                            <p className="text-xs text-zinc-500 text-center leading-tight">
                                Нажимая кнопку «Зарегистрироваться», вы соглашаетесь с <Link href="/legal/offer" className="text-blue-400 hover:underline">Публичной офертой</Link> и <Link href="/legal/privacy" className="text-blue-400 hover:underline">Политикой конфиденциальности</Link>.
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 to-fuchsia-600 text-white font-bold hover:opacity-90 transition shadow-lg shadow-blue-900/20 disabled:opacity-50 flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <Loader2 className="w-5 h-5 animate-spin" />
                            ) : (
                                view === 'login' ? 'Войти' : 'Зарегистрироваться'
                            )}
                        </button>
                    </form>



                    <div className="mt-8 text-center text-sm">
                        <span className="text-zinc-500">
                            {view === 'login' ? 'Нет аккаунта? ' : 'Уже есть аккаунт? '}
                        </span>
                        <button
                            onClick={() => {
                                setView(view === 'login' ? 'sign_up' : 'login');
                                setError(null);
                            }}
                            className="text-white hover:underline font-medium"
                        >
                            {view === 'login' ? 'Зарегистрироваться' : 'Войти'}
                        </button>
                    </div>
                </div>
            </div>


            <div className="mt-8">
                <Link href="/" className="inline-flex items-center text-zinc-500 hover:text-white transition gap-2 px-4 py-2 rounded-lg hover:bg-white/5">
                    <ArrowLeft className="w-4 h-4" /> Назад на главную
                </Link>
            </div>
        </div >
    );
}
