import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPage() {
    return (
        <div className="min-h-screen bg-[#0a0a0a] text-zinc-300 p-8 font-sans relative">
            <Link href="/" className="fixed top-8 left-8 p-3 rounded-full bg-white/5 hover:bg-white/10 transition text-zinc-400 hover:text-white z-50 backdrop-blur-md border border-white/5">
                <ArrowLeft className="w-6 h-6" />
            </Link>
            <div className="max-w-3xl mx-auto space-y-6">
                <h1 className="text-3xl font-bold text-white mb-8">Политика в отношении обработки персональных данных</h1>

                <section>
                    <p>Настоящая Политика действует в отношении всей информации, которую сайт https://aisellerpro.ru (далее — Оператор) может получить о Пользователе во время использования сайта.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">1. Сбор и использование персональных данных</h2>
                    <p>1.1. Оператор обрабатывает следующие данные Пользователя: адрес электронной почты.</p>
                    <p>1.2. Цели обработки: регистрация на сайте, предоставление доступа к функционалу ПО, направление уведомлений, связанных с использованием сервиса, техническая поддержка.</p>
                    <p>1.3. Оператор не собирает и не хранит платежные данные (номера карт, CVC). Обработка платежей осуществляется на стороне банка-эквайера.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">2. Правовые основания обработки</h2>
                    <p>2.1. Обработка персональных данных осуществляется на основании согласия Пользователя, выраженного путем совершения конклюдентных действий (регистрация, использование сайта), а также для исполнения договора (Оферты), стороной которого является Пользователь.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">3. Передача данных третьим лицам</h2>
                    <p>3.1. Оператор не передает персональные данные третьим лицам, за исключением случаев, предусмотренных законодательством РФ, а также поставщикам услуг (хостинг, почтовые сервисы), необходимым для функционирования сайта, при условии соблюдения ими конфиденциальности.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">4. Хранение и защита данных</h2>
                    <p>4.1. Персональные данные хранятся на серверах, находящихся на территории РФ, в течение срока использования сервиса Пользователем.</p>
                    <p>4.2. Оператор принимает необходимые организационные и технические меры для защиты данных от неправомерного доступа.</p>
                </section>

                <section>
                    <h2 className="text-xl font-bold text-white mb-2">5. Контакты</h2>
                    <p>По всем вопросам, связанным с обработкой персональных данных, Пользователь может обращаться по адресу: <a href="mailto:ai-sellerpro@yandex.ru" className="text-blue-400 hover:underline">ai-sellerpro@yandex.ru</a></p>
                    <p className="mt-2">Оператор: Цаканян Самвел Артурович (Плательщик НПД), ИНН 860104707764.</p>
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
