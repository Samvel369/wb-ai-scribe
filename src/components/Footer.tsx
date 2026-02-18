
import Link from 'next/link';

export default function Footer() {
    return (
        <footer className="border-t border-white/5 bg-[#0a0a0a] text-zinc-600 py-6 mt-auto">
            <div className="max-w-[1200px] mx-auto px-4 flex flex-col md:flex-row justify-between gap-8 text-xs">

                {/* Brand & Copyright */}
                <div className="space-y-2">
                    <h3 className="text-zinc-500 font-bold text-sm">AI Seller</h3>
                    <p>© {new Date().getFullYear()} Все права защищены.</p>
                </div>

                {/* Legal Links */}
                <div className="flex flex-col gap-2">
                    <h4 className="font-medium text-zinc-500 mb-1">Документы</h4>
                    <Link href="/legal/offer" className="hover:text-zinc-400 transition">Публичная оферта</Link>
                    <Link href="/legal/privacy" className="hover:text-zinc-400 transition">Политика конфиденциальности</Link>
                </div>

                {/* Company & Support */}
                <div className="flex flex-col gap-1 max-w-xs">
                    <h4 className="font-medium text-zinc-500 mb-1">Контакты и реквизиты</h4>
                    <p>Цаканян С. А. (Самозанятый)</p>
                    <p>ИНН: 860104707764</p>
                    <p>Email: <a href="mailto:ai-sellerpro@yandex.ru" className="hover:text-zinc-400 transition">ai-sellerpro@yandex.ru</a></p>
                    <p>Тел: +7 982 566-58-46</p>
                    <p className="text-[10px] text-zinc-700 mt-2 leading-tight">
                        Оплата происходит через ПАО Сбербанк с использованием банковских карт следующих платёжных систем: МИР, VISA, Mastercard Worldwide, JCB.
                    </p>
                </div>

            </div>
        </footer>
    );
}
