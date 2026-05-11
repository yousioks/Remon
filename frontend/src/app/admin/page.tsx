'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Users, Building2, Newspaper, Camera, MessageSquare,
  BarChart3, LogOut, Menu, X, Plus, Pencil, Trash2,
  ChevronDown, Check, ArrowLeft, Send, Home
} from 'lucide-react';import { useAuth } from '@/context/AuthContext';
import { apiGet, apiPost, apiPut, apiDelete } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────
interface AdminUser {
  id: number;
  email: string;
  full_name: string | null;
  phone: string | null;
  role: string;
  status: string;
  auth_provider: string;
  created_at: string;
}

interface Project {
  id: number;
  name: string;
  city: string;
  class: string;
  address: string;
  description: string;
  price_from: number;
  price_to: number;
  deadline: string;
  image_url: string;
  is_active: boolean;
}

interface Apartment {
  id: number;
  project_id: number;
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
  is_active: boolean;
}

interface NewsItem {
  id: number;
  title: string;
  content: string;
  excerpt: string;
  image_url: string;
  project_id: number | null;
  project_name: string | null;
  is_published: boolean;
  created_at: string;
}

interface CameraItem {
  id: number;
  project_id: number;
  name: string;
  stream_url: string;
  thumbnail_url: string;
  location: string;
  project_name: string;
  city: string;
  is_active: boolean;
}

interface ChatMessage {
  id: number;
  user_id: number;
  content: string;
  is_from_admin: boolean;
  created_at: string;
  user_name: string;
  user_email: string;
  admin_name?: string;
}

interface Stats {
  users: { status: string; count: string }[];
  apartments: { status: string; count: string }[];
  news: { total: string; published: string };
  messages: { total: string; unread: string };
}

// ─── Helpers ───────────────────────────────────────────────────────────────
const fmt = (n: number) => new Intl.NumberFormat('ru-RU').format(n);
const statusLabel: Record<string, string> = {
  none: 'Пользователь',
  user: 'Пользователь+',
  resident_premium: 'Резидент Premium',
  resident_business: 'Резидент Business',
};
const statusColor: Record<string, string> = {
  none: 'bg-gray-100 text-gray-600',
  user: 'bg-blue-50 text-blue-600',
  resident_premium: 'bg-amber-50 text-amber-600',
  resident_business: 'bg-purple-50 text-purple-600',
};

// ─── Stats Dashboard ────────────────────────────────────────────────────────
function StatsDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    apiGet<Stats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  const totalUsers = stats?.users.reduce((s, u) => s + Number(u.count), 0) || 0;
  const residents = stats?.users.filter(u => u.status.startsWith('resident')).reduce((s, u) => s + Number(u.count), 0) || 0;

  return (
    <div className="space-y-8">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Статистика</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Всего пользователей', val: totalUsers, color: 'bg-remon-black text-white' },
          { label: 'Резидентов', val: residents, color: 'bg-remon-red text-white' },
          { label: 'Новостей', val: stats?.news.total || 0, color: 'bg-white border border-gray-100' },
          { label: 'Новых сообщений', val: stats?.messages.unread || 0, color: 'bg-amber-50 border border-amber-100' },
        ].map((s, i) => (
          <div key={i} className={`rounded-3xl p-8 shadow-sm ${s.color}`}>
            <p className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-3">{s.label}</p>
            <p className="text-5xl font-black">{s.val}</p>
          </div>
        ))}
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="font-black uppercase tracking-tight mb-6 text-sm">Пользователи по статусам</h3>
            <div className="space-y-3">
              {stats.users.map(u => (
                <div key={u.status} className="flex items-center justify-between">
                  <span className={`px-3 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColor[u.status] || 'bg-gray-100 text-gray-600'}`}>
                    {statusLabel[u.status] || u.status}
                  </span>
                  <span className="font-black text-xl">{u.count}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
            <h3 className="font-black uppercase tracking-tight mb-6 text-sm">Квартиры по статусам</h3>
            <div className="space-y-3">
              {stats.apartments.map(a => (
                <div key={a.status} className="flex items-center justify-between">
                  <span className="text-sm font-bold capitalize">{a.status}</span>
                  <span className="font-black text-xl">{a.count}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Users Management ───────────────────────────────────────────────────────
function UsersManagement({ projects }: { projects: Project[] }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [statusDropdown, setStatusDropdown] = useState<number | null>(null);

  useEffect(() => {
    apiGet<AdminUser[]>('/api/admin/users').then(u => { setUsers(u); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const changeStatus = async (userId: number, status: string) => {
    try {
      const updated = await apiPut<AdminUser>(`/api/admin/users/${userId}/status`, { status });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, status: updated.status } : u));
      setStatusDropdown(null);
    } catch { /* ignore */ }
  };

  const changeRole = async (userId: number, role: string) => {
    try {
      const updated = await apiPut<AdminUser>(`/api/admin/users/${userId}/role`, { role });
      setUsers(prev => prev.map(u => u.id === userId ? { ...u, role: updated.role } : u));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Пользователи ({users.length})</h2>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['ID', 'Имя / Email', 'Телефон', 'Статус', 'Роль', 'Регистрация', 'Действия'].map(h => (
                  <th key={h} className="text-left px-6 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-bold text-gray-400">#{u.id}</td>
                  <td className="px-6 py-4">
                    <p className="font-bold text-sm">{u.full_name || '—'}</p>
                    <p className="text-xs text-gray-400">{u.email}</p>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">{u.phone || '—'}</td>
                  <td className="px-6 py-4">
                    <div className="relative">
                      <button
                        onClick={() => setStatusDropdown(statusDropdown === u.id ? null : u.id)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider ${statusColor[u.status] || 'bg-gray-100 text-gray-600'}`}
                      >
                        {statusLabel[u.status] || u.status}
                        <ChevronDown size={10} />
                      </button>
                      {statusDropdown === u.id && (
                        <div className="absolute top-full left-0 mt-1 bg-white rounded-xl shadow-2xl border border-gray-100 z-20 min-w-[200px]">
                          {Object.entries(statusLabel).map(([key, label]) => (
                            <button
                              key={key}
                              onClick={() => changeStatus(u.id, key)}
                              className="flex items-center justify-between w-full px-4 py-3 hover:bg-gray-50 text-sm font-semibold transition-colors"
                            >
                              {label}
                              {u.status === key && <Check size={14} className="text-remon-red" />}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => changeRole(u.id, u.role === 'admin' ? 'user' : 'admin')}
                      className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors ${u.role === 'admin' ? 'bg-remon-red text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                      {u.role === 'admin' ? 'Админ' : 'Юзер'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-400">
                    {new Date(u.created_at).toLocaleDateString('ru-RU')}
                  </td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => setSelectedUser(u)}
                      className="text-xs font-black uppercase tracking-wider text-remon-red hover:underline"
                    >
                      Объекты
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* User apartments modal */}
      {selectedUser && (
        <UserApartmentsModal user={selectedUser} projects={projects} onClose={() => setSelectedUser(null)} />
      )}
    </div>
  );
}

function UserApartmentsModal({ user, projects, onClose }: { user: AdminUser; projects: Project[]; onClose: () => void }) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [allApartments, setAllApartments] = useState<Apartment[]>([]);
  const [userApts, setUserApts] = useState<{ id: number; title: string; build_status: string; mortgage_payment: number }[]>([]);
  const [selectedApt, setSelectedApt] = useState('');
  const [buildStatus, setBuildStatus] = useState('В строительстве');
  const [mortgagePayment, setMortgagePayment] = useState('');

  useEffect(() => {
    apiGet<{ id: number; title: string; build_status: string; mortgage_payment: number }[]>(`/api/admin/users/${user.id}/apartments`).then(setUserApts).catch(() => {});
    apiGet<Apartment[]>('/api/admin/apartments').then(setAllApartments).catch(() => {});
  }, [user.id]);

  const addApartment = async () => {
    if (!selectedApt) return;
    try {
      await apiPost(`/api/admin/users/${user.id}/apartments`, {
        apartment_id: Number(selectedApt),
        build_status: buildStatus,
        mortgage_payment: mortgagePayment ? Number(mortgagePayment) : null,
        purchase_date: new Date().toISOString().split('T')[0],
      });
      const updated = await apiGet<{ id: number; title: string; build_status: string; mortgage_payment: number }[]>(`/api/admin/users/${user.id}/apartments`);
      setUserApts(updated);
      setSelectedApt('');
    } catch { /* ignore */ }
  };

  const removeApartment = async (id: number) => {
    try {
      await apiDelete(`/api/admin/users/${user.id}/apartments/${id}`);
      setUserApts(prev => prev.filter(a => a.id !== id));
    } catch { /* ignore */ }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-8">
        <div className="flex justify-between items-start mb-8">
          <div>
            <h3 className="text-xl font-black uppercase tracking-tighter">Объекты пользователя</h3>
            <p className="text-gray-400 text-sm mt-1">{user.full_name || user.email}</p>
          </div>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Current apartments */}
        <div className="space-y-3 mb-8">
          {userApts.length === 0 ? (
            <p className="text-gray-400 text-sm font-medium py-4 text-center">Нет объектов</p>
          ) : userApts.map(apt => (
            <div key={apt.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl">
              <div>
                <p className="font-bold text-sm">{apt.title}</p>
                <p className="text-xs text-gray-400">{apt.build_status} · {apt.mortgage_payment ? `${fmt(apt.mortgage_payment)} ₽/мес` : 'Без ипотеки'}</p>
              </div>
              <button onClick={() => removeApartment(apt.id)} className="text-red-400 hover:text-red-600 transition-colors">
                <Trash2 size={16} />
              </button>
            </div>
          ))}
        </div>

        {/* Add apartment */}
        <div className="border-t border-gray-100 pt-6 space-y-4">
          <h4 className="font-black uppercase tracking-tight text-sm">Добавить объект</h4>
          <select
            value={selectedApt}
            onChange={e => setSelectedApt(e.target.value)}
            className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
          >
            <option value="">Выберите квартиру</option>
            {allApartments.map(a => (
              <option key={a.id} value={a.id}>{a.title} — {a.city} ({fmt(a.price)} ₽)</option>
            ))}
          </select>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Статус строительства</label>
              <select
                value={buildStatus}
                onChange={e => setBuildStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              >
                <option>В строительстве</option>
                <option>Сдан</option>
                <option>Ключи выданы</option>
              </select>
            </div>
            <div>
              <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest block mb-2">Платёж по ипотеке (₽)</label>
              <input
                type="number"
                value={mortgagePayment}
                onChange={e => setMortgagePayment(e.target.value)}
                placeholder="45000"
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          </div>
          <button
            onClick={addApartment}
            disabled={!selectedApt}
            className="w-full btn-primary py-3 rounded-xl font-black uppercase text-[10px] tracking-widest disabled:opacity-40"
          >
            Добавить объект
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── News Management ────────────────────────────────────────────────────────
function NewsManagement({ projects }: { projects: Project[] }) {
  const [news, setNews] = useState<NewsItem[]>([]);
  const [editing, setEditing] = useState<Partial<NewsItem> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<NewsItem[]>('/api/admin/news').then(n => { setNews(n); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const updated = await apiPut<NewsItem>(`/api/admin/news/${editing.id}`, editing);
        setNews(prev => prev.map(n => n.id === updated.id ? updated : n));
      } else {
        const created = await apiPost<NewsItem>('/api/admin/news', editing);
        setNews(prev => [created, ...prev]);
      }
      setEditing(null);
    } catch { /* ignore */ }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить новость?')) return;
    try {
      await apiDelete(`/api/admin/news/${id}`);
      setNews(prev => prev.filter(n => n.id !== id));
    } catch { /* ignore */ }
  };

  if (editing !== null) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Назад
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">{editing.id ? 'Редактировать' : 'Новая'} новость</h2>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
          {[
            { label: 'Заголовок', key: 'title' as const, type: 'text' },
            { label: 'Краткое описание', key: 'excerpt' as const, type: 'text' },
            { label: 'URL изображения', key: 'image_url' as const, type: 'text' },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{f.label}</label>
              <input
                type={f.type}
                value={(editing[f.key] as string) || ''}
                onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          ))}
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Содержание</label>
            <textarea
              rows={6}
              value={editing.content || ''}
              onChange={e => setEditing(prev => ({ ...prev, content: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red resize-none"
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Проект</label>
            <select
              value={editing.project_id || ''}
              onChange={e => setEditing(prev => ({ ...prev, project_id: e.target.value ? Number(e.target.value) : null }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
            >
              <option value="">Без проекта</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
            </select>
          </div>
          <label className="flex items-center gap-3 cursor-pointer">
            <input
              type="checkbox"
              checked={editing.is_published || false}
              onChange={e => setEditing(prev => ({ ...prev, is_published: e.target.checked }))}
              className="w-4 h-4 accent-remon-red"
            />
            <span className="text-sm font-bold">Опубликовать</span>
          </label>
          <button onClick={save} className="w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Новости ({news.length})</h2>
        <button onClick={() => setEditing({})} className="btn-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
      </div>
      <div className="space-y-3">
        {news.map(n => (
          <div key={n.id} className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm flex items-center gap-4">
            {n.image_url && (
              <div className="w-16 h-12 rounded-xl overflow-hidden shrink-0">
                <img src={n.image_url} className="w-full h-full object-cover" alt={n.title} />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate">{n.title}</p>
              <div className="flex items-center gap-3 mt-1">
                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded ${n.is_published ? 'bg-green-50 text-green-600' : 'bg-gray-100 text-gray-500'}`}>
                  {n.is_published ? 'Опубликовано' : 'Черновик'}
                </span>
                {n.project_name && <span className="text-xs text-gray-400">{n.project_name}</span>}
              </div>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(n)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Pencil size={15} />
              </button>
              <button onClick={() => remove(n.id)} className="w-9 h-9 rounded-xl bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors text-red-500">
                <Trash2 size={15} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Cameras Management ─────────────────────────────────────────────────────
function CamerasManagement({ projects }: { projects: Project[] }) {
  const [cameras, setCameras] = useState<CameraItem[]>([]);
  const [editing, setEditing] = useState<Partial<CameraItem> | null>(null);

  useEffect(() => {
    apiGet<CameraItem[]>('/api/admin/cameras').then(setCameras).catch(() => {});
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const updated = await apiPut<CameraItem>(`/api/admin/cameras/${editing.id}`, editing);
        setCameras(prev => prev.map(c => c.id === updated.id ? updated : c));
      } else {
        const created = await apiPost<CameraItem>('/api/admin/cameras', editing);
        setCameras(prev => [created, ...prev]);
      }
      setEditing(null);
    } catch { /* ignore */ }
  };

  const remove = async (id: number) => {
    if (!confirm('Удалить камеру?')) return;
    try {
      await apiDelete(`/api/admin/cameras/${id}`);
      setCameras(prev => prev.filter(c => c.id !== id));
    } catch { /* ignore */ }
  };

  if (editing !== null) {
    return (
      <div className="space-y-6 max-w-lg">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Назад
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">{editing.id ? 'Редактировать' : 'Новая'} камера</h2>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Проект</label>
            <select
              value={editing.project_id || ''}
              onChange={e => setEditing(prev => ({ ...prev, project_id: Number(e.target.value) }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
            >
              <option value="">Выберите проект</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
            </select>
          </div>
          {[
            { label: 'Название', key: 'name' as const },
            { label: 'URL потока', key: 'stream_url' as const },
            { label: 'URL превью', key: 'thumbnail_url' as const },
            { label: 'Расположение', key: 'location' as const },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{f.label}</label>
              <input
                type="text"
                value={(editing[f.key] as string) || ''}
                onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          ))}
          <button onClick={save} className="w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Камеры ({cameras.length})</h2>
        <button onClick={() => setEditing({})} className="btn-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {cameras.map(cam => (
          <div key={cam.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm flex gap-4">
            <div className="w-20 h-14 rounded-xl overflow-hidden shrink-0">
              <img src={cam.thumbnail_url || '/photos/Вид дома 1.jpg'} className="w-full h-full object-cover" alt={cam.name} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm">{cam.name}</p>
              <p className="text-xs text-gray-400 truncate">{cam.project_name} · {cam.location}</p>
            </div>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setEditing(cam)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                <Pencil size={13} />
              </button>
              <button onClick={() => remove(cam.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors text-red-500">
                <Trash2 size={13} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Messages Management ────────────────────────────────────────────────────
function MessagesManagement() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [selectedUserId, setSelectedUserId] = useState<number | null>(null);
  const [chat, setChat] = useState<ChatMessage[]>([]);
  const [reply, setReply] = useState('');

  useEffect(() => {
    apiGet<ChatMessage[]>('/api/admin/messages').then(setMessages).catch(() => {});
  }, []);

  const openChat = async (userId: number) => {
    setSelectedUserId(userId);
    const msgs = await apiGet<ChatMessage[]>(`/api/admin/messages/user/${userId}`);
    setChat(msgs);
  };

  const sendReply = async () => {
    if (!reply.trim() || !selectedUserId) return;
    try {
      const msg = await apiPost<ChatMessage>(`/api/admin/messages/user/${selectedUserId}/reply`, { content: reply.trim() });
      setChat(prev => [...prev, msg]);
      setReply('');
    } catch { /* ignore */ }
  };

  // Unique users
  const uniqueUsers = messages.reduce<{ userId: number; userName: string; userEmail: string; lastMsg: string }[]>((acc, m) => {
    if (!acc.find(u => u.userId === m.user_id)) {
      acc.push({ userId: m.user_id, userName: m.user_name, userEmail: m.user_email, lastMsg: m.content });
    }
    return acc;
  }, []);

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-black uppercase tracking-tighter">Сообщения</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* User list */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-y-auto">
          {uniqueUsers.map(u => (
            <button
              key={u.userId}
              onClick={() => openChat(u.userId)}
              className={`w-full flex gap-3 p-5 border-b border-gray-50 text-left hover:bg-gray-50 transition-colors ${selectedUserId === u.userId ? 'bg-gray-50' : ''}`}
            >
              <div className="w-10 h-10 rounded-full bg-remon-red flex items-center justify-center text-white font-black text-sm shrink-0">
                {u.userName?.[0] || u.userEmail[0].toUpperCase()}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm truncate">{u.userName || u.userEmail}</p>
                <p className="text-xs text-gray-400 truncate">{u.lastMsg}</p>
              </div>
            </button>
          ))}
          {uniqueUsers.length === 0 && (
            <div className="text-center py-12 text-gray-400 text-sm">Нет сообщений</div>
          )}
        </div>

        {/* Chat */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm flex flex-col overflow-hidden">
          {selectedUserId ? (
            <>
              <div className="flex-1 overflow-y-auto p-6 space-y-3">
                {chat.map(msg => (
                  <div key={msg.id} className={`flex ${msg.is_from_admin ? 'justify-end' : 'justify-start'}`}>
                    <div className={`max-w-[75%] rounded-2xl px-4 py-3 ${msg.is_from_admin ? 'bg-remon-black text-white rounded-tr-sm' : 'bg-gray-100 text-black rounded-tl-sm'}`}>
                      <p className="text-sm font-medium">{msg.content}</p>
                      <p className={`text-[10px] mt-1 ${msg.is_from_admin ? 'text-white/40' : 'text-gray-400'}`}>
                        {new Date(msg.created_at).toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-4 border-t border-gray-50 flex gap-3">
                <input
                  type="text"
                  value={reply}
                  onChange={e => setReply(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendReply()}
                  placeholder="Ответить..."
                  className="flex-1 bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm font-medium outline-none focus:border-remon-red"
                />
                <button onClick={sendReply} className="w-12 h-12 bg-remon-red rounded-xl flex items-center justify-center text-white hover:bg-remon-darkred transition-colors">
                  <Send size={18} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center text-gray-400">
              <div className="text-center">
                <MessageSquare size={40} className="mx-auto mb-3 text-gray-200" />
                <p className="text-sm font-medium">Выберите диалог</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Projects Management ─────────────────────────────────────────────────────
function ProjectsManagement() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [editing, setEditing] = useState<Partial<Project> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Project[]>('/api/admin/projects').then(p => { setProjects(p); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const updated = await apiPut<Project>(`/api/admin/projects/${editing.id}`, editing);
        setProjects(prev => prev.map(p => p.id === updated.id ? updated : p));
      } else {
        const created = await apiPost<Project>('/api/admin/projects', editing);
        setProjects(prev => [created, ...prev]);
      }
      setEditing(null);
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  if (editing !== null) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Назад
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">{editing.id ? 'Редактировать' : 'Новый'} проект</h2>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
          {[
            { label: 'Название', key: 'name' as const },
            { label: 'Город', key: 'city' as const },
            { label: 'Класс (Комфорт / Бизнес / Премиум)', key: 'class' as const },
            { label: 'Адрес', key: 'address' as const },
            { label: 'URL изображения', key: 'image_url' as const },
            { label: 'Срок сдачи', key: 'deadline' as const },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{f.label}</label>
              <input
                type="text"
                value={(editing[f.key] as string) || ''}
                onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            {[
              { label: 'Цена от (₽)', key: 'price_from' as const },
              { label: 'Цена до (₽)', key: 'price_to' as const },
            ].map(f => (
              <div key={f.key}>
                <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{f.label}</label>
                <input
                  type="number"
                  value={(editing[f.key] as number) || ''}
                  onChange={e => setEditing(prev => ({ ...prev, [f.key]: Number(e.target.value) }))}
                  className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
                />
              </div>
            ))}
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Описание</label>
            <textarea
              rows={4}
              value={editing.description || ''}
              onChange={e => setEditing(prev => ({ ...prev, description: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red resize-none"
            />
          </div>
          {editing.image_url && (
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Предпросмотр фото</label>
              <img src={editing.image_url} alt="preview" className="w-full h-40 object-cover rounded-xl" />
            </div>
          )}
          <button onClick={save} className="w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Проекты ({projects.length})</h2>
        <button onClick={() => setEditing({})} className="btn-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {projects.map(p => (
          <div key={p.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            {p.image_url && (
              <div className="h-36 overflow-hidden">
                <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />
              </div>
            )}
            <div className="p-5">
              <div className="flex justify-between items-start gap-3">
                <div>
                  <p className="font-black text-sm">{p.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{p.city} · {p.class} · {p.deadline}</p>
                  <p className="text-xs text-gray-500 mt-1">{fmt(p.price_from)} – {fmt(p.price_to)} ₽</p>
                </div>
                <button
                  onClick={() => setEditing(p)}
                  className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
                >
                  <Pencil size={15} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Apartments Management ───────────────────────────────────────────────────
function ApartmentsManagement({ projects }: { projects: Project[] }) {
  const [apartments, setApartments] = useState<Apartment[]>([]);
  const [editing, setEditing] = useState<Partial<Apartment> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiGet<Apartment[]>('/api/admin/apartments').then(a => { setApartments(a); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const save = async () => {
    if (!editing) return;
    try {
      if (editing.id) {
        const updated = await apiPut<Apartment>(`/api/admin/apartments/${editing.id}`, editing);
        setApartments(prev => prev.map(a => a.id === updated.id ? updated : a));
      } else {
        const created = await apiPost<Apartment>('/api/admin/apartments', editing);
        setApartments(prev => [created, ...prev]);
      }
      setEditing(null);
    } catch { /* ignore */ }
  };

  const remove = async (id: number) => {
    if (!confirm('Деактивировать квартиру?')) return;
    try {
      await apiDelete(`/api/admin/apartments/${id}`);
      setApartments(prev => prev.map(a => a.id === id ? { ...a, is_active: false } : a));
    } catch { /* ignore */ }
  };

  if (loading) return <div className="text-center py-20 text-gray-400">Загрузка...</div>;

  if (editing !== null) {
    return (
      <div className="space-y-6 max-w-2xl">
        <button onClick={() => setEditing(null)} className="flex items-center gap-2 text-gray-400 hover:text-remon-red text-sm font-bold transition-colors">
          <ArrowLeft size={16} /> Назад
        </button>
        <h2 className="text-2xl font-black uppercase tracking-tighter">{editing.id ? 'Редактировать' : 'Новая'} квартира</h2>
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm space-y-5">
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Проект</label>
            <select
              value={editing.project_id || ''}
              onChange={e => setEditing(prev => ({ ...prev, project_id: Number(e.target.value) }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
            >
              <option value="">Выберите проект</option>
              {projects.map(p => <option key={p.id} value={p.id}>{p.name} ({p.city})</option>)}
            </select>
          </div>
          {[
            { label: 'Название', key: 'title' as const },
            { label: 'Комнаты (1к / 2к / Студия)', key: 'rooms' as const },
            { label: 'Этаж', key: 'floor' as const },
            { label: 'URL фото квартиры', key: 'image_url' as const },
            { label: 'URL планировки', key: 'layout_url' as const },
          ].map(f => (
            <div key={f.key}>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">{f.label}</label>
              <input
                type="text"
                value={(editing[f.key] as string) || ''}
                onChange={e => setEditing(prev => ({ ...prev, [f.key]: e.target.value }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Площадь (м²)</label>
              <input
                type="number"
                value={editing.area || ''}
                onChange={e => setEditing(prev => ({ ...prev, area: Number(e.target.value) }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Цена (₽)</label>
              <input
                type="number"
                value={editing.price || ''}
                onChange={e => setEditing(prev => ({ ...prev, price: Number(e.target.value) }))}
                className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
              />
            </div>
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Статус</label>
            <select
              value={editing.status || 'available'}
              onChange={e => setEditing(prev => ({ ...prev, status: e.target.value }))}
              className="w-full bg-gray-50 border border-gray-100 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red"
            >
              <option value="available">Доступна</option>
              <option value="reserved">Забронирована</option>
              <option value="sold">Продана</option>
            </select>
          </div>
          {(editing.image_url || editing.layout_url) && (
            <div className="grid grid-cols-2 gap-4">
              {editing.image_url && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Фото</label>
                  <img src={editing.image_url} alt="фото" className="w-full h-28 object-cover rounded-xl" />
                </div>
              )}
              {editing.layout_url && (
                <div>
                  <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Планировка</label>
                  <img src={editing.layout_url} alt="планировка" className="w-full h-28 object-cover rounded-xl" />
                </div>
              )}
            </div>
          )}
          <button onClick={save} className="w-full btn-primary py-4 rounded-xl font-black uppercase text-[10px] tracking-widest">
            Сохранить
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-black uppercase tracking-tighter">Квартиры ({apartments.length})</h2>
        <button onClick={() => setEditing({})} className="btn-primary px-6 py-3 rounded-xl font-black uppercase text-[10px] tracking-widest flex items-center gap-2">
          <Plus size={16} /> Добавить
        </button>
      </div>
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-50">
                {['Фото', 'Название', 'Проект', 'Комнаты', 'Площадь', 'Цена', 'Статус', ''].map(h => (
                  <th key={h} className="text-left px-5 py-4 text-[10px] font-black uppercase tracking-widest text-gray-400">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {apartments.map(a => (
                <tr key={a.id} className={`border-b border-gray-50 hover:bg-gray-50 transition-colors ${!a.is_active ? 'opacity-40' : ''}`}>
                  <td className="px-5 py-3">
                    {a.image_url ? (
                      <img src={a.image_url} alt={a.title} className="w-12 h-9 object-cover rounded-lg" />
                    ) : (
                      <div className="w-12 h-9 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Home size={14} className="text-gray-300" />
                      </div>
                    )}
                  </td>
                  <td className="px-5 py-3 font-bold text-sm">{a.title}</td>
                  <td className="px-5 py-3 text-xs text-gray-400">{a.project_name}</td>
                  <td className="px-5 py-3 text-sm">{a.rooms}</td>
                  <td className="px-5 py-3 text-sm">{a.area} м²</td>
                  <td className="px-5 py-3 text-sm font-bold">{fmt(a.price)} ₽</td>
                  <td className="px-5 py-3">
                    <span className={`px-2 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider ${
                      a.status === 'available' ? 'bg-green-50 text-green-600' :
                      a.status === 'reserved' ? 'bg-amber-50 text-amber-600' :
                      'bg-red-50 text-red-500'
                    }`}>
                      {a.status === 'available' ? 'Доступна' : a.status === 'reserved' ? 'Бронь' : 'Продана'}
                    </span>
                  </td>
                  <td className="px-5 py-3">
                    <div className="flex gap-2">
                      <button onClick={() => setEditing(a)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors">
                        <Pencil size={13} />
                      </button>
                      {a.is_active && (
                        <button onClick={() => remove(a.id)} className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center hover:bg-red-100 transition-colors text-red-500">
                          <Trash2 size={13} />
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Main Admin Page ────────────────────────────────────────────────────────
type AdminTab = 'stats' | 'users' | 'projects' | 'apartments' | 'news' | 'cameras' | 'messages';
export default function AdminPage() {
  const { user, loading, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState<AdminTab>('stats');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'admin')) router.push('/');
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.role === 'admin') {
      apiGet<Project[]>('/api/admin/projects').then(setProjects).catch(() => {});
    }
  }, [user]);

  if (loading || !user || user.role !== 'admin') return null;

  const navItems: { key: AdminTab; label: string; icon: React.ReactNode }[] = [
    { key: 'stats', label: 'Статистика', icon: <BarChart3 size={20} /> },
    { key: 'users', label: 'Пользователи', icon: <Users size={20} /> },
    { key: 'projects', label: 'Проекты', icon: <Building2 size={20} /> },
    { key: 'apartments', label: 'Квартиры', icon: <Home size={20} /> },
    { key: 'news', label: 'Новости', icon: <Newspaper size={20} /> },
    { key: 'cameras', label: 'Камеры', icon: <Camera size={20} /> },
    { key: 'messages', label: 'Сообщения', icon: <MessageSquare size={20} /> },
  ];

  const renderContent = () => {
    switch (tab) {
      case 'stats': return <StatsDashboard />;
      case 'users': return <UsersManagement projects={projects} />;
      case 'projects': return <ProjectsManagement />;
      case 'apartments': return <ApartmentsManagement projects={projects} />;
      case 'news': return <NewsManagement projects={projects} />;
      case 'cameras': return <CamerasManagement projects={projects} />;
      case 'messages': return <MessagesManagement />;
    }
  };
  return (
    <div className="flex h-screen bg-[#f8f9fa] overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed lg:relative inset-y-0 left-0 z-50
        w-[260px] bg-remon-black flex flex-col
        transition-transform duration-300
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
        <div className="p-8 border-b border-white/10">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-white">
            REMON<span className="text-remon-red">.</span>
          </Link>
          <p className="text-white/30 text-[10px] font-black uppercase tracking-widest mt-1">Администратор</p>
        </div>

        <nav className="flex-1 py-4">
          {navItems.map(item => (
            <button
              key={item.key}
              onClick={() => { setTab(item.key); setSidebarOpen(false); }}
              className={`dash-nav-item w-full ${tab === item.key ? 'active' : ''}`}
            >
              {item.icon}
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10 space-y-1">
          <Link href="/cabinet" className="dash-nav-item w-full block text-center">
            ← Кабинет
          </Link>
          <button
            onClick={async () => { await logout(); router.push('/'); }}
            className="dash-nav-item w-full text-red-400"
          >
            <LogOut size={20} /> Выйти
          </button>
        </div>
      </aside>

      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="h-[70px] bg-white border-b border-gray-100 flex items-center justify-between px-6 md:px-10 shrink-0">
          <div className="flex items-center gap-4">
            <button className="lg:hidden w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100" onClick={() => setSidebarOpen(true)}>
              <Menu size={20} />
            </button>
            <h1 className="font-black text-lg uppercase tracking-tight">
              {navItems.find(n => n.key === tab)?.label}
            </h1>
          </div>
          <div className="text-sm text-gray-400 font-medium">{user.email}</div>
        </header>

        <main className="flex-1 overflow-y-auto p-6 md:p-10">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}
