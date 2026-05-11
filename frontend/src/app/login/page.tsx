'use client';

import React, { Suspense, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
// SVG-иконки OAuth-провайдеров
function VkIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M12.785 16.241s.288-.032.436-.194c.136-.148.132-.427.132-.427s-.02-1.304.585-1.496c.598-.19 1.365 1.26 2.179 1.815.615.422 1.082.33 1.082.33l2.17-.03s1.136-.07.597-1.006c-.044-.073-.314-.658-1.617-1.862-1.365-1.26-1.182-1.056.462-3.234.999-1.328 1.399-2.14 1.274-2.487-.12-.33-.852-.243-.852-.243l-2.44.015s-.181-.025-.315.056c-.132.08-.217.267-.217.267s-.387 1.028-.903 1.902c-1.088 1.848-1.524 1.946-1.702 1.832-.414-.267-.31-1.073-.31-1.646 0-1.79.271-2.535-.528-2.727-.265-.064-.46-.106-1.138-.113-.87-.009-1.605.003-2.02.206-.277.135-.49.437-.36.454.161.021.525.098.718.362.249.341.24 1.107.24 1.107s.143 2.11-.333 2.372c-.327.18-.775-.187-1.737-1.86-.494-.855-.868-1.8-.868-1.8s-.072-.18-.202-.277c-.157-.117-.376-.154-.376-.154l-2.318.015s-.347.01-.474.16C4.028 8.38 4.16 8.7 4.16 8.7s1.814 4.25 3.865 6.39c1.883 1.963 4.02 1.835 4.02 1.835l1.74-.016z" fill="#2787F5"/>
    </svg>
  );
}

function YandexIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#FC3F1D"/>
      <path d="M13.706 18H15.5V6h-2.44c-2.539 0-3.875 1.274-3.875 3.17 0 1.627.813 2.56 2.245 3.56L9 18h1.912l2.637-5.647-.677-.44C11.76 11.1 11.2 10.42 11.2 9.07c0-1.1.745-1.84 2.1-1.84h.406V18z" fill="white"/>
    </svg>
  );
}

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#29B6F6"/>
      <path d="M17.472 6.28L5.28 10.9c-.83.33-.82.79-.15 1l3.13.98 1.2 3.73c.16.44.31.61.64.61.26 0 .38-.12.53-.27l1.6-1.55 3.33 2.46c.61.34 1.05.16 1.2-.57l2.17-10.22c.22-.88-.33-1.28-.99-.97z" fill="white"/>
    </svg>
  );
}
const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginPageInner />
    </Suspense>
  );
}

function LoginPageInner() {  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, loginWithToken } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();

  // Обработка OAuth-редиректа (VK, Яндекс)
  useEffect(() => {
    const token = searchParams.get('token');
    const refresh = searchParams.get('refresh');
    const oauthError = searchParams.get('error');

    if (oauthError) {
      setError('Ошибка авторизации через социальную сеть. Попробуйте ещё раз.');
      return;
    }

    if (token && refresh) {
      const role = searchParams.get('role');
      loginWithToken(token, refresh).then(() => {
        if (role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cabinet');
        }
      }).catch(() => {
        setError('Ошибка при входе через OAuth');
      });
    }  }, [searchParams, loginWithToken, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      // Редирект на /admin для администраторов, иначе в личный кабинет
      if (result?.role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/cabinet');
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка входа');
    } finally {
      setLoading(false);
    }
  };
  return (
    <main className="min-h-screen flex bg-white">
      {/* Left — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/photos/Вид дома 2.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Remon"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-remon-black/80 via-remon-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-16">
          <Link href="/" className="text-4xl font-black tracking-tighter uppercase text-white">
            REMON<span className="text-remon-red">.</span>
          </Link>
          <div>
            <p className="text-white/50 text-xs font-black uppercase tracking-[0.3em] mb-4">Личный кабинет резидента</p>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none mb-6">
              Ваш дом.<br />
              <span className="text-remon-red">Ваш контроль.</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed max-w-md">
              Следите за ходом строительства, управляйте документами и общайтесь с менеджером в режиме реального времени.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link href="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-semibold mb-10 transition-colors">
            <ArrowLeft size={16} /> На главную
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Вход</h1>
            <p className="text-gray-400 font-medium">Войдите в личный кабинет резидента</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="example@mail.ru"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-remon-red focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Пароль</label>
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type={showPass ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-remon-red focus:bg-white transition-all font-semibold"
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                >
                  {showPass ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={e => setRemember(e.target.checked)}
                  className="w-4 h-4 rounded border-gray-300 accent-remon-red"
                />
                <span className="text-gray-500 font-medium">Запомнить меня</span>
              </label>
              <Link href="/forgot-password" className="text-remon-red font-bold hover:underline">Забыли пароль?</Link>
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-remon-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-remon-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Входим...' : 'Войти'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">или войти через</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* OAuth */}
          <div className="grid grid-cols-3 gap-3">
            <a
              href={`${API_URL}/api/auth/vk`}
              title="Войти через ВКонтакте"
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all"
            >
              <VkIcon />
            </a>
            <a
              href={`${API_URL}/api/auth/yandex`}
              title="Войти через Яндекс"
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <YandexIcon />
            </a>
            <TelegramLoginButton apiUrl={API_URL} />
          </div>          <p className="text-center text-gray-400 text-sm mt-10">
            Ещё не стали нашим клиентом?{' '}
            <Link href="/register" className="text-remon-red font-black hover:underline">
              Зарегистрироваться
            </Link>
          </p>

        </div>
      </div>
    </main>
  );
}

// Telegram Login Widget — виджет поверх нашей иконки
function TelegramLoginButton({ apiUrl }: { apiUrl: string }) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const [widgetLoaded, setWidgetLoaded] = useState(false);
  const [mounted, setMounted] = useState(false);

  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

  // Предотвращаем hydration mismatch — рендерим виджет только на клиенте
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted || !botName || !containerRef.current) return;
    // Уже встроен
    if (containerRef.current.childElementCount > 0) return;
    // Глобальный callback, который вызывает Telegram Widget после авторизации
    (window as unknown as Record<string, unknown>).onTelegramAuth = async (tgUser: Record<string, string>) => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgUser),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Ошибка Telegram' }));
          setError(err.error || 'Ошибка авторизации через Telegram');
          return;
        }
        const data = await res.json();
        await loginWithToken(data.accessToken, data.refreshToken);
        if (data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cabinet');
        }
      } catch {
        setError('Ошибка соединения с сервером');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    script.onload = () => setWidgetLoaded(true);
    containerRef.current.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, [mounted, apiUrl, botName, loginWithToken, router]);

  // До монтирования на клиенте — статичная заглушка (избегаем hydration mismatch)
  if (!mounted) {
    return (
      <div className="flex items-center justify-center py-3 border border-gray-100 rounded-xl">
        <TelegramIcon />
      </div>
    );
  }

  // Если имя бота не задано — показываем заглушку
  if (!botName) {    return (
      <div
        className="flex items-center justify-center py-3 border border-gray-100 rounded-xl opacity-40 cursor-not-allowed"
        title="Telegram не настроен"
      >
        <TelegramIcon />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center col-span-1">
      {/* Кнопка: наша иконка видна всегда, виджет поверх неё прозрачный */}
      <div
        className="relative flex items-center justify-center w-full py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all overflow-hidden cursor-pointer"
        style={{ minHeight: 48 }}
        title="Войти через Telegram"
      >
        {/* Иконка — всегда видна */}
        <span className="pointer-events-none z-10 flex items-center justify-center">
          <TelegramIcon />
        </span>
        {/* Виджет Telegram — прозрачный, поверх для клика */}
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ opacity: widgetLoaded ? 0.01 : 0 }}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
