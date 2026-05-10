'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

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
      loginWithToken(token, refresh).then(() => {
        router.push('/cabinet');
      }).catch(() => {
        setError('Ошибка при входе через OAuth');
      });
    }
  }, [searchParams, loginWithToken, router]);
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/cabinet');
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
              <Link href="#" className="text-remon-red font-bold hover:underline">Забыли пароль?</Link>
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
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all text-sm font-bold"
            >
              <span className="text-blue-600 font-black text-base">VK</span>
            </a>
            <a
              href={`${API_URL}/api/auth/yandex`}
              className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all text-sm font-bold"
            >
              <span className="text-red-500 font-black text-base">Я</span>
            </a>
            <TelegramLoginButton apiUrl={API_URL} />
          </div>
          <p className="text-center text-gray-400 text-sm mt-10">
            Ещё не стали нашим клиентом?{' '}
            <Link href="/register" className="text-remon-red font-black hover:underline">
              Зарегистрироваться
            </Link>
          </p>

          {/* Demo hint */}
          <div className="mt-6 p-4 bg-gray-50 rounded-xl border border-gray-100 text-xs text-gray-400">
            <p className="font-bold mb-1">Демо-доступ:</p>
            <p>Резидент: <span className="font-mono text-gray-600">resident@raemon.ru</span> / <span className="font-mono text-gray-600">user123</span></p>
            <p>Админ: <span className="font-mono text-gray-600">admin@raemon.ru</span> / <span className="font-mono text-gray-600">admin123</span></p>
          </div>
        </div>
      </div>
    </main>
  );
}

// Кнопка Telegram Login Widget
function TelegramLoginButton({ apiUrl }: { apiUrl: string }) {
  const [clicked, setClicked] = useState(false);

  const handleTelegramAuth = () => {
    setClicked(true);
    // Telegram Login Widget открывает popup
    // После авторизации вызывает window.onTelegramAuth
    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'YOUR_BOT_NAME');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-auth-url', `${apiUrl}/api/auth/telegram`);
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    document.body.appendChild(script);
    setTimeout(() => setClicked(false), 3000);
  };

  return (
    <button
      onClick={handleTelegramAuth}
      disabled={clicked}
      className="flex items-center justify-center gap-2 py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all text-sm font-bold disabled:opacity-50"
    >
      <span className="text-blue-400 font-black text-base">TG</span>
    </button>
  );
}
