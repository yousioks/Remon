'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Home, Building2, Camera, Cpu, CreditCard, FileText,
  MessageSquare, Settings, LogOut, Menu, X, Send,
  Bell, ChevronRight, TrendingUp, Calendar, Shield
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface UserApartment {
  id: number;
  apartment_id: number;
  title: string;
  rooms: string;
  area: number;
  floor: string;
  image_url: string;
  project_name: string;
  city: string;
  address: string;
  build_status: string;
  payment_status: string;
  mortgage_payment: number;
  next_payment_date: string;
  purchase_date: string;
}

interface CameraItem {
  id: number;
  name: string;
  stream_url: string;
  thumbnail_url: string;
  location: string;
  project_name: string;
  city: string;
}

interface Message {
  id: number;
  content: string;
  is_from_admin: boolean;
  is_read: boolean;
  created_at: string;
  admin_name?: string;
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
const fmtDate = (s: string) => new Date(s).toLocaleDateString('ru-RU', { day: 'numeric', month: 'long', year: 'numeric' });

// ─── Empty state ───────────────────────────────────────────────────────────
function EmptyPortfolio() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <div className="w-24 h-24 rounded-full bg-remon-gray flex items-center justify-center mb-8">
        <Building2 size={40} className="text-gray-300" />
      </div>
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-4">Портфель пуст</h3>
      <p className="text-gray-400 font-medium max-w-md leading-relaxed mb-8">
        Вы пока что ещё не имеете объекта в своём портфеле, но мы будем рады с вами сотрудничать!
      </p>
      <Link href="/kvartires" className="btn-primary px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest inline-flex items-center gap-2">
        Смотреть квартиры <ChevronRight size={14} />
      </Link>
    </div>
  );
}

// ─── Dashboard Overview ────────────────────────────────────────────────────
function DashboardHome({ apartments }: { apartments: UserApartment[] }) {
  if (apartments.length === 0) return <EmptyPortfolio />;

  const totalValue = apartments.reduce((s, a) => s + (a.mortgage_payment || 0) * 240, 0);
  const nextPayment = apartments.find(a => a.mortgage_payment);

  return (
    <div className="space-y-8">
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-3">Объектов в портфеле</p>
          <p className="text-5xl font-black text-remon-black">{apartments.length}</p>
        </div>
        <div className="bg-remon-black rounded-3xl p-8 text-white">
          <p className="text-[10px] font-black uppercase text-white/50 tracking-widest mb-3">Ближайший платёж</p>
          {nextPayment ? (
            <>
              <p className="text-4xl font-black text-remon-red">{fmt(nextPayment.mortgage_payment)} ₽</p>
              <p className="text-white/50 text-xs mt-2 font-medium">
                {nextPayment.next_payment_date ? fmtDate(nextPayment.next_payment_date) : '—'}
              </p>
            </>
          ) : <p className="text-2xl font-black text-white/30">—</p>}
        </div>
        <div className="bg-remon-red rounded-3xl p-8 text-white">
          <p className="text-[10px] font-black uppercase text-white/70 tracking-widest mb-3">Статус объектов</p>
          <p className="text-2xl font-black">{apartments[0]?.build_status || '—'}</p>
          <div className="mt-4 h-1.5 bg-white/20 rounded-full overflow-hidden">
            <div className="h-full bg-white rounded-full w-[65%]" />
          </div>
          <p className="text-white/60 text-xs mt-2">65% готовности</p>
        </div>
      </div>

      {/* Apartments summary */}
      <div>
        <h3 className="text-lg font-black uppercase tracking-tight mb-6">Мои объекты</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {apartments.map(apt => (
            <div key={apt.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm flex">
              <div className="w-32 shrink-0">
                <img src={apt.image_url || '/photos/Вид дома 1.jpg'} className="w-full h-full object-cover" alt={apt.title} />
              </div>
              <div className="p-6 flex-1">
                <p className="text-[10px] font-black uppercase text-remon-red tracking-widest mb-1">{apt.city} · {apt.project_name}</p>
                <h4 className="font-black text-lg mb-2">{apt.title}</h4>
                <div className="flex gap-4 text-xs text-gray-400 font-medium">
                  <span>Этаж {apt.floor}</span>
                  <span>{apt.area} м²</span>
                </div>
                <div className="mt-3 flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-gray-600">{apt.build_status}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── My Objects ────────────────────────────────────────────────────────────
function MyObjects({ apartments }: { apartments: UserApartment[] }) {
  if (apartments.length === 0) return <EmptyPortfolio />;
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Мои объекты</h3>
      {apartments.map(apt => (
        <div key={apt.id} className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm">
          <div className="flex flex-col md:flex-row">
            <div className="md:w-64 h-48 md:h-auto shrink-0">
              <img src={apt.image_url || '/photos/Вид дома 1.jpg'} className="w-full h-full object-cover" alt={apt.title} />
            </div>
            <div className="p-8 flex-1">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <p className="text-[10px] font-black uppercase text-remon-red tracking-widest mb-1">{apt.city} · {apt.project_name}</p>
                  <h4 className="text-2xl font-black">{apt.title}</h4>
                  <p className="text-gray-400 text-sm font-medium mt-1">{apt.address}</p>
                </div>
                <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${apt.build_status === 'Сдан' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                  {apt.build_status}
                </span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                {[
                  { label: 'Площадь', val: `${apt.area} м²` },
                  { label: 'Этаж', val: apt.floor },
                  { label: 'Комнат', val: apt.rooms },
                  { label: 'Куплено', val: apt.purchase_date ? fmtDate(apt.purchase_date) : '—' },
                ].map(s => (
                  <div key={s.label} className="bg-gray-50 rounded-xl p-4">
                    <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-1">{s.label}</p>
                    <p className="font-black text-lg">{s.val}</p>
                  </div>
                ))}
              </div>
              {apt.mortgage_payment && (
                <div className="flex items-center gap-4 p-4 bg-remon-black rounded-2xl text-white">
                  <CreditCard size={20} className="text-remon-red shrink-0" />
                  <div>
                    <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Ипотека</p>
                    <p className="font-black">{fmt(apt.mortgage_payment)} ₽/мес · {apt.payment_status}</p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Cameras ───────────────────────────────────────────────────────────────
function Cameras({ cameras }: { cameras: CameraItem[] }) {
  const [active, setActive] = useState<CameraItem | null>(cameras[0] || null);
  const [currentTime, setCurrentTime] = useState('');
  useEffect(() => {
    const fmt = () => new Date().toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
    setCurrentTime(fmt());
    const timer = setInterval(() => setCurrentTime(fmt()), 60000);
    return () => clearInterval(timer);
  }, []);

  if (cameras.length === 0) {
    return (
      <div className="text-center py-24">
        <Camera size={48} className="text-gray-200 mx-auto mb-4" />
        <p className="text-gray-400 font-medium">Камеры не подключены</p>
      </div>
    );
  }
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Камеры онлайн</h3>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main view */}
        <div className="lg:col-span-2">
          {active && (
            <div className="camera-wrapper">
              <iframe
                src={active.stream_url}
                className="w-full h-full"
                allowFullScreen
                title={active.name}
              />
              <div className="absolute inset-0 pointer-events-none">
                <div className="absolute top-4 left-4 right-4 flex justify-between items-center">
                  <div className="cam-rec">
                    <div className="cam-dot" />
                    LIVE
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {currentTime}
                  </div>                </div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <div>
                    <p className="text-white font-black text-lg">{active.name}</p>
                    <p className="text-white/60 text-xs font-medium">{active.project_name} · {active.city}</p>
                  </div>
                  <div className="bg-black/50 backdrop-blur-sm text-white text-xs font-bold px-3 py-1.5 rounded-lg">
                    {active.location}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Camera list */}
        <div className="space-y-3">
          <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Все камеры</p>
          {cameras.map(cam => (
            <button
              key={cam.id}
              onClick={() => setActive(cam)}
              className={`w-full flex gap-3 p-3 rounded-2xl transition-all text-left ${active?.id === cam.id ? 'bg-remon-black text-white' : 'bg-white border border-gray-100 hover:border-gray-200'}`}
            >
              <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0 relative">
                <img src={cam.thumbnail_url || '/photos/Вид дома 1.jpg'} className="w-full h-full object-cover" alt={cam.name} />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className={`w-2 h-2 rounded-full ${active?.id === cam.id ? 'bg-remon-red' : 'bg-green-400'}`} />
                </div>
              </div>
              <div className="flex-1 min-w-0">
                <p className={`font-black text-sm truncate ${active?.id === cam.id ? 'text-white' : ''}`}>{cam.name}</p>
                <p className={`text-xs truncate ${active?.id === cam.id ? 'text-white/50' : 'text-gray-400'}`}>{cam.project_name}</p>
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Smart Home ────────────────────────────────────────────────────────────
function SmartHome({ hasAccess }: { hasAccess: boolean }) {
  const [switches, setSwitches] = useState({
    light_hall: true, light_living: false, light_bedroom: true,
    climate: true, security: true, intercom: false,
  });

  if (!hasAccess) return <EmptyPortfolio />;

  const toggle = (k: keyof typeof switches) =>
    setSwitches(prev => ({ ...prev, [k]: !prev[k] }));

  const items = [
    { key: 'light_hall' as const, label: 'Свет — Прихожая', icon: '💡' },
    { key: 'light_living' as const, label: 'Свет — Гостиная', icon: '💡' },
    { key: 'light_bedroom' as const, label: 'Свет — Спальня', icon: '💡' },
    { key: 'climate' as const, label: 'Климат-контроль', icon: '🌡️' },
    { key: 'security' as const, label: 'Охранная система', icon: '🔒' },
    { key: 'intercom' as const, label: 'Домофон', icon: '📱' },
  ];

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Умный дом</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {items.map(item => (
          <div key={item.key} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-2xl">
                {item.icon}
              </div>
              <div>
                <p className="font-black text-sm">{item.label}</p>
                <p className={`text-xs font-bold ${switches[item.key] ? 'text-green-500' : 'text-gray-400'}`}>
                  {switches[item.key] ? 'Включено' : 'Выключено'}
                </p>
              </div>
            </div>
            <button
              onClick={() => toggle(item.key)}
              className={`smart-switch ${switches[item.key] ? 'on' : ''}`}
            />
          </div>
        ))}
      </div>
      <div className="bg-remon-black rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4 mb-6">
          <Cpu size={24} className="text-remon-red" />
          <h4 className="font-black text-lg uppercase tracking-tight">Климат-контроль</h4>
        </div>
        <div className="grid grid-cols-3 gap-6">
          {[{ label: 'Температура', val: '22°C' }, { label: 'Влажность', val: '45%' }, { label: 'CO₂', val: '420 ppm' }].map(s => (
            <div key={s.label}>
              <p className="text-white/40 text-[10px] uppercase font-black tracking-widest mb-2">{s.label}</p>
              <p className="text-3xl font-black text-remon-red">{s.val}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Finance ───────────────────────────────────────────────────────────────
function Finance({ apartments, hasAccess }: { apartments: UserApartment[]; hasAccess: boolean }) {
  if (!hasAccess) return <EmptyPortfolio />;
  if (apartments.length === 0) return <EmptyPortfolio />;

  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Финансы</h3>
      {apartments.filter(a => a.mortgage_payment).map(apt => (
        <div key={apt.id} className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex justify-between items-start mb-8">
            <div>
              <p className="text-[10px] font-black uppercase text-remon-red tracking-widest mb-1">{apt.project_name}</p>
              <h4 className="text-xl font-black">{apt.title}</h4>
            </div>
            <span className="bg-green-50 text-green-600 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider">
              {apt.payment_status}
            </span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { label: 'Ежемесячный платёж', val: `${fmt(apt.mortgage_payment)} ₽`, red: true },
              { label: 'Следующий платёж', val: apt.next_payment_date ? fmtDate(apt.next_payment_date) : '—' },
              { label: 'Статус', val: apt.payment_status },
              { label: 'Дата покупки', val: apt.purchase_date ? fmtDate(apt.purchase_date) : '—' },
            ].map(s => (
              <div key={s.label} className="bg-gray-50 rounded-2xl p-5">
                <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest mb-2">{s.label}</p>
                <p className={`font-black text-lg ${s.red ? 'text-remon-red' : ''}`}>{s.val}</p>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Documents ─────────────────────────────────────────────────────────────
function Documents({ hasAccess }: { hasAccess: boolean }) {
  if (!hasAccess) return <EmptyPortfolio />;
  const docs = [
    { name: 'Договор долевого участия', date: '15.03.2024', type: 'PDF', size: '2.4 МБ' },
    { name: 'Акт приёма-передачи', date: '—', type: 'PDF', size: '—' },
    { name: 'Технический паспорт', date: '—', type: 'PDF', size: '—' },
    { name: 'Страховой полис', date: '15.03.2024', type: 'PDF', size: '1.1 МБ' },
  ];
  return (
    <div className="space-y-6">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Документы</h3>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        {docs.map((doc, i) => (
          <div key={i} className={`flex items-center justify-between p-6 ${i < docs.length - 1 ? 'border-b border-gray-50' : ''} hover:bg-gray-50 transition-colors`}>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-remon-red/10 flex items-center justify-center">
                <FileText size={18} className="text-remon-red" />
              </div>
              <div>
                <p className="font-bold text-sm">{doc.name}</p>
                <p className="text-xs text-gray-400 font-medium">{doc.date !== '—' ? doc.date : 'Ожидается'} · {doc.size !== '—' ? doc.size : '—'}</p>
              </div>
            </div>
            {doc.date !== '—' && (
              <button className="text-xs font-black uppercase tracking-wider text-remon-red hover:underline">
                Скачать
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Chat ──────────────────────────────────────────────────────────────────
function Chat({ userId }: { userId: number }) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    apiGet<Message[]>('/api/users/me/messages').then(setMessages).catch(() => {});
  }, []);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const send = async () => {
    if (!text.trim() || sending) return;
    setSending(true);
    try {
      const msg = await apiPost<Message>('/api/users/me/messages', { content: text.trim() });
      setMessages(prev => [...prev, msg]);
      setText('');
    } catch { /* ignore */ }
    finally { setSending(false); }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-200px)] max-h-[700px]">
      <h3 className="text-2xl font-black uppercase tracking-tighter mb-6">Чат с менеджером</h3>
      <div className="flex-1 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-gray-50 flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-remon-red flex items-center justify-center text-white font-black text-sm">М</div>
          <div>
            <p className="font-black text-sm">Менеджер Remon</p>
            <div className="flex items-center gap-1.5">
              <div className="w-2 h-2 rounded-full bg-green-400" />
              <p className="text-xs text-gray-400 font-medium">Онлайн</p>
            </div>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {messages.length === 0 && (
            <div className="text-center py-12">
              <MessageSquare size={40} className="text-gray-200 mx-auto mb-4" />
              <p className="text-gray-400 font-medium text-sm">Напишите нам — ответим в течение 15 минут</p>
            </div>
          )}
          {messages.map(msg => (
            <div key={msg.id} className={`flex ${msg.is_from_admin ? 'justify-start' : 'justify-end'}`}>
              <div className={`max-w-[75%] rounded-2xl px-5 py-3 ${msg.is_from_admin ? 'bg-gray-100 text-black rounded-tl-sm' : 'bg-remon-black text-white rounded-tr-sm'}`}>
                {msg.is_from_admin && msg.admin_name && (
                  <p className="text-[10px] font-black uppercase text-remon-red tracking-wider mb-1">{msg.admin_name}</p>
                )}
                <p className="text-sm font-medium leading-relaxed">{msg.content}</p>
                <p className={`text-[10px] mt-1 ${msg.is_from_admin ? 'text-gray-400' : 'text-white/40'}`}>
                  {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="p-4 border-t border-gray-50 flex gap-3">
          <input
            type="text"
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
            placeholder="Напишите сообщение..."
            className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-remon-red transition-colors"
          />
          <button
            onClick={send}
            disabled={!text.trim() || sending}
            className="w-12 h-12 bg-remon-red rounded-xl flex items-center justify-center text-white hover:bg-remon-darkred transition-colors disabled:opacity-40"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Profile Settings ──────────────────────────────────────────────────────
function ProfileSettings() {
  const { user, refreshUser } = useAuth();
  const [form, setForm] = useState({ full_name: '', phone: '' });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  // Синхронизируем форму с данными пользователя после загрузки
  useEffect(() => {
    if (user) {
      setForm({ full_name: user.full_name || '', phone: user.phone || '' });
    }
  }, [user]);
  const save = async () => {
    setSaving(true);
    try {
      await apiPut('/api/users/me', form);
      await refreshUser();
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch { /* ignore */ }
    finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 max-w-lg">
      <h3 className="text-2xl font-black uppercase tracking-tighter">Настройки профиля</h3>
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-6">
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">ФИО</label>
          <input
            type="text"
            value={form.full_name}
            onChange={e => setForm(p => ({ ...p, full_name: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 outline-none focus:border-remon-red transition-all font-semibold"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Email</label>
          <input
            type="email"
            value={user?.email || ''}
            disabled
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 font-semibold text-gray-400 cursor-not-allowed"
          />
        </div>
        <div>
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Телефон</label>
          <input
            type="tel"
            value={form.phone}
            onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl py-4 px-4 outline-none focus:border-remon-red transition-all font-semibold"
          />
        </div>
        <div className="pt-2 flex items-center gap-4">
          <button
            onClick={save}
            disabled={saving}
            className="btn-primary px-8 py-4 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-50"
          >
            {saving ? 'Сохраняем...' : 'Сохранить'}
          </button>
          {saved && <span className="text-green-500 text-sm font-bold">✓ Сохранено</span>}
        </div>
      </div>

      {/* Status badge */}
      <div className="bg-remon-black rounded-3xl p-8 text-white">
        <div className="flex items-center gap-4 mb-4">
          <Shield size={24} className="text-remon-red" />
          <div>
            <p className="text-[10px] font-black uppercase text-white/50 tracking-widest">Ваш статус</p>
            <p className="font-black text-xl capitalize">
              {user?.status === 'none' ? 'Пользователь' :
               user?.status === 'user' ? 'Пользователь' :
               user?.status === 'resident_premium' ? 'Резидент Premium' :
               'Резидент Business'}
            </p>
          </div>
        </div>
        {(user?.status === 'none' || user?.status === 'user') && (
          <p className="text-white/40 text-sm font-medium">
            Для получения статуса резидента приобретите квартиру в одном из наших проектов.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── Main Cabinet Page ─────────────────────────────────────────────────────
type Tab = 'home' | 'objects' | 'cameras' | 'smarthome' | 'finance' | 'documents' | 'chat' | 'settings';

export default function CabinetPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<Tab>('home');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [apartments, setApartments] = useState<UserApartment[]>([]);
  const [cameras, setCameras] = useState<CameraItem[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push('/login');
  }, [user, loading, router]);

  useEffect(() => {
    if (!user) return;
    apiGet<UserApartment[]>('/api/users/me/apartments').then(setApartments).catch(() => {});
    apiGet<CameraItem[]>('/api/users/me/cameras').then(setCameras).catch(() => {});
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-remon-black">
        <div className="text-center">
          <div className="text-white text-5xl font-black tracking-tighter mb-6">REMON<span className="text-remon-red">.</span></div>
          <div className="w-48 h-1 bg-white/10 rounded-full overflow-hidden mx-auto">
            <div className="h-full bg-remon-red rounded-full animate-pulse w-2/3" />
          </div>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const isResident = user.status === 'resident_premium' || user.status === 'resident_business';
  const hasPortfolio = apartments.length > 0;

  const navItems: { key: Tab; label: string; icon: React.ReactNode; restricted?: boolean }[] = [
    { key: 'home', label: 'Главная', icon: <Home size={20} /> },
    { key: 'objects', label: 'Мои объекты', icon: <Building2 size={20} />, restricted: !isResident },
    { key: 'cameras', label: 'Камеры онлайн', icon: <Camera size={20} /> },
    { key: 'smarthome', label: 'Умный дом', icon: <Cpu size={20} />, restricted: !isResident },
    { key: 'finance', label: 'Финансы', icon: <CreditCard size={20} />, restricted: !isResident },
    { key: 'documents', label: 'Документы', icon: <FileText size={20} />, restricted: !isResident },
    { key: 'chat', label: 'Чат с менеджером', icon: <MessageSquare size={20} /> },
    { key: 'settings', label: 'Настройки', icon: <Settings size={20} /> },
  ];

  const renderContent = () => {
    switch (tab) {
      case 'home': return <DashboardHome apartments={apartments} />;
      case 'objects': return isResident ? <MyObjects apartments={apartments} /> : <EmptyPortfolio />;
      case 'cameras': return <Cameras cameras={cameras} />;
      case 'smarthome': return <SmartHome hasAccess={isResident} />;
      case 'finance': return <Finance apartments={apartments} hasAccess={isResident} />;
      case 'documents': return <Documents hasAccess={isResident} />;
      case 'chat': return <Chat userId={user.id} />;
      case 'settings': return <ProfileSettings />;
    }
  };

  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-[280px] bg-remon-black flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        {/* Logo */}
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white">
            REMON<span className="text-remon-red">.</span>
          </Link>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Личный кабинет</p>
        </div>

        {/* User info */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-remon-red flex items-center justify-center text-white font-black text-sm shrink-0">
              {user.full_name?.[0] || user.email[0].toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-white font-black text-sm truncate">{user.full_name || 'Пользователь'}</p>
              <p className="text-white/40 text-[10px] font-medium truncate">{user.email}</p>
            </div>
          </div>
          <div className="mt-3 px-3 py-1.5 bg-white/5 rounded-lg inline-block">
            <p className="text-[10px] font-black uppercase tracking-wider text-remon-red">
              {user.status === 'none' ? 'Пользователь' :
               user.status === 'user' ? 'Пользователь' :
               user.status === 'resident_premium' ? '★ Резидент Premium' :
               '★★ Резидент Business'}
            </p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 overflow-y-auto">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSidebarOpen(false); }}
              className={`dash-nav-item w-full ${tab === item.key ? 'active' : ''} ${item.restricted ? 'opacity-40' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
              {item.restricted && <span className="ml-auto text-[9px] bg-white/10 px-2 py-0.5 rounded font-black">PREMIUM</span>}
            </button>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-4 border-t border-white/10">
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="dash-nav-item w-full text-red-400 hover:text-red-300"
          >
            <LogOut size={20} />
            <span>Выйти</span>
          </button>
        </div>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shrink-0 z-30">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100"
              onClick={() => setSidebarOpen(true)}
            >
              <Menu size={20} />
            </button>
            <div>
              <h1 className="font-black text-lg uppercase tracking-tight">
                {navItems.find(n => n.key === tab)?.label}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 hover:bg-gray-200 transition-colors relative">
              <Bell size={18} />
              <span className="absolute top-2 right-2 w-2 h-2 bg-remon-red rounded-full" />
            </button>
            {user.role === 'admin' && (
              <Link href="/admin" className="px-4 py-2 bg-remon-red text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-remon-darkred transition-colors">
                Админка
              </Link>
            )}
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
