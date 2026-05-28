'use client';

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Mail, Lock, User, Phone, ArrowLeft } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

const TelegramLoginButton = dynamic(() => import('@/components/TelegramLoginButton'), { ssr: false });

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
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
            <a
              href={`${API_URL}/api/auth/vk`}
              title="Зарегистрироваться через ВКонтакте"
              className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all"
            >
              <VkIcon />
            </a>
            <a
              href={`${API_URL}/api/auth/yandex`}
              title="Зарегистрироваться через Яндекс"
              className="flex items-center justify-center py-3 border border-gray-100 rounded-xl hover:border-red-200 hover:bg-red-50 transition-all"
            >
              <YandexIcon />
            </a>
            <TelegramLoginButton action="register" title="Зарегистрироваться через Telegram" />
          </div>
        </div>
      </div>
    </main>
  );
}
