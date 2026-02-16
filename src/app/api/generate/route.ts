import { NextResponse } from "next/server";
import OpenAI from "openai";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Инициализация клиента
// Используем переменную окружения AI_BASE_URL для переключения между провайдерами (OpenAI, VseGPT, ProxyAPI)
const openai = new OpenAI({
    apiKey: process.env.AI_API_KEY || "dummy",
    baseURL: process.env.AI_BASE_URL || "https://api.openai.com/v1",
});

export async function POST(req: Request) {
    try {
        const { name, features, marketplace, tone } = await req.json();

        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });


        const { data: { session }, error: sessionError } = await supabase.auth.getSession();

        if (sessionError || !session) {
            // Если нет сессии и не демо режим - ошибка
            if (!process.env.AI_API_KEY || process.env.AI_API_KEY === "dummy") {
                // Demo mode logic continues below...
            } else {
                return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
            }
        }

        const userId = session?.user?.id;

        // 1. Получаем профиль пользователя (если есть userId)
        let profile = null;
        if (userId) {
            const { data: userProfile } = await supabase
                .from('profiles')
                .select('*')
                .eq('id', userId)
                .single();
            profile = userProfile;

            // Если профиля нет (старый юзер), создаем его
            if (!profile) {
                const { data: newProfile, error: createError } = await supabase
                    .from('profiles')
                    .insert({ id: userId })
                    .select()
                    .single();

                if (!createError) {
                    profile = newProfile;
                }
            }
        }

        // 2. Проверяем лимиты (ПЕРЕД ЛЮБОЙ ГЕНЕРАЦИЕЙ)
        // Логика поддневного лимита
        const FREE_LIMIT = 3;

        if (userId && profile && !profile.is_premium) {
            const now = new Date();
            const lastReset = profile.last_reset_at ? new Date(profile.last_reset_at) : new Date(0);

            // Сбрасываем счетчик, если наступил новый день (по UTC или локальному времени сервера)
            // Простое сравнение по дате
            if (now.toDateString() !== lastReset.toDateString()) {
                const { error: resetError } = await supabase
                    .from('profiles')
                    .update({ generation_count: 0, last_reset_at: now.toISOString() })
                    .eq('id', userId);

                if (!resetError) {
                    profile.generation_count = 0;
                }
            }

            if (profile.generation_count >= FREE_LIMIT) {
                return NextResponse.json(
                    { error: "Limit reached", limitReached: true },
                    { status: 403 }
                );
            }
        }

        // Проверка логики: Если ключ не установлен или равен 'dummy', возвращаем демо-ответ
        if (!process.env.AI_API_KEY || process.env.AI_API_KEY === "dummy") {
            // ... existing demo logic ...
            // Имитация задержки для реалистичности
            await new Promise((resolve) => setTimeout(resolve, 1500));
            const mockDescription = generateMockDescription(name, features, marketplace);

            // Попытка сохранить даже демо-результат
            if (userId) {
                await Promise.all([
                    saveToHistory(name, features, marketplace, tone, mockDescription),
                    supabase.rpc('increment_generation_count', { user_id: userId })
                ]);
            }

            return NextResponse.json({
                description: mockDescription,
                isMock: true
            });
        }


        const platform = marketplace === 'wb' ? 'Wildberries' : 'Ozon';

        // Промпт оптимизирован для VseGPT/OpenAI
        const systemPrompt = `Ты - профессиональный копирайтер для маркетплейсов ${platform}. 
    Твоя задача - написать продающее, SEO-оптимизированное описание товара на русском языке.
    Используй стиль: ${tone}.
    
    Пиши естественно, разделяй текст на абзацы. 
    Используй эмодзи для списков преимуществ, но не переусердствуй.
    
    Структура (не пиши названия разделов, просто следуй логике):
    1. Заголовок (H1) - эмоциональный и с ключами (CAPS LOCK).
    2. Преимущества (список с буллитами или эмодзи).
    3. Описание (AIDA - внимание, интерес, желание, действие).
    4. Характеристики (вплетены в текст или списком).
    5. Призыв к действию.
    6. Блок ключевых слов (тэги) в конце.
    
    Не пиши "Описание:", "Преимущества:" и т.д. явно, если это не требуется для структуры.`;

        const userPrompt = `Товар: ${name}.
    Особенности/Ключи: ${features}.`;

        const completion = await openai.chat.completions.create({
            messages: [
                { role: "system", content: systemPrompt },
                { role: "user", content: userPrompt },
            ],
            // Модель берется из .env, или дефолтная. VseGPT поддерживает openai/gpt-3.5-turbo
            model: process.env.AI_MODEL || "openai/gpt-3.5-turbo",
            temperature: 0.7,
        });

        const description = completion.choices[0].message.content || "";

        // 4. Сохраняем в историю и обновляем счетчик
        if (userId) {
            await Promise.all([
                saveToHistory(name, features, marketplace, tone, description),
                supabase.rpc('increment_generation_count', { user_id: userId })
            ]);
        }

        return NextResponse.json({ description, isMock: false });


    } catch (error) {
        console.error("AI Error:", error);
        return NextResponse.json(
            { error: "Failed to generate description. Check API Key." },
            { status: 500 }
        );
    }
}

async function saveToHistory(
    name: string,
    features: string,
    marketplace: string,
    tone: string,
    description: string
) {
    try {
        const cookieStore = cookies();
        const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

        const { data: { session } } = await supabase.auth.getSession();

        if (session) {
            await supabase.from('generations').insert({
                user_id: session.user.id,
                product_name: name,
                description: description,
                marketplace: marketplace,
                features: features,
                tone: tone
            });
        }
    } catch (e: any) {
        console.error("Failed to save history:", e);
    }
}

function generateMockDescription(name: string, features: string, mp: string) {
    const platform = mp === 'wb' ? 'Wildberries' : 'Ozon';

    return `[ДЕМО РЕЖИМ]
🔥 ${name.toUpperCase()} — ХИТ ПРОДАЖ НА ${platform.toUpperCase()}! 🔥

Ищете идеальный ${name}? Вы его нашли! Наш товар сочетает в себе стиль, качество и удобство.

✅ ПРЕИМУЩЕСТВА:
${features ? `- ${features.split(',').join('\n- ')}` : '- Высокое качество материалов\n- Долговечность и надежность\n- Стильный дизайн 2024 года'}

📝 ОПИСАНИЕ:
Представляем вам ${name} — незаменимый выбор для тех, кто ценит комфорт. Этот товар отлично подойдет как для повседневного использования, так и в качестве подарка. Мы используем только проверенные материалы, чтобы вы остались довольны покупкой.

⭐ ПОЧЕМУ ВЫБИРАЮТ НАС:
• Быстрая доставка
• Гарантия качества
• Тысячи довольных клиентов

🚀 Успейте заказать ${name} по выгодной цене прямо сейчас! Добавляйте в корзину, пока товар есть в наличии.

Ключевые слова: ${name}, ${features}, купить на ${platform}, подарок, скидки, акция.`;
}
