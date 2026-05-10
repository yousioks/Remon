import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, MapPin } from 'lucide-react';

const timeline = [
  { year: '2017', title: 'Основание компании', desc: 'Remon Developer основан в Тюмени. Первый проект — ЖК «Заречный».' },
  { year: '2019', title: 'Выход в Новосибирск', desc: 'Запуск проекта Grand Park в центре Новосибирска.' },
  { year: '2021', title: 'Умный дом', desc: 'Внедрение технологий умного дома во все новые проекты.' },
  { year: '2023', title: 'Омск — Кварталы Карбышева', desc: 'Старт флагманского проекта на территории бывшего аэропорта.' },
  { year: '2025', title: 'Девелопер №7 в Сибири', desc: 'Признание по версии независимой экспертной комиссии.' },
];

const stats = [
  { val: '8+', label: 'Лет на рынке' },
  { val: '12', label: 'Реализованных объектов' },
  { val: '4 500+', label: 'Счастливых семей' },
  { val: '3', label: 'Города присутствия' },
];

const team = [
  { name: 'Алексей Ремонов', role: 'Генеральный директор', img: '/photos/Вид дома 1.jpg' },
  { name: 'Мария Строева', role: 'Коммерческий директор', img: '/photos/Вид дома 2.jpg' },
  { name: 'Дмитрий Архитектов', role: 'Главный архитектор', img: '/photos/Вид дома 3.jpg' },
];

const projects = [
  { name: 'ЖК «Заречный»', city: 'Тюмень', img: '/photos/Вид дома 3.jpg', status: 'Сдан', desc: 'Флагманский проект в Тюмени. Панорамное остекление, закрытые дворы-парки.' },
  { name: 'Микрорайон «Авиатор»', city: 'Новосибирск', img: '/photos/Вид дома 4.jpg', status: 'Сдан', desc: 'Масштабный проект с собственной школой и детским садом.' },
  { name: 'Grand Park', city: 'Новосибирск', img: '/photos/Вид дома 2.jpg', status: 'IV кв. 2025', desc: 'Премиальный комплекс в центре Новосибирска.' },
  { name: 'Кварталы Карбышева', city: 'Омск', img: '/photos/Вид дома 1.jpg', status: 'II кв. 2026', desc: 'Новый квартал на территории бывшего аэропорта.' },
];

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="/photos/Вид дома 6.jpg" className="w-full h-full object-cover" alt="About Remon" />
          <div className="absolute inset-0 bg-remon-black/70" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6 pt-20">
          <p className="text-remon-red text-xs font-black uppercase tracking-[0.4em] mb-6">О компании</p>
          <h1 className="text-fluid-h2 font-black uppercase tracking-tighter mb-8">
            Remon Developer
          </h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium max-w-2xl mx-auto">
            Мы строим не просто дома, а новую историю городов Сибири. С 2017 года создаём пространства, где хочется жить, работать и мечтать.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-remon-red text-white py-16">
        <div className="container-fluid">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((s, i) => (
              <div key={i} className="text-center">
                <p className="text-5xl font-black mb-2">{s.val}</p>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* History */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div>
              <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-12">
                Наша история
              </h2>
              <div className="space-y-8">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-6">
                    <div className="shrink-0">
                      <div className="w-16 h-16 rounded-2xl bg-remon-gray flex items-center justify-center font-black text-sm text-remon-red">
                        {t.year}
                      </div>
                    </div>
                    <div className="pt-3">
                      <h4 className="font-black text-lg mb-2">{t.title}</h4>
                      <p className="text-gray-400 font-medium leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <img src="/photos/Вид дома 2.jpg" className="rounded-3xl h-64 w-full object-cover" alt="History 1" />
              <img src="/photos/Вид дома 3.jpg" className="rounded-3xl h-64 w-full object-cover mt-8" alt="History 2" />
              <img src="/photos/Вид дома 4.jpg" className="rounded-3xl h-64 w-full object-cover" alt="History 3" />
              <img src="/photos/Вид дома 5.jpg" className="rounded-3xl h-64 w-full object-cover mt-8" alt="History 4" />
            </div>
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding bg-remon-gray">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16">Наши проекты</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {projects.map((p, i) => (
              <div key={i} className="bg-white rounded-3xl overflow-hidden shadow-sm group hover:shadow-xl transition-all">
                <div className="h-64 overflow-hidden">
                  <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={p.name} />
                </div>
                <div className="p-8">
                  <div className="flex items-center gap-2 text-remon-red font-bold text-sm mb-4 uppercase tracking-widest">
                    <MapPin size={14} /> {p.city}
                    <span className="ml-auto text-[10px] bg-remon-gray px-3 py-1 rounded-lg text-gray-500">{p.status}</span>
                  </div>
                  <h3 className="text-2xl font-black mb-3">{p.name}</h3>
                  <p className="text-gray-500 leading-relaxed font-medium">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section-padding bg-remon-black text-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16 text-center">Наши ценности</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { title: 'Качество', desc: 'Используем только сертифицированные материалы и технологии. Каждый объект проходит многоуровневый контроль качества.' },
              { title: 'Инновации', desc: 'Внедряем умные технологии в каждый проект. Умный дом, энергоэффективность, экологичность — наш стандарт.' },
              { title: 'Доверие', desc: 'Прозрачность на каждом этапе. Онлайн-камеры, регулярные отчёты, личный менеджер для каждого резидента.' },
            ].map((v, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-3xl p-10 hover:bg-white/10 transition-all">
                <div className="text-remon-red font-black text-5xl mb-6 opacity-30">{String(i + 1).padStart(2, '0')}</div>
                <h3 className="text-2xl font-black uppercase mb-4">{v.title}</h3>
                <p className="text-white/50 font-medium leading-relaxed">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="container-fluid">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">Станьте резидентом Remon</h2>
          <p className="text-gray-400 text-lg font-medium mb-10 max-w-xl mx-auto">
            Выберите квартиру в одном из наших проектов и получите доступ к личному кабинету резидента.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link href="/kvartires" className="btn-primary px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3">
              Смотреть квартиры <ArrowRight size={16} />
            </Link>
            <Link href="/register" className="btn-outline px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3">
              Зарегистрироваться
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
