'use client';

import React, { useState, useEffect, useRef } from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { Heart, Search, ChevronDown, SlidersHorizontal } from 'lucide-react';
import { apiGet } from '@/lib/api';

interface Apartment {
  id: number;
  title: string;
  rooms: string;
  area: number;
  floor: string;
  price: number;
  status: string;
  image_url: string;
  layout_url: string;
  project_name: string;
  city: string;
  project_class: string;
}

const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);

const roomOptions = ['Все', 'СТ', '1К', '2К', '3К+'];
const cities = ['Все города', 'Омск', 'Тюмень', 'Новосибирск'];

export default function KvartiresPage() {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<number[]>([]);
  const [activeRoom, setActiveRoom] = useState('Все');
  const [activeCity, setActiveCity] = useState('Все города');
  const [priceMax, setPriceMax] = useState(30000000);
  const [areaMin, setAreaMin] = useState('');
  const [areaMax, setAreaMax] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const loaderRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadApartments();
  }, [activeRoom, activeCity, priceMax]);

  const loadApartments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeRoom !== 'Все') params.set('rooms', activeRoom);
      if (activeCity !== 'Все города') params.set('city', activeCity);
      params.set('price_max', String(priceMax));
      const data = await apiGet<Apartment[]>(`/api/apartments?${params}`);
      setApartments(data);
    } catch {
      // fallback — показываем заглушки
      setApartments([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleFav = (id: number) =>
    setFavorites(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);

  const filtered = apartments.filter(a => {
    if (areaMin && a.area < Number(areaMin)) return false;
    if (areaMax && a.area > Number(areaMax)) return false;
    return true;
  });

  return (
    <main className="min-h-screen flex flex-col bg-[#f9f9f9]">
      <Header />

      {/* Page header */}
      <div className="bg-white pt-[130px] pb-6 border-b border-gray-100 sticky top-0 z-40 shadow-sm">
        <div className="max-w-[1800px] mx-auto px-6 md:px-12">
          <div className="flex items-baseline gap-4 mb-6">
            <h1 className="text-3xl font-black uppercase tracking-tighter">Квартиры</h1>
            <span className="text-gray-400 font-bold">{filtered.length} вариантов</span>
          </div>

          {/* City tabs */}
          <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 pb-1">
            {cities.map(city => (
              <button
                key={city}
                onClick={() => setActiveCity(city)}
                className={`px-5 py-2 rounded-full border text-sm font-bold transition-all whitespace-nowrap ${
                  activeCity === city
                    ? 'bg-remon-black border-remon-black text-white'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {city}
              </button>
            ))}
          </div>

          {/* Filters row */}
          <div className="flex flex-wrap gap-4 items-end">
            {/* Rooms */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Комнатность</label>
              <div className="flex border border-gray-200 rounded-xl overflow-hidden bg-white">
                {roomOptions.map(r => (
                  <button
                    key={r}
                    onClick={() => setActiveRoom(r)}
                    className={`px-4 py-2.5 text-sm font-bold border-r border-gray-200 last:border-0 transition-colors ${
                      activeRoom === r ? 'bg-remon-red text-white' : 'hover:bg-gray-50'
                    }`}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {/* Price */}
            <div className="min-w-[200px]">
              <div className="flex justify-between mb-2">
                <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Цена до</label>
                <span className="text-xs font-black text-remon-red">{fmt(priceMax)} ₽</span>
              </div>
              <input
                type="range" min={3000000} max={60000000} step={500000}
                value={priceMax} onChange={e => setPriceMax(Number(e.target.value))}
              />
            </div>

            {/* Area */}
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Площадь, м²</label>
              <div className="flex gap-2">
                <input
                  type="number" placeholder="от 18"
                  value={areaMin} onChange={e => setAreaMin(e.target.value)}
                  className="w-24 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-remon-red bg-white"
                />
                <input
                  type="number" placeholder="до 200"
                  value={areaMax} onChange={e => setAreaMax(e.target.value)}
                  className="w-24 border border-gray-200 rounded-xl p-2.5 text-sm outline-none focus:border-remon-red bg-white"
                />
              </div>
            </div>

            <button
              onClick={loadApartments}
              className="btn-primary px-8 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2 ml-auto"
            >
              <Search size={16} /> Найти
            </button>
          </div>
        </div>
      </div>

      {/* Grid */}
      <div className="max-w-[1800px] mx-auto px-6 md:px-12 py-10 flex-grow">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
                <div className="h-32 bg-gray-100 rounded-xl mb-4" />
                <div className="h-4 bg-gray-100 rounded mb-2" />
                <div className="h-4 bg-gray-100 rounded w-2/3" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-gray-400 font-medium text-lg">Квартиры не найдены</p>
            <p className="text-gray-300 text-sm mt-2">Попробуйте изменить параметры фильтра</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filtered.map(apt => (
              <div
                key={apt.id}
                className="bg-white rounded-2xl p-6 border border-transparent hover:border-gray-100 hover:shadow-xl transition-all group cursor-pointer flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mb-1">
                      {apt.city} · {apt.floor} этаж
                    </p>
                    <h3 className="text-lg font-black group-hover:text-remon-red transition-colors leading-tight">
                      {apt.title}
                    </h3>
                  </div>
                  <button
                    onClick={() => toggleFav(apt.id)}
                    className={`transition-colors shrink-0 ${favorites.includes(apt.id) ? 'text-remon-red' : 'text-gray-200 hover:text-remon-red'}`}
                  >
                    <Heart size={20} fill={favorites.includes(apt.id) ? 'currentColor' : 'none'} />
                  </button>
                </div>

                <div className="flex-grow flex flex-col items-center justify-center py-6">
                  <img
                    src={apt.layout_url || apt.image_url || '/photos/Планировка 1.jpg'}
                    alt="Планировка"
                    className="h-32 object-contain group-hover:scale-110 transition-transform duration-500"
                  />
                </div>

                <div className="mt-auto space-y-2 mb-5">
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400 font-medium">Проект</span>
                    <span className="text-sm font-bold">{apt.project_name}</span>
                  </div>
                  <div className="flex justify-between items-center border-b border-gray-50 pb-2">
                    <span className="text-xs text-gray-400 font-medium">Площадь</span>
                    <span className="text-sm font-bold">{apt.area} м²</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-xs text-gray-400 font-medium">Цена</span>
                    <span className="text-lg font-black text-remon-red">{fmt(apt.price)} ₽</span>
                  </div>
                </div>

                <button className="w-full bg-remon-black text-white py-3 rounded-xl font-black text-sm hover:bg-remon-red transition-all">
                  Подробнее
                </button>
              </div>
            ))}
          </div>
        )}

        <div ref={loaderRef} className="py-10" />
      </div>

      <Footer />
    </main>
  );
}
