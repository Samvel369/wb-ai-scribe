import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 font-sans relative">
            <Link href="/" className="fixed top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white z-50 backdrop-blur-md border border-white/5">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Политика конфиденциальности</h1>

                <section>
                    <p>Настоящая Политика конфиденциальности персональных данных (далее – Политика конфиденциальности) действует в отношении всей информации, которую сайт https://aisellerpro.ru может получить о Пользователе во время использования сайта.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">1. Сбор и использование персональных данных</h2>
                    <p>1.1. Мы собираем следующие данные: email адрес, данные, предоставляемые при авторизации через сторонние сервисы (Google).</p>
                    <p>1.2. Цель сбора данных: идентификация пользователя, предоставление доступа к сервису, связь с пользователем.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">2. Защита данных</h2>
                    <p>2.1. Мы принимаем необходимые организационные и технические меры для защиты персональной информации пользователя от неправомерного или случайного доступа.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">3. Передача данных третьим лицам</h2>
                    <p>3.1. Мы не передаем персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">4. Контакты</h2>
                    <p>По всем вопросам касательно политики конфиденциальности можно обращаться по адресу: <a href="mailto:ai-sellerpro@yandex.ru" className="text-blue-400 hover:underline">ai-sellerpro@yandex.ru</a></p>
                </section>

                <div className="flex justify-center mt-12 mb-8">
                    <Link href="/" className="flex items-center gap-2 text-zinc-500 hover:text-white transition px-6 py-3 rounded-xl hover:bg-white/5">
                        <ArrowLeft className="w-4 h-4" />
                        Вернуться на главную
                    </Link>
                </div>
            </div>
        </div>
    );
}
