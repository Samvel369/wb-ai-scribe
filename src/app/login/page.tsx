"use client";

import { createClient } from "@/lib/supabase";
import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Login() {
    const supabase = createClient();
    const router = useRouter();

    useEffect(() => {
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN') {
                router.refresh();
                router.push('/app');
            }
        });

        return () => subscription.unsubscribe();
    }, [supabase, router]);

    return (
        <div className="min-h-screen bg-[#0a0a0a] text-white flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md space-y-8">
                <Link href="/" className="inline-flex items-center text-zinc-400 hover:text-white transition gap-2 mb-8">
                    <ArrowLeft className="w-4 h-4" /> Назад на главную
                </Link>

                <div className="glass-card p-8 rounded-2xl border border-white/10">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">Вход в WB AI Scribe</h1>
                        <p className="text-zinc-400">Войдите, чтобы сохранять историю генераций</p>
                    </div>

                    <Auth
                        supabaseClient={supabase}
                        appearance={{
                            theme: ThemeSupa,
                            variables: {
                                default: {
                                    colors: {
                                        brand: '#7c3aed',
                                        brandAccent: '#6d28d9',
                                        inputText: 'white',
                                        inputBackground: '#1f1f1f',
                                        inputBorder: '#333333',
                                    }
                                }
                            },
                            className: {
                                button: 'bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg px-4 py-2',
                                input: 'bg-zinc-800 border-zinc-700 text-white rounded-lg px-4 py-2',
                            }
                        }}
                        theme="dark"
                        providers={['google']}
                        redirectTo={`${typeof window !== 'undefined' ? window.location.origin : ''}/auth/callback`}
                        localization={{
                            variables: {
                                sign_in: {
                                    email_label: 'Email адрес',
                                    password_label: 'Пароль',
                                    button_label: 'Войти',
                                    link_text: 'Уже есть аккаунт? Войти',
                                },
                                sign_up: {
                                    email_label: 'Email адрес',
                                    password_label: 'Пароль',
                                    button_label: 'Зарегистрироваться',
                                    link_text: 'Нет аккаунта? Зарегистрироваться',
                                },
                                forgotten_password: {
                                    link_text: 'Забыли пароль?',
                                    email_label: 'Email адрес',
                                    password_label: 'Пароль',
                                    button_label: 'Восстановить пароль',
                                }
                            }
                        }}
                    />
                </div>
            </div>
        </div>
    );
}
