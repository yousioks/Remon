'use client';

import React, { Suspense, useState, useEffect } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter } from 'next/navigation';
import { Lock, Eye, EyeOff, ArrowLeft, CheckCircle } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordInner />
    </Suspense>
  );
}

function ResetPasswordInner() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token') ?? '';

  const [tokenValid, setTokenValid] = useState<boolean | null>(null);
  const [tokenError, setTokenError] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  // Проверяем токен при загрузке страницы
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      setTokenError('Ссылка недействительна. Запросите новую.');
      return;
    }
    fetch(`${API_URL}/api/auth/reset-password/verify?token=${encodeURIComponent(token)}`)
      .then(r => r.json())
      .then(data => {
        setTokenValid(data.valid);
        if (!data.valid) setTokenError(data.error || 'Ссылка недействительна');
      })
      .catch(() => {
        setTokenValid(false);
        setTokenError('Ошибка проверки ссылки. Попробуйте позже.');
      });
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (password.length < 6) {
      setError('Пароль должен содержать минимум 6 символов');
      return;
    }
    if (password !== confirm) {
      setError('Пароли не совпадают');
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
      setSuccess(true);
      // Через 3 секунды редиректим на логин
      setTimeout(() => router.push('/login'), 3000);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка сервера');
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
            <p className="text-white/50 text-xs font-black uppercase tracking-[0.3em] mb-4">Восстановление доступа</p>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none mb-6">
              Новый<br />
              <span className="text-remon-red">пароль.</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed max-w-md">
              Придумайте надёжный пароль для вашего аккаунта резидента Remon Developer.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link
            href="/login"
            className="inline-flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-semibold mb-10 transition-colors"
          >
            <ArrowLeft size={16} /> Вернуться ко входу
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Новый пароль</h1>
            <p className="text-gray-400 font-medium">Введите новый пароль для вашего аккаунта</p>
          </div>

          {/* Токен невалиден */}
          {tokenValid === false && (
            <div className="p-6 bg-red-50 border border-red-100 rounded-2xl text-center">
              <p className="text-red-600 font-semibold mb-4">{tokenError}</p>
              <Link
                href="/forgot-password"
                className="inline-block bg-remon-black text-white py-3 px-6 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-remon-red transition-all"
              >
                Запросить новую ссылку
              </Link>
            </div>
          )}

          {/* Успех */}
          {success && (
            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle size={28} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Пароль изменён!</h2>
              <p className="text-gray-500 font-medium text-sm">
                Перенаправляем вас на страницу входа...
              </p>
            </div>
          )}

          {/* Форма */}
          {tokenValid === true && !success && (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Новый пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type={showPass ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Минимум 6 символов"
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

                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Подтвердите пароль
                  </label>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                    <input
                      type={showConfirm ? 'text' : 'password'}
                      required
                      minLength={6}
                      value={confirm}
                      onChange={e => setConfirm(e.target.value)}
                      placeholder="Повторите пароль"
                      className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-12 outline-none focus:border-remon-red focus:bg-white transition-all font-semibold"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-600 transition-colors"
                    >
                      {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-remon-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-remon-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Сохраняем...' : 'Сохранить пароль'}
                </button>
              </form>
            </>
          )}

          {/* Загрузка проверки токена */}
          {tokenValid === null && (
            <div className="text-center text-gray-400 font-medium py-8">
              Проверяем ссылку...
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
