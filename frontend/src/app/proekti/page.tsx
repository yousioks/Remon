import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import Link from 'next/link';
import { ArrowRight, MapPin, Award, Calendar, CheckCircle } from 'lucide-react';

const timeline = [
  {
    year: '2017',
    title: 'Основание ООО «Ремон Девелопер»',
    desc: 'Компания основана в Тюмени. Первый проект — ЖК «Riverside HQ» на Первой Набережной. Старт строительства двух жилых корпусов с видом на реку.',
    status: 'done',
  },
  {
    year: '2019',
    title: 'Сдача Riverside HQ',
    desc: 'Успешная сдача всех корпусов ЖК «Riverside HQ». Более 400 семей получили ключи. Проект признан лучшим жилым комплексом Тюмени по версии независимой экспертной комиссии.',
    status: 'done',
  },
  {
    year: '2020',
    title: 'Выход в Новосибирск',
    desc: 'Запуск проекта «Grand Park» в Центральном районе Новосибирска. Авторская архитектура, консьерж-сервис, закрытые дворы-парки.',
    status: 'done',
  },
  {
    year: '2021',
    title: 'Умный дом — новый стандарт',
    desc: 'Внедрение технологий умного дома во все новые проекты. Управление климатом, освещением и безопасностью через единое приложение.',
    status: 'done',
  },
  {
    year: '2023',
    title: 'Старт «Кварталов Карбышева»',
    desc: 'Флагманский проект в Омске на территории бывшего аэропорта. Масштабный жилой квартал с умными технологиями, закрытыми дворами-парками и панорамным остеклением.',
    status: 'done',
  },
  {
    year: '2026',
    title: 'Девелопер №7 в Сибири',
    desc: 'ООО «Ремон Девелопер» признан девелопером №7 в Сибири по качеству формируемой среды по версии независимой экспертной комиссии.',    status: 'done',
  },
  {
    year: '2028',
    title: 'Сдача 1-й очереди «Кварталов Карбышева»',
    desc: 'Плановая сдача первой очереди флагманского проекта в Омске. Корпуса А и Б, 9 этажей, 320 квартир.',
    status: 'upcoming',
  },
  {
    year: '2029',
    title: 'Сдача 2-й очереди «Кварталов Карбышева»',
    desc: 'Завершение строительства второй очереди. Корпуса В и Г, коммерческие помещения, благоустройство всей территории квартала.',
    status: 'upcoming',
  },
];

const awards = [
  { year: '2019', title: 'Лучший ЖК Тюмени', org: 'Независимая экспертная комиссия' },
  { year: '2021', title: 'Инновации в строительстве', org: 'Сибирский строительный форум' },
  { year: '2022', title: 'Лучший застройщик Западной Сибири', org: 'Urban Awards' },
  { year: '2023', title: 'Экологичный девелопер года', org: 'GreenBuild Russia' },
  { year: '2024', title: 'Девелопер №7 в Сибири', org: 'Рейтинг качества среды' },
  { year: '2026', title: 'Лучший проект умного дома', org: 'PropTech Russia' },
];

const projects = [
  {
    name: 'Riverside HQ',
    city: 'Тюмень',
    img: '/photos/Вид дома 3.jpg',
    status: 'Сдан',
    statusColor: 'bg-green-100 text-green-700',
    year: '2017–2019',
    desc: 'Флагманский проект компании. Жилой комплекс на Первой Набережной Тюмени с видом на реку. Панорамное остекление, дизайнерские лобби, умный дом. Более 400 квартир, 2 корпуса по 17 этажей. Строительство завершено в 2019 году — все жильцы довольны.',
    facts: ['400+ квартир', '2 корпуса', '17 этажей', 'Вид на реку'],
  },
  {
    name: 'Grand Park',
    city: 'Новосибирск',
    img: '/photos/Вид дома 2.jpg',
    status: 'IV кв. 2026',
    statusColor: 'bg-yellow-100 text-yellow-700',
    year: '2020–2026',    desc: 'Премиальный жилой комплекс в Центральном районе Новосибирска. Авторская архитектура от ведущего бюро, консьерж-сервис, закрытые дворы-парки без машин. Квартиры от 2-комнатных до пентхаусов.',
    facts: ['200+ квартир', '12 этажей', 'Центр города', 'Консьерж-сервис'],
  },
  {
    name: 'Кварталы Карбышева',
    city: 'Омск',
    img: '/photos/Вид дома 1.jpg',
    status: 'I кв. 2028 / II кв. 2029',
    statusColor: 'bg-blue-100 text-blue-700',
    year: '2023–2029',
    desc: 'Масштабный жилой квартал на территории бывшего аэропорта Омска. Умные технологии, закрытые дворы-парки, панорамное остекление. Две очереди строительства: первая сдаётся в I квартале 2028 года, вторая — во II квартале 2029 года.',
    facts: ['600+ квартир', '4 корпуса', '9 этажей', 'Умный дом'],
  },
];

export default function ProektiPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <Header />

      {/* Hero */}
      <section className="relative h-[600px] flex items-center justify-center text-white overflow-hidden">
        <div className="absolute inset-0">
          <img src="/photos/Вид дома 1.jpg" className="w-full h-full object-cover" alt="Проекты Remon" />
          <div className="absolute inset-0 bg-remon-black/75" />
        </div>
        <div className="relative z-10 text-center max-w-4xl px-6 pt-20">
          <p className="text-remon-red text-xs font-black uppercase tracking-[0.4em] mb-6">Наши проекты</p>
          <h1 className="text-fluid-h2 font-black uppercase tracking-tighter mb-8">
            Строим историю <br />
            <span className="text-remon-red">Сибири</span>
          </h1>
          <p className="text-xl text-white/70 leading-relaxed font-medium max-w-2xl mx-auto">
            С 2017 года ООО «Ремон Девелопер» реализует жилые кварталы нового поколения в Тюмени, Новосибирске и Омске.
          </p>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-remon-red text-white py-16">
        <div className="container-fluid">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { val: '8+', label: 'Лет на рынке' },
              { val: '12', label: 'Реализованных объектов' },
              { val: '4 500+', label: 'Счастливых семей' },
              { val: '6', label: 'Наград и премий' },
            ].map((s, i) => (
              <div key={i}>
                <p className="text-5xl font-black mb-2">{s.val}</p>
                <p className="text-white/70 text-sm font-bold uppercase tracking-widest">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Projects */}
      <section className="section-padding bg-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16">Все проекты</h2>
          <div className="space-y-16">
            {projects.map((p, i) => (
              <div
                key={i}
                className={`grid grid-cols-1 lg:grid-cols-2 gap-12 items-center ${i % 2 === 1 ? 'lg:flex-row-reverse' : ''}`}
              >
                <div className={`relative h-[420px] rounded-[3rem] overflow-hidden ${i % 2 === 1 ? 'lg:order-2' : ''}`}>
                  <img src={p.img} className="w-full h-full object-cover" alt={p.name} />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                  <div className="absolute top-6 left-6 flex gap-2">
                    <span className="bg-remon-black text-white px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest">
                      {p.city}
                    </span>
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${p.statusColor}`}>
                      {p.status}
                    </span>
                  </div>
                  <div className="absolute bottom-6 left-6 flex gap-3 flex-wrap">
                    {p.facts.map((f, fi) => (
                      <span key={fi} className="bg-white/10 backdrop-blur-sm text-white px-3 py-1.5 rounded-lg text-[10px] font-bold border border-white/20">
                        {f}
                      </span>
                    ))}
                  </div>
                </div>
                <div className={i % 2 === 1 ? 'lg:order-1' : ''}>
                  <div className="flex items-center gap-3 mb-4">
                    <MapPin size={16} className="text-remon-red" />
                    <span className="text-remon-red font-black text-sm uppercase tracking-widest">{p.city}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-gray-400 font-bold text-sm">{p.year}</span>
                  </div>
                  <h3 className="text-4xl font-black uppercase tracking-tighter mb-6">{p.name}</h3>
                  <p className="text-gray-500 font-medium leading-relaxed mb-8 text-lg">{p.desc}</p>
                  <Link
                    href="/kvartires"
                    className="btn-primary px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3"
                  >
                    Смотреть квартиры <ArrowRight size={16} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="section-padding bg-remon-gray">
        <div className="container-fluid">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16 text-center">
              История компании
            </h2>
            <div className="relative">
              {/* Vertical line */}
              <div className="absolute left-[60px] top-0 bottom-0 w-[2px] bg-gray-200" />
              <div className="space-y-10">
                {timeline.map((t, i) => (
                  <div key={i} className="flex gap-8 items-start">
                    <div className="shrink-0 relative z-10">
                      <div className={`w-[60px] h-[60px] rounded-2xl flex items-center justify-center font-black text-sm ${
                        t.status === 'done'
                          ? 'bg-remon-red text-white'
                          : 'bg-white border-2 border-dashed border-remon-red text-remon-red'
                      }`}>
                        {t.year}
                      </div>
                    </div>
                    <div className="bg-white rounded-2xl p-6 flex-1 shadow-sm">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="font-black text-lg">{t.title}</h4>
                        {t.status === 'done' ? (
                          <CheckCircle size={16} className="text-green-500 shrink-0" />
                        ) : (
                          <Calendar size={16} className="text-remon-red shrink-0" />
                        )}
                      </div>
                      <p className="text-gray-400 font-medium leading-relaxed">{t.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Awards */}
      <section className="section-padding bg-remon-black text-white">
        <div className="container-fluid">
          <h2 className="text-fluid-h2 font-black uppercase tracking-tighter mb-16 text-center">
            Награды и признание
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {awards.map((a, i) => (
              <div key={i} className="bg-white/5 border border-white/10 rounded-2xl p-8 hover:bg-white/10 transition-all group">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 rounded-xl bg-remon-red/20 flex items-center justify-center shrink-0 group-hover:bg-remon-red transition-all">
                    <Award size={20} className="text-remon-red group-hover:text-white transition-colors" />
                  </div>
                  <div>
                    <p className="text-remon-red font-black text-sm mb-1">{a.year}</p>
                    <h4 className="font-black text-lg mb-2 leading-tight">{a.title}</h4>
                    <p className="text-white/40 text-sm font-medium">{a.org}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 bg-white text-center">
        <div className="container-fluid">
          <h2 className="text-4xl font-black uppercase tracking-tighter mb-6">
            Станьте частью нашей истории
          </h2>
          <p className="text-gray-400 text-lg font-medium mb-10 max-w-xl mx-auto">
            Выберите квартиру в одном из наших проектов и получите доступ к личному кабинету резидента.
          </p>
          <div className="flex flex-wrap justify-center gap-6">
            <Link
              href="/kvartires"
              className="btn-primary px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3"
            >
              Смотреть квартиры <ArrowRight size={16} />
            </Link>
            <Link
              href="/about"
              className="btn-outline px-12 py-5 rounded-2xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-3"
            >
              О компании
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
