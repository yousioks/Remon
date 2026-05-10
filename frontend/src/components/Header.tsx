'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { User, Menu, X, MapPin, ChevronDown, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
const cities = ['Омск', 'Тюмень', 'Новосибирск'];

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(' ');
}

export default function Header() {
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [currentCity, setCurrentCity] = useState('Омск');
  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const { user, logout } = useAuth();
  const router = useRouter();

  // Закрываем дропдауны при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (cityRef.current && !cityRef.current.contains(e.target as Node)) {
        setIsCityOpen(false);
      }
      if (userRef.current && !userRef.current.contains(e.target as Node)) {
        setIsUserOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    await logout();
    router.push('/');
  };

  // Шапка всегда белая — без зависимости от скролла и страницы  return (
    <>
      {/* Top marquee */}
      <div className="marquee-container border-b border-white/10 z-[200] relative">
        <div className="marquee-content">
          {[
            '⚡ СУБСИДИРОВАННАЯ ИПОТЕКА 0.1% ДЛЯ IT',
            '🏠 TRADE-IN: ОБМЕН КВАРТИРЫ ЗА 24 ЧАСА',
            '🎁 КЛАДОВАЯ В ПОДАРОК ПРИ ПОКУПКЕ 3-К',
            '🔥 СТАРТ ПРОДАЖ «КВАРТАЛЫ КАРБЫШЕВА» В ОМСКЕ',
            '⭐ ДЕВЕЛОПЕР №7 В СИБИРИ',
            '⚡ СУБСИДИРОВАННАЯ ИПОТЕКА 0.1% ДЛЯ IT',
            '🏠 TRADE-IN: ОБМЕН КВАРТИРЫ ЗА 24 ЧАСА',
            '🎁 КЛАДОВАЯ В ПОДАРОК ПРИ ПОКУПКЕ 3-К',
            '🔥 СТАРТ ПРОДАЖ «КВАРТАЛЫ КАРБЫШЕВА» В ОМСКЕ',
            '⭐ ДЕВЕЛОПЕР №7 В СИБИРИ',
          ].map((item, i) => (
            <div key={i} className="marquee-item">{item}</div>
          ))}
        </div>
      </div>

      {/* Main header — всегда белый */}
      <header className="fixed top-[36px] left-0 w-full z-[100] bg-white shadow-sm border-b border-gray-100 h-[70px]">
        <div className="container-fluid h-full flex justify-between items-center">

          {/* Logo */}
          <Link href="/" className="text-3xl font-black tracking-tighter uppercase z-50">
            <span className="text-black">
              REMON<span className="text-remon-red">.</span>
            </span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden lg:flex items-center gap-8">
            {[
              { name: 'Проекты', href: '/proekti' },
              { name: 'Квартиры', href: '/kvartires' },
              { name: 'Ипотека', href: '/mortgage' },
              { name: 'О компании', href: '/about' },
              { name: 'Контакты', href: '#contacts' },
            ].map((link) => (
              <Link
                key={link.name}
                href={link.href}
                className="text-[11px] font-extrabold uppercase tracking-[0.15em] relative group text-black hover:text-remon-red transition-colors duration-300"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-remon-red transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>

          {/* Right side */}
          <div className="flex items-center gap-4 md:gap-6">
            {/* Phone */}
            <div className="hidden xl:flex flex-col items-end text-black">
              <a href="tel:+73812203040" className="text-base font-black hover:text-remon-red transition-colors">
                +7 (3812) 20-30-40
              </a>
              <span className="text-[9px] uppercase font-bold opacity-50 tracking-widest">Заказать звонок</span>
            </div>

            {/* City selector */}
            <div ref={cityRef} className="relative hidden md:flex items-center">
              <button
                className="flex items-center gap-1 cursor-pointer text-[11px] font-bold uppercase tracking-wider text-black hover:text-remon-red transition-colors"
                onClick={() => setIsCityOpen(prev => !prev)}
              >
                <MapPin size={13} />
                <span>{currentCity}</span>
                <ChevronDown size={11} className={cn('transition-transform', isCityOpen && 'rotate-180')} />
              </button>
              {isCityOpen && (
                <div className="absolute top-full right-0 mt-2 bg-white text-black rounded-xl shadow-2xl min-w-[140px] overflow-hidden z-[200] border border-gray-100">
                  {cities.map(city => (
                    <div
                      key={city}
                      className="px-4 py-3 hover:bg-gray-50 hover:text-remon-red transition-colors text-sm font-semibold cursor-pointer"
                      onClick={() => { setCurrentCity(city); setIsCityOpen(false); }}
                    >
                      {city}
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* User button */}
            {user ? (
              <div ref={userRef} className="relative">
                <button
                  onClick={() => setIsUserOpen(prev => !prev)}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl font-bold text-[11px] uppercase tracking-wider bg-black text-white hover:bg-remon-red transition-all"
                >
                  <User size={16} />
                  <span className="hidden sm:inline">{user.full_name?.split(' ')[0] || 'Кабинет'}</span>
                </button>
                {isUserOpen && (
                  <div className="absolute top-full right-0 mt-2 bg-white text-black rounded-xl shadow-2xl min-w-[180px] overflow-hidden z-[200] border border-gray-100">
                    <Link href="/cabinet" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-semibold">
                      <User size={15} /> Личный кабинет
                    </Link>
                    {user.role === 'admin' && (
                      <Link href="/admin" className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-semibold text-remon-red">
                        ⚙ Админ-панель
                      </Link>
                    )}
                    <div className="border-t border-gray-100" />
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors text-sm font-semibold text-gray-500 w-full text-left"
                    >
                      <LogOut size={15} /> Выйти
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link href="/login" className="flex items-center gap-2 px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest bg-black text-white hover:bg-remon-red transition-all">
                <User size={15} />
                <span className="hidden sm:inline">Личный кабинет</span>
              </Link>
            )}

            {/* Mobile burger */}
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 text-black transition-colors hover:bg-gray-200"
              onClick={() => setIsMobileOpen(!isMobileOpen)}
            >
              {isMobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </header>
      {/* Mobile menu */}
      <div className={cn(
        'fixed inset-0 bg-remon-black text-white z-[90] transition-all duration-700 flex flex-col justify-center px-10',
        isMobileOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      )}>
        <div className="space-y-6 mt-20">
          {[
            { name: 'Проекты', href: '/proekti' },
            { name: 'Квартиры', href: '/kvartires' },
            { name: 'Ипотека', href: '/mortgage' },
            { name: 'О компании', href: '/about' },
            { name: 'Личный кабинет', href: user ? '/cabinet' : '/login' },
          ].map((item) => (            <Link
              key={item.name}
              href={item.href}
              className="block text-4xl font-black uppercase tracking-tighter hover:text-remon-red transition-colors"
              onClick={() => setIsMobileOpen(false)}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="mt-16 border-t border-white/20 pt-8">
          <p className="text-sm font-bold text-gray-400 mb-2">Отдел продаж</p>
          <a href="tel:+73812203040" className="text-2xl font-black hover:text-remon-red transition-colors">
            +7 (3812) 20-30-40
          </a>
        </div>
      </div>

      {/* Spacer только для marquee-строки (36px) — без дополнительной белой линии */}
      <div className="h-[36px]" style={{ visibility: 'hidden', pointerEvents: 'none' }} />    </>
  );
}
