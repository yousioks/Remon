'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export default function RegisterPage() {
  const [form, setForm] = useState({ full_name: '', phone: '', email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [agree, setAgree] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { register } = useAuth();
  const router = useRouter();

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm(prev => ({ ...prev, [k]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!agree) { setError('Необходимо принять условия'); return; }
    setError('');
    setLoading(true);
    try {
      await register(form);
      router.push('/cabinet');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Ошибка регистрации');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen flex bg-white">
      {/* Left — image */}
      <div className="hidden lg:block lg:w-1/2 relative overflow-hidden">
        <img
          src="/photos/Вид дома 4.jpg"
          className="absolute inset-0 w-full h-full object-cover"
          alt="Remon"
        />
        <div className="absolute inset-0 bg-gradient-to-br from-remon-black/80 via-remon-black/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-between p-16">
          <Link href="/" className="text-4xl font-black tracking-tighter uppercase text-white">
            REMON<span className="text-remon-red">.</span>
          </Link>
          <div>
            <p className="text-white/50 text-xs font-black uppercase tracking-[0.3em] mb-4">Добро пожаловать</p>
            <h2 className="text-5xl font-black uppercase tracking-tighter text-white leading-none mb-6">
              Станьте<br />
              <span className="text-remon-red">резидентом.</span>
            </h2>
            <p className="text-white/60 font-medium leading-relaxed max-w-md">
              Зарегистрируйтесь, чтобы получить доступ к личному кабинету, онлайн-камерам и персональному менеджеру.
            </p>
          </div>
        </div>
      </div>

      {/* Right — form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 md:p-16">
        <div className="w-full max-w-md">
          <Link href="/login" className="inline-flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-semibold mb-10 transition-colors">
            <ArrowLeft size={16} /> Уже есть аккаунт? Войти
          </Link>

          <div className="mb-10">
            <h1 className="text-4xl font-black uppercase tracking-tighter mb-3">Регистрация</h1>
            <p className="text-gray-400 font-medium">Создайте аккаунт резидента Remon Developer</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-semibold">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">ФИО</label>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="text"
                  required
                  value={form.full_name}
                  onChange={set('full_name')}
                  placeholder="Иванов Иван Иванович"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-remon-red focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Телефон</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="tel"
                  value={form.phone}
                  onChange={set('phone')}
                  placeholder="+7 (___) ___-__-__"
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 pl-12 pr-4 outline-none focus:border-remon-red focus:bg-white transition-all font-semibold"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={set('email')}
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
                  minLength={6}
                  value={form.password}
                  onChange={set('password')}
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

            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={agree}
                onChange={e => setAgree(e.target.checked)}
                className="mt-1 w-4 h-4 rounded border-gray-300 accent-remon-red"
              />
              <span className="text-sm text-gray-500 font-medium leading-relaxed">
                Я принимаю{' '}
                <Link href="#" className="text-remon-red font-bold hover:underline">условия использования</Link>
                {' '}и{' '}
                <Link href="#" className="text-remon-red font-bold hover:underline">политику конфиденциальности</Link>
              </span>
            </label>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-remon-black text-white py-4 rounded-xl font-black uppercase tracking-widest text-sm hover:bg-remon-red transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
            >
              {loading ? 'Создаём аккаунт...' : 'Зарегистрироваться'}
            </button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center gap-4">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-bold uppercase tracking-widest">или через</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all text-sm font-bold">
              <span className="text-blue-600 font-black">VK</span>
            </button>
            <button className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all text-sm font-bold">
              <span className="text-red-500 font-black">Яндекс</span>
            </button>
            <button className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:border-gray-200 hover:bg-gray-50 transition-all text-sm font-bold">
              <span className="text-blue-400 font-black">TG</span>
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
