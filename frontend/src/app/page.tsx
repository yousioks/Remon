'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, ChevronDown, Plus, Minus, Phone } from 'lucide-react';
import EditableMediaBlock from '@/components/EditableMediaBlock';
import { apiGet } from '@/lib/api';

// ─── Mortgage Calculator ───────────────────────────────────────────────────
function MortgageCalc() {
  const [program, setProgram] = useState(0.06);
  const [price, setPrice] = useState(8000000);
  const [downPct, setDownPct] = useState(20);
  const [term, setTerm] = useState(20);

  const down = Math.round(price * downPct / 100);
  const loan = price - down;
  const monthlyRate = program / 12;
  const months = term * 12;
  const payment = months === 0 ? 0 : Math.round(
    loan * monthlyRate * Math.pow(1 + monthlyRate, months) /
    (Math.pow(1 + monthlyRate, months) - 1)
  );

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

  return (
    <div className="bg-white text-remon-black p-10 md:p-14 rounded-[40px] shadow-2xl">
      <h3 className="text-2xl font-black uppercase mb-10 tracking-tighter border-b border-gray-100 pb-6">
        Калькулятор платежей
      </h3>
      <div className="space-y-8">
        <div>
          <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Программа</label>
          <select
            value={program}
            onChange={e => setProgram(Number(e.target.value))}
            className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl font-bold text-sm outline-none focus:border-remon-red transition-colors"
          >
            <option value={0.06}>Семейная ипотека (6%)</option>
            <option value={0.001}>IT-Ипотека (0.1%)</option>
            <option value={0.08}>Господдержка (8%)</option>
            <option value={0.035}>Льготная (3.5%)</option>
          </select>
        </div>
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Стоимость квартиры</label>
            <span className="text-xl font-black">{fmt(price)} ₽</span>
          </div>
          <input type="range" min={3000000} max={30000000} step={100000} value={price} onChange={e => setPrice(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Первый взнос ({downPct}%)</label>
            <span className="text-xl font-black">{fmt(down)} ₽</span>
          </div>
          <input type="range" min={15} max={90} step={5} value={downPct} onChange={e => setDownPct(Number(e.target.value))} />
        </div>
        <div>
          <div className="flex justify-between items-end mb-3">
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Срок кредита</label>
            <span className="text-xl font-black">{term} лет</span>
          </div>
          <input type="range" min={1} max={30} step={1} value={term} onChange={e => setTerm(Number(e.target.value))} />
        </div>
      </div>
      <div className="mt-10 bg-remon-gray p-8 rounded-3xl text-center">
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Ваш ежемесячный платеж</p>
        <p className="text-5xl font-black text-remon-red tracking-tighter mb-6">{fmt(payment)} ₽</p>
        <Link href="/mortgage" className="block w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-center">
          Получить одобрение
        </Link>
      </div>
    </div>
  );
}

// ─── Trade-In Calculator ───────────────────────────────────────────────────
function TradeInCalc() {
  const [rooms, setRooms] = useState('2');
  const [area, setArea] = useState(55);
  const [floor, setFloor] = useState(5);
  const [year, setYear] = useState(2005);
  const [result, setResult] = useState<number | null>(null);

  const calculate = () => {
    const base = area * 85000;
    const floorK = floor === 1 || floor > 15 ? 0.93 : 1;
    const yearK = year < 1990 ? 0.75 : year < 2000 ? 0.85 : year < 2010 ? 0.92 : 0.97;
    const roomsK = rooms === 'СТ' ? 0.9 : rooms === '1' ? 0.95 : rooms === '2' ? 1 : 1.05;
    setResult(Math.round(base * floorK * yearK * roomsK / 100000) * 100000);
  };

  const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-10 md:p-14">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-start">
        <div>
          <div className="inline-block border border-remon-red/30 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] mb-6 text-remon-red">
            Trade-In Сервис
          </div>
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
            Обменяйте старую квартиру на новую
          </h2>
          <p className="text-gray-500 font-medium leading-relaxed mb-8">
            Быстрый выкуп вашей квартиры в счёт оплаты новостройки. Оценка за 24 часа, сделка за 7 дней.
          </p>
          <div className="space-y-4">
            {['Оценка квартиры за 24 часа', 'Выкуп по рыночной цене', 'Зачёт в счёт новостройки', 'Юридическое сопровождение'].map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-remon-red/10 flex items-center justify-center text-remon-red text-xs font-black">{i + 1}</div>
                <span className="text-sm font-semibold">{item}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-3">Комнатность</label>
            <div className="flex gap-2 bg-gray-50 p-1.5 rounded-xl">
              {['СТ', '1', '2', '3+'].map(r => (
                <button
                  key={r}
                  onClick={() => setRooms(r)}
                  className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${rooms === r ? 'bg-remon-black text-white shadow-md' : 'hover:bg-white hover:shadow-sm'}`}
                >
                  {r === '1' ? '1К' : r === '2' ? '2К' : r === '3+' ? '3К+' : r}
                </button>
              ))}
            </div>
          </div>
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Площадь, м²</label>
              <span className="text-sm font-black text-remon-red">{area} м²</span>
            </div>
            <input type="range" min={20} max={200} step={1} value={area} onChange={e => setArea(Number(e.target.value))} />
          </div>
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Этаж</label>
              <span className="text-sm font-black text-remon-red">{floor}</span>
            </div>
            <input type="range" min={1} max={25} step={1} value={floor} onChange={e => setFloor(Number(e.target.value))} />
          </div>
          <div>
            <div className="flex justify-between mb-3">
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Год постройки</label>
              <span className="text-sm font-black text-remon-red">{year}</span>
            </div>
            <input type="range" min={1960} max={2024} step={1} value={year} onChange={e => setYear(Number(e.target.value))} />
          </div>
          <div className="flex gap-3">
            <button
              onClick={calculate}
              className="flex-1 btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest"
            >
              Рассчитать стоимость выкупа
            </button>
            <a
              href="tel:+73812203040"
              className="flex-1 btn-outline py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-center"
            >
              Уточнить информацию
            </a>
          </div>
          <p className="text-[10px] text-gray-400 font-medium leading-relaxed">
            * Оценка примерная, в зависимости от города и района цена может меняться в большую сторону.
          </p>
          {result !== null && (
            <div className="bg-remon-gray rounded-2xl p-6 text-center">
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">Оценочная стоимость</p>
              <p className="text-4xl font-black text-remon-red">{fmt(result)} ₽</p>
              <p className="text-xs text-gray-400 mt-2">Точная оценка — после осмотра специалистом</p>
            </div>
          )}        </div>
      </div>
    </div>
  );
}

// ─── FAQ ───────────────────────────────────────────────────────────────────
const faqs = [
  { q: 'Как купить квартиру в Remon Developer?', a: 'Выберите квартиру в каталоге, оставьте заявку или позвоните нам. Менеджер проведёт вас через все этапы: от выбора планировки до получения ключей.' },
  { q: 'Какие ипотечные программы доступны?', a: 'Мы работаем с 20+ банками-партнёрами. Доступны: семейная ипотека от 6%, IT-ипотека от 0.1%, господдержка от 8%, льготная от 3.5%.' },
  { q: 'Что такое Trade-In?', a: 'Это программа обмена вашей старой квартиры на новую. Мы выкупаем вашу квартиру по рыночной цене и засчитываем её стоимость в счёт оплаты новостройки.' },
  { q: 'Как следить за ходом строительства?', a: 'В личном кабинете резидента доступны онлайн-камеры на стройплощадке, статус строительства и регулярные отчёты.' },
  { q: 'Что входит в умный дом?', a: 'Управление освещением, климатом, системой безопасности и видеонаблюдением через мобильное приложение. Доступно для резидентов premium и business.' },
];

function FAQ() {
  const [open, setOpen] = useState<number | null>(null);
  return (
    <section className="section-padding bg-white">
      <div className="container-fluid max-w-4xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-4">FAQ</h2>
          <p className="text-gray-400 font-medium">Часто задаваемые вопросы</p>
        </div>
        <div>
          {faqs.map((faq, i) => (
            <div key={i} className={`accordion-item border-b border-gray-100 ${open === i ? 'open' : ''}`}>
              <button
                className="w-full flex justify-between items-center py-7 text-left group"
                onClick={() => setOpen(open === i ? null : i)}
              >
                <span className="text-lg font-bold group-hover:text-remon-red transition-colors pr-8">{faq.q}</span>
                <div className={`w-10 h-10 rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${open === i ? 'bg-remon-red border-remon-red text-white rotate-45' : 'border-gray-200'}`}>
                  <Plus size={16} />
                </div>
              </button>
              <div className="accordion-content">
                <p className="pb-7 text-gray-500 leading-relaxed font-medium">{faq.a}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────
const projects = [
  { name: 'Кварталы Карбышева', city: 'Омск', tag: 'Business', img: '/photos/Вид дома 1.jpg', price: 'от 5.5 млн ₽', deadline: 'II кв. 2026' },
  { name: 'Riverside HQ', city: 'Тюмень', tag: 'Business', img: '/photos/Вид дома 3.jpg', price: 'от 8.2 млн ₽', deadline: 'Сдан' },
  { name: 'Grand Park', city: 'Новосибирск', tag: 'Premium', img: '/photos/Вид дома 2.jpg', price: 'от 12.5 млн ₽', deadline: 'IV кв. 2026' },
];

const features = [
  { title: 'Умный дом', desc: 'Управление квартирой через приложение: свет, климат, безопасность, видеонаблюдение.' },
  { title: 'Дворы-парки', desc: 'Ландшафтный дизайн, зоны для йоги и воркаута, полное отсутствие машин во дворе.' },
  { title: 'Архитектура', desc: 'Панорамное остекление, вентилируемые фасады и дизайнерские лобби от ведущих бюро.' },
  { title: 'Безопасность', desc: 'Круглосуточная охрана, видеонаблюдение, контроль доступа на территорию.' },
];

export default function HomePage() {
  const [activeFilter, setActiveFilter] = useState('all');
  const [priceFilter, setPriceFilter] = useState(18.5);
  const [rooms, setRooms] = useState<string[]>([]);
  const filterRef = useRef<HTMLDivElement>(null);

  // Reveal on scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('active'); }),
      { threshold: 0.1 }
    );
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const toggleRoom = (r: string) => {
    setRooms(prev => prev.includes(r) ? prev.filter(x => x !== r) : [...prev, r]);
  };

  const filteredProjects = projects.filter(p =>
    activeFilter === 'all' || p.tag.toLowerCase() === activeFilter
  );

  return (
    <main className="min-h-screen flex flex-col bg-white">
      <Header />
      {/* ── HERO ── */}
      <section className="relative h-screen min-h-[700px] flex items-center bg-black overflow-hidden group/hero">
        <div className="absolute inset-0 z-0">
          <EditableMediaBlock 
            blockId="hero-bg" 
            defaultUrl="/photos/Вид дома 1.jpg" 
            className="w-full h-full opacity-55 scale-105"
          />
        </div>
        <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/50 to-transparent z-10" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent z-10" />

        <div className="container-fluid relative z-20 text-white w-full">
          <div className="max-w-5xl">
            <div className="reveal flex items-center gap-4 mb-8">
              <div className="w-12 h-[2px] bg-remon-red" />
              <span className="text-xs font-black uppercase tracking-[0.4em] text-remon-red">Siberian Real Estate</span>
            </div>
            <h1 className="reveal stagger-1 text-fluid-hero font-black uppercase mb-10">
              АРХИТЕКТУРА <br />
              <span className="outline-text-thick" style={{ WebkitTextStroke: '2px #ffffff', color: 'transparent' }}>НОВОГО</span> <br />
              ВРЕМЕНИ
            </h1>            <p className="reveal stagger-2 text-xl md:text-2xl text-white/75 font-medium max-w-2xl mb-12 leading-relaxed">
              Проектируем и строим интеллектуальные жилые кварталы. Девелопер №7 в Сибири по качеству формируемой среды.
            </p>
            <div className="reveal stagger-3 flex flex-wrap items-center gap-6">
              <button
                onClick={() => filterRef.current?.scrollIntoView({ behavior: 'smooth' })}
                className="btn-primary px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center gap-3"
              >
                Подобрать квартиру <ArrowRight size={16} />
              </button>
              <Link href="/about" className="btn-outline border-white/30 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-white">
                О компании
              </Link>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="absolute bottom-12 left-0 w-full z-20 hidden md:block">
          <div className="container-fluid flex gap-16">
            {[
              { label: 'Реализовано', value: '12 объектов' },
              { label: 'В строительстве', value: '8 кварталов' },
              { label: 'Счастливых семей', value: '4 500+' },
              { label: 'Лет на рынке', value: '8 лет' },
            ].map((s, i) => (
              <div key={i} className="reveal" style={{ transitionDelay: `${0.5 + i * 0.1}s` }}>
                <p className="text-remon-red font-black text-2xl mb-1">{s.value}</p>
                <p className="text-white/40 text-[10px] uppercase font-bold tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 right-12 z-20 hidden md:flex flex-col items-center gap-2 text-white/40">
          <span className="text-[9px] uppercase tracking-widest font-bold">Scroll</span>
          <ChevronDown size={16} className="animate-bounce" />
        </div>
      </section>

      {/* ── FILTER ── */}
      <section ref={filterRef} className="relative z-30 px-4 md:px-12 pb-0 pt-16">        <div className="max-w-[1500px] mx-auto bg-white rounded-[40px] shadow-[0_30px_80px_-20px_rgba(0,0,0,0.15)] p-8 lg:p-12 border border-gray-100 reveal">
          <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-end">
            {/* Project/City */}
            <div className="w-full lg:w-1/4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Проект / Город</label>
              <div className="relative">
                <select className="w-full bg-remon-gray border border-transparent hover:border-gray-200 focus:border-remon-red p-4 rounded-xl font-bold text-sm outline-none appearance-none cursor-pointer transition-all">
                  <option>Все проекты (24)</option>
                  <optgroup label="Омск">
                    <option>Кварталы Карбышева</option>
                  </optgroup>
                  <optgroup label="Тюмень">
                    <option>Riverside HQ</option>
                  </optgroup>
                  <optgroup label="Новосибирск">
                    <option>Grand Park</option>
                  </optgroup>
                </select>
                <ChevronDown size={16} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Rooms */}
            <div className="w-full lg:w-1/4">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] block mb-3">Комнатность</label>
              <div className="flex gap-2 bg-remon-gray p-1.5 rounded-xl">
                {['СТ', '1К', '2К', '3К+'].map(r => (
                  <button
                    key={r}
                    onClick={() => toggleRoom(r)}
                    className={`flex-1 py-3 rounded-lg text-xs font-black transition-all ${rooms.includes(r) ? 'bg-remon-black text-white shadow-md' : 'hover:bg-white hover:shadow-sm'}`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Budget */}
            <div className="w-full lg:w-1/4">
              <div className="flex justify-between mb-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Бюджет (млн ₽)</label>
                <span className="text-xs font-black text-remon-red">до {priceFilter}</span>
              </div>
              <input
                type="range" min={3} max={50} step={0.5} value={priceFilter}
                onChange={e => setPriceFilter(Number(e.target.value))}
              />
            </div>

            {/* Button */}
            <div className="w-full lg:w-1/4">
              <Link href="/kvartires" className="btn-primary w-full h-[52px] rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center justify-center gap-2">
                Показать лоты <ArrowRight size={16} />
              </Link>
            </div>
          </div>

          {/* Quick tags */}
          <div className="mt-8 pt-6 border-t border-gray-100 flex flex-wrap items-center gap-6">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Быстрые теги:</span>
            {['Сданы', 'С отделкой', 'Вид на реку', 'Терраса'].map(tag => (
              <label key={tag} className="flex items-center gap-2 cursor-pointer group">
                <div className="w-5 h-5 border-2 border-gray-200 rounded group-hover:border-remon-red transition-colors" />
                <span className="text-xs font-bold text-gray-600 group-hover:text-remon-red transition-colors">{tag}</span>
              </label>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROJECTS ── */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div className="reveal">
              <h2 className="text-fluid-h2 font-black uppercase tracking-tighter leading-none mb-4">
                НАШИ <br /> ФЛАГМАНЫ
              </h2>
              <p className="text-gray-500 font-medium text-lg max-w-xl">
                Инновационные жилые комплексы, меняющие архитектурный ландшафт Сибири.
              </p>
            </div>
            <div className="reveal stagger-1 flex gap-2 bg-remon-gray p-1.5 rounded-full border border-gray-200">
              {[{ key: 'all', label: 'Все' }, { key: 'business', label: 'Business' }, { key: 'premium', label: 'Premium' }].map(f => (
                <button
                  key={f.key}
                  onClick={() => setActiveFilter(f.key)}
                  className={`px-6 py-2.5 rounded-full text-xs font-black uppercase tracking-wider transition-all ${activeFilter === f.key ? 'bg-remon-black text-white shadow-lg' : 'text-gray-500 hover:text-black'}`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {filteredProjects.map((p, i) => (
              <div key={i} className="reveal group cursor-pointer" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="project-card h-[420px] mb-6">
                  <EditableMediaBlock blockId={`project-img-${i}`} defaultUrl={p.img} className="w-full h-full" alt={p.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-70 group-hover:opacity-95 transition-opacity" />
                  <div className="absolute top-6 left-6 flex gap-2 z-10">
                    <span className="bg-remon-black text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.tag}</span>
                    <span className="bg-remon-red text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">{p.city}</span>
                  </div>
                  <div className="absolute bottom-6 left-6 right-6 z-10 text-white translate-y-2 group-hover:translate-y-0 transition-all duration-500">
                    <h3 className="text-2xl font-black uppercase tracking-tighter mb-2">{p.name}</h3>
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100 flex justify-between items-center border-t border-white/20 pt-4">
                      <div>
                        <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Срок сдачи</p>
                        <p className="text-sm font-bold">{p.deadline}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-[9px] text-white/50 uppercase tracking-widest mb-1">Квартиры</p>
                        <p className="text-base font-black text-remon-red">{p.price}</p>
                      </div>
                    </div>
                  </div>
                </div>
                <Link href="/kvartires" className="flex items-center gap-2 text-sm font-black uppercase tracking-widest hover:text-remon-red transition-colors">
                  Подробнее <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── MORTGAGE ── */}
      <section className="section-padding bg-remon-black text-white relative overflow-hidden">
        <div className="absolute -left-40 top-20 w-96 h-96 bg-remon-red/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="container-fluid relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="reveal">
              <div className="inline-block border border-white/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-remon-red">
                Финансовые сервисы
              </div>
              <h2 className="text-5xl md:text-6xl font-black uppercase tracking-tighter mb-8">
                ИНДИВИДУАЛЬНЫЕ <br /> УСЛОВИЯ ПОКУПКИ
              </h2>
              <p className="text-white/70 text-lg mb-12 font-medium max-w-lg leading-relaxed">
                Наш ипотечный центр подберёт оптимальную программу среди 20+ банков-партнёров. Одобряем 98% заявок без визита в банк.
              </p>
              <div className="grid grid-cols-2 gap-6 mb-12">
                {[
                  { val: '0.1%', label: 'IT Ипотека' },
                  { val: '6.0%', label: 'Семейная' },
                  { val: '98%', label: 'Одобрений' },
                  { val: '20+', label: 'Банков' },
                ].map((s, i) => (
                  <div key={i} className="bg-white/5 border border-white/10 p-6 rounded-2xl">
                    <p className="text-3xl font-black text-remon-red mb-2">{s.val}</p>
                    <p className="text-[9px] font-black uppercase tracking-widest text-white/50">{s.label}</p>
                  </div>
                ))}
              </div>
              <Link href="/mortgage" className="btn-primary px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3">
                Все программы <ArrowRight size={16} />
              </Link>
            </div>
            <div className="reveal stagger-1">
              <MortgageCalc />
            </div>
          </div>
        </div>
      </section>

      {/* ── TRADE-IN ── */}
      <section id="tradein" className="section-padding bg-remon-gray">
        <div className="container-fluid">
          <TradeInCalc />
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-24 items-center">
            <div className="relative reveal">
              <div className="absolute -top-20 -left-20 w-64 h-64 bg-remon-red/10 blur-[100px] rounded-full" />
              <h2 className="text-fluid-h2 font-black uppercase mb-12 leading-none">
                Стандарты <br />
                <span className="outline-text">Remon</span>
              </h2>
              <div className="space-y-10">
                {features.map((f, i) => (
                  <div key={i} className="flex gap-8 group reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                    <div className="w-14 h-14 shrink-0 rounded-2xl bg-remon-gray border border-gray-100 flex items-center justify-center text-remon-red font-black text-lg group-hover:bg-remon-red group-hover:text-white transition-all duration-500">
                      {String(i + 1).padStart(2, '0')}
                    </div>
                    <div>
                      <h4 className="text-xl font-black uppercase mb-2 tracking-tight">{f.title}</h4>
                      <p className="text-gray-400 leading-relaxed font-medium">{f.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="relative h-[600px] rounded-[3rem] overflow-hidden reveal stagger-1 group/features">
              <div className="absolute inset-0 z-0">
                <EditableMediaBlock 
                  blockId="features-img" 
                  defaultUrl="/photos/Вид дома 5.jpg" 
                  className="w-full h-full"
                />
              </div>
              <div className="absolute inset-0 bg-remon-red/10 mix-blend-overlay z-10 pointer-events-none" />
              <div className="absolute bottom-10 left-10 right-10 bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 z-20 pointer-events-none">
                <p className="text-white font-black text-2xl mb-1">Умный дом</p>
                <p className="text-white/70 text-sm">Управление всей квартирой с телефона</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── NEWS ── */}
      <section id="news" className="section-padding bg-remon-gray">
        <div className="container-fluid">
          <div className="flex justify-between items-end mb-16">
            <h2 className="text-fluid-h2 font-black uppercase tracking-tighter reveal">Новости</h2>
            <Link href="#" className="text-sm font-black uppercase tracking-widest hover:text-remon-red transition-colors reveal stagger-1 flex items-center gap-2">
              Все новости <ArrowRight size={14} />
            </Link>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Старт продаж второй очереди «Кварталов Карбышева»', date: '15 июля 2025', img: '/photos/Вид дома 1.jpg', tag: 'Омск' },
              { title: 'Riverside HQ — лучший ЖК Тюмени 2024', date: '3 июня 2025', img: '/photos/Вид дома 3.jpg', tag: 'Тюмень' },
              { title: 'Обновление приложения умного дома', date: '20 мая 2025', img: '/photos/Вид дома 5.jpg', tag: 'Технологии' },
            ].map((n, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-500 reveal" style={{ transitionDelay: `${i * 0.15}s` }}>
                <div className="h-52 overflow-hidden">
                  <EditableMediaBlock blockId={`news-img-${i}`} defaultUrl={n.img} className="w-full h-full group-hover:scale-110 transition-transform duration-700" alt={n.title} />
                </div>
                <div className="p-8">
                  <span className="text-[10px] font-black uppercase tracking-widest text-remon-red mb-3 block">{n.tag}</span>
                  <h3 className="text-lg font-black mb-3 leading-tight group-hover:text-remon-red transition-colors">{n.title}</h3>
                  <p className="text-xs text-gray-400 font-bold">{n.date}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <FAQ />

      {/* ── CTA ── */}
      <section className="py-32 bg-remon-black text-white text-center relative overflow-hidden group/cta">
        <div className="absolute inset-0 z-0 opacity-20">
          <EditableMediaBlock 
            blockId="cta-bg" 
            defaultUrl="/photos/Вид дома 6.jpg" 
            className="w-full h-full"
          />
        </div>
        <div className="relative z-10 container-fluid pointer-events-none">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-8 reveal">
            Готовы выбрать <br />
            <span className="text-remon-red">свою квартиру?</span>
          </h2>
          <p className="text-white/60 text-xl font-medium mb-12 max-w-2xl mx-auto reveal stagger-1">
            Оставьте заявку — менеджер свяжется с вами в течение 15 минут и подберёт лучший вариант.
          </p>
          <div className="flex flex-wrap justify-center gap-6 reveal stagger-2">
            <Link href="/kvartires" className="btn-primary px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3">
              Смотреть квартиры <ArrowRight size={16} />
            </Link>
            <a href="tel:+73812203040" className="btn-outline border-white/30 text-white px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-white inline-flex items-center gap-3">
              <Phone size={16} /> Позвонить
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
