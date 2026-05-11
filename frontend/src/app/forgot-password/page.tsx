'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Mail, ArrowLeft, Send } from 'lucide-react';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Ошибка сервера');
      setSent(true);
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
              Забыли<br />
              <span className="text-remon-red">пароль?</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed max-w-md">
              Введите email, привязанный к вашему аккаунту. Если к нему подключён Telegram — вы получите ссылку для сброса пароля.
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
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Сброс пароля</h1>
            <p className="text-gray-400 font-medium">Отправим ссылку для восстановления в Telegram</p>
          </div>

          {sent ? (
            <div className="p-6 bg-green-50 border border-green-100 rounded-2xl text-center">
              <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Send size={24} className="text-green-600" />
              </div>
              <h2 className="text-xl font-black uppercase tracking-tight mb-2">Проверьте Telegram</h2>
              <p className="text-gray-500 font-medium text-sm leading-relaxed">
                Если аккаунт с таким email существует и привязан к Telegram — вы получите сообщение со ссылкой для сброса пароля.
              </p>
              <p className="text-gray-400 text-xs mt-4">Ссылка действительна 30 минут.</p>
              <Link
                href="/login"
                className="inline-block mt-6 text-remon-red font-black text-sm hover:underline"
              >
                Вернуться ко входу
              </Link>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">
                    Email
                  </label>
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

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-remon-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-remon-red transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Отправляем...' : 'Отправить ссылку'}
                </button>
              </form>

              <p className="text-center text-gray-400 text-sm mt-8">
                Вспомнили пароль?{' '}
                <Link href="/login" className="text-remon-red font-black hover:underline">
                  Войти
                </Link>
              </p>
            </>
          )}
        </div>
      </div>
    </main>
  );
}
