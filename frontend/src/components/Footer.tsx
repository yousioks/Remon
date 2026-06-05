import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer id="contacts" className="bg-remon-black text-white pt-20 pb-10 border-t-[6px] border-remon-red">
      <div className="container-fluid">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">

          {/* Brand */}
          <div className="lg:col-span-4">
            <Link href="/" className="text-4xl font-black tracking-tighter uppercase mb-6 block">
              REMON<span className="text-remon-red">.</span>
            </Link>
            <p className="text-gray-400 text-sm leading-relaxed mb-8 font-medium max-w-xs">
              Федеральный девелопер с глубокими сибирскими корнями. Строим архитектурные доминанты в Омске, Тюмени и Новосибирске.
            </p>
            <div className="flex gap-4">
              {['VK', 'TG', 'YT'].map(s => (
                <div key={s} className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center text-xs font-black hover:bg-remon-red hover:border-remon-red transition-all cursor-pointer">
                  {s}
                </div>
              ))}
            </div>
          </div>

          {/* Projects */}
          <div className="lg:col-span-2">
            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6">Проекты</h5>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/kvartires" className="hover:text-white transition-colors">Кварталы Карбышева</Link></li>
              <li><Link href="/kvartires" className="hover:text-white transition-colors">Riverside HQ</Link></li>
              <li><Link href="/kvartires" className="hover:text-white transition-colors">Grand Park</Link></li>
            </ul>
          </div>

          {/* Buyers */}
          <div className="lg:col-span-2">
            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6">Покупателям</h5>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/mortgage" className="hover:text-white transition-colors">Ипотека</Link></li>
              <li><Link href="/#tradein" className="hover:text-white transition-colors">Trade-In</Link></li>
              <li><Link href="/kvartires" className="hover:text-white transition-colors">Каталог квартир</Link></li>
              <li><Link href="/cabinet" className="hover:text-white transition-colors">Личный кабинет</Link></li>
            </ul>
          </div>

          {/* Company */}
          <div className="lg:col-span-2">
            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6">Компания</h5>
            <ul className="space-y-3 text-sm font-medium text-gray-400">
              <li><Link href="/about" className="hover:text-white transition-colors">О нас</Link></li>
              <li><Link href="/#news" className="hover:text-white transition-colors">Новости</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Карьера</Link></li>
              <li><Link href="#" className="hover:text-white transition-colors">Документы</Link></li>
            </ul>
          </div>

          {/* Contacts */}
          <div className="lg:col-span-2 lg:col-start-11">
            <h5 className="text-[10px] font-black uppercase text-gray-500 tracking-[0.2em] mb-6">Контакты</h5>
            <div className="space-y-3 text-sm text-gray-400">
              <p>г. Омск, ул. Ленина, 10</p>
              <a href="tel:+79334425300" className="block text-white font-black text-lg hover:text-remon-red transition-colors">
                +7 (933) 442-53-00
              </a>
              <a href="mailto:info@raemon.ru" className="hover:text-white transition-colors">info@raemon.ru</a>
              <p className="text-xs text-gray-600">Пн–Пт: 9:00–20:00<br />Сб–Вс: 10:00–18:00</p>
            </div>
          </div>
        </div>

        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-600">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <p>© 2026 ООО «СЗ РЕМОН ДЕВЕЛОПМЕНТ». Все права защищены.</p>
            <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-widest text-gray-500">
              <span>powered by</span>
              <a href="https://t.me/mrazevestate" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-remon-red decoration-2 underline-offset-4">
                MRAZEV ESTATE
              </a>
              <span className="opacity-30">|</span>
              <span>design by</span>
              <a href="https://t.me/mrazevestate" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors underline decoration-remon-red decoration-2 underline-offset-4">
                MRAZEV ESTATE
              </a>
            </div>
          </div>
          <div className="flex gap-6">
            <Link href="#" className="hover:text-white transition-colors">Политика конфиденциальности</Link>
            <Link href="#" className="hover:text-white transition-colors">Публичная оферта</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
