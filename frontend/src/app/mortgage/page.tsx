'use client';

import React, { useState } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { ArrowRight, Percent, FileText, CheckCircle2, Award, Phone } from 'lucide-react';
import Link from 'next/link';

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

function Calculator() {
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

  return (
    <div className="bg-white rounded-[40px] shadow-xl border border-gray-100 p-10 md:p-14">
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-10 border-b border-gray-100 pb-6">
        Калькулятор ипотеки
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
        <p className="text-[10px] font-black uppercase text-gray-400 tracking-[0.2em] mb-2">Ежемесячный платёж</p>
        <p className="text-5xl font-black text-remon-red tracking-tighter mb-2">{fmt(payment)} ₽</p>
        <p className="text-xs text-gray-400 mb-6">Сумма кредита: {fmt(loan)} ₽</p>
        <Link href="/register" className="block w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest text-center">
          Получить одобрение
        </Link>
      </div>
    </div>
  );
}

const programs = [
  {
    title: 'Семейная ипотека',
    rate: 'от 6%',
    desc: 'Для семей с детьми, рождёнными после 2018 года. Максимальная сумма — 12 млн ₽.',
    icon: <Percent size={28} />,
    tag: 'Популярная',
  },
  {
    title: 'IT-Ипотека',
    rate: 'от 0.1%',
    desc: 'Для сотрудников аккредитованных IT-компаний. Субсидированная ставка на весь срок.',
    icon: <Percent size={28} />,
    tag: 'Выгодная',
  },
  {
    title: 'Господдержка',
    rate: 'от 8%',
    desc: 'Доступна всем гражданам РФ на покупку новостройки. Максимальная сумма — 6 млн ₽.',
    icon: <Percent size={28} />,
    tag: 'Для всех',
  },
  {
    title: 'Льготная',
    rate: 'от 3.5%',
    desc: 'Специальные условия для отдельных категорий граждан. Уточняйте у менеджера.',
    icon: <Percent size={28} />,
    tag: 'Специальная',
  },
];

const steps = [
  { step: '01', title: 'Выбор квартиры', desc: 'Подберите квартиру в каталоге или с помощью менеджера', icon: <FileText size={32} /> },
  { step: '02', title: 'Подача заявки', desc: 'Заполните онлайн-заявку — займёт 5 минут', icon: <FileText size={32} /> },
  { step: '03', title: 'Одобрение', desc: 'Получите решение от 20+ банков за 1 день', icon: <CheckCircle2 size={32} /> },
  { step: '04', title: 'Сделка', desc: 'Подпишите договор и получите ключи', icon: <Award size={32} /> },
];

const banks = ['Сбербанк', 'ВТБ', 'Альфа-Банк', 'Газпромбанк', 'Россельхозбанк', 'Открытие', 'Совкомбанк', 'Тинькофф'];

export default function MortgagePage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="bg-remon-black text-white pt-[160px] pb-24 relative overflow-hidden">
        <div className="absolute -right-40 top-20 w-96 h-96 bg-remon-red/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="container-fluid relative z-10">
          <div className="max-w-3xl">
            <div className="inline-block border border-white/20 px-4 py-2 rounded-lg text-[10px] font-black uppercase tracking-[0.3em] mb-8 text-remon-red">
              Ипотечный центр
            </div>
            <h1 className="text-fluid-h2 font-black uppercase tracking-tighter mb-8">
              Ипотека <br />
              <span className="text-remon-red">от 0.1%</span>
            </h1>
            <p className="text-xl text-white/70 leading-relaxed mb-12 max-w-2xl font-medium">
              Мы сотрудничаем с крупнейшими банками России, чтобы предложить вам самые выгодные условия. Одобряем 98% заявок без визита в банк.
            </p>
            <div className="flex flex-wrap gap-6">
              <a href="#calculator" className="btn-primary px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3">
                Рассчитать платёж <ArrowRight size={16} />
              </a>
              <a href="tel:+79334425300" className="btn-outline border-white/30 text-white px-10 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:border-white inline-flex items-center gap-3">
                <Phone size={16} /> Позвонить
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Programs */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16">Программы</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {programs.map((p, i) => (
              <div key={i} className="bg-remon-gray rounded-3xl p-8 border border-transparent hover:border-remon-red hover:shadow-xl transition-all group">
                <div className="flex justify-between items-start mb-6">
                  <div className="w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-remon-red shadow-sm group-hover:bg-remon-red group-hover:text-white transition-all">
                    {p.icon}
                  </div>
                  <span className="text-[10px] font-black uppercase tracking-wider bg-white px-3 py-1.5 rounded-lg text-gray-500">
                    {p.tag}
                  </span>
                </div>
                <h3 className="text-xl font-black mb-2">{p.title}</h3>
                <p className="text-4xl font-black text-remon-red mb-4">{p.rate}</p>
                <p className="text-gray-500 text-sm leading-relaxed font-medium">{p.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Calculator */}
      <section id="calculator" className="section-padding bg-remon-gray">
        <div className="container-fluid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-8">
                Рассчитайте <br />
                <span className="text-remon-red">платёж</span>
              </h2>
              <p className="text-gray-500 font-medium leading-relaxed mb-8 text-lg">
                Используйте калькулятор для предварительного расчёта. Точные условия уточняйте у менеджера.
              </p>
              <div className="space-y-4">
                {['Одобрение за 1 день', 'Без визита в банк', '20+ банков-партнёров', 'Бесплатное сопровождение'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <div className="w-6 h-6 rounded-full bg-remon-red flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-white" />
                    </div>
                    <span className="font-semibold">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <Calculator />
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="section-padding bg-remon-black text-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16 text-center">
            Как получить ипотеку
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {steps.map((s, i) => (
              <div key={i} className="text-center">
                <div className="text-remon-red font-black text-6xl mb-6 opacity-20">{s.step}</div>
                <div className="flex justify-center mb-4 text-remon-red">{s.icon}</div>
                <h4 className="text-xl font-black mb-3">{s.title}</h4>
                <p className="text-white/50 text-sm font-medium leading-relaxed">{s.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Banks */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16 text-center">Банки-партнёры</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {banks.map((bank, i) => (
              <div key={i} className="bg-remon-gray rounded-2xl p-6 flex items-center justify-center text-center font-black text-lg hover:bg-remon-red hover:text-white transition-all cursor-pointer">
                {bank}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-remon-red text-white text-center">
        <div className="container-fluid">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Готовы подать заявку?</h2>
          <p className="text-white/80 text-lg font-medium mb-10 max-w-xl mx-auto">
            Оставьте заявку — менеджер свяжется с вами в течение 15 минут и подберёт лучшую программу.
          </p>
          <Link href="/register" className="bg-white text-remon-red px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest hover:bg-remon-black hover:text-white transition-all inline-flex items-center gap-3">
            Подать заявку <ArrowRight size={16} />
          </Link>
        </div>
      </section>

      <Footer />
    </main>
  );
}
