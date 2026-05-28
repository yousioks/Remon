'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { apiGet, apiPost } from '@/lib/api';
import { X } from 'lucide-react';
import { PageBlock } from './EditableMediaBlock';

interface PageBlocksContextType {
  blocksConfig: Record<string, PageBlock>;
  onEditRequest: (blockId: string) => void;
}

const PageBlocksContext = createContext<PageBlocksContextType | null>(null);

export function usePageBlocks() {
  const context = useContext(PageBlocksContext);
  if (!context) {
    throw new Error('usePageBlocks must be used within a PageBlocksProvider');
  }
  return context;
}

// ─── Global Media Selector Modal ──────────────────────────────────────────
function GlobalPageMediaSelectorModal({ onSelect, onClose }: { onSelect: (url: string) => void, onClose: () => void }) {
  const [files, setFiles] = useState<{ filename: string; url: string; size: number; isVideo: boolean; createdAt: string }[]>([]);
  const [externalUrl, setExternalUrl] = useState('');
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

  useEffect(() => {
    apiGet<any[]>('/api/admin/media').then(setFiles).catch(() => {});
  }, []);

  const handleExternalSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (externalUrl.trim()) onSelect(externalUrl.trim());
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="text-xl font-black uppercase tracking-tighter text-black">Выберите медиа</h3>
          <button onClick={onClose} className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 text-black">
            <X size={18} />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-100 bg-gray-50/50">
          <label className="block text-[10px] font-black uppercase text-gray-400 mb-2 tracking-widest">Или вставьте ссылку (YouTube / VK / Rutube / Изображение)</label>
          <form onSubmit={handleExternalSubmit} className="flex gap-2">
            <input 
              type="text" 
              placeholder="https://..." 
              value={externalUrl} 
              onChange={e => setExternalUrl(e.target.value)}
              className="flex-1 bg-white border border-gray-200 rounded-xl p-3 text-sm font-medium outline-none focus:border-remon-red text-black"
            />
            <button type="submit" className="px-6 bg-remon-black text-white rounded-xl font-bold text-[10px] uppercase tracking-widest hover:bg-remon-red transition-colors whitespace-nowrap">
              Вставить
            </button>
          </form>
        </div>

        <div className="p-6 overflow-y-auto flex-1 bg-gray-50">
          {files.length === 0 ? (
            <div className="text-center py-20 text-gray-400 font-medium">Нет загруженных файлов.</div>
          ) : (
            <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
              {files.map(f => (
                <div key={f.filename} className="group relative bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                     onClick={() => onSelect(`/uploads/${f.filename}`)}>
                  <div className="aspect-square flex items-center justify-center bg-gray-50">
                    {f.isVideo ? (
                      <div className="flex flex-col items-center gap-2 text-gray-400"><span className="text-3xl">🎬</span></div>
                    ) : (
                      <img src={`${API}${f.url}`} alt={f.filename} className="w-full h-full object-cover" />
                    )}
                  </div>
                  <div className="p-2 truncate text-[10px] text-gray-500 font-bold text-center">
                    {f.filename}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export function PageBlocksProvider({ children }: { children: React.ReactNode }) {
  const [blocksConfig, setBlocksConfig] = useState<Record<string, PageBlock>>({});
  const [editingBlock, setEditingBlock] = useState<string | null>(null);

  useEffect(() => {
    apiGet<Record<string, PageBlock>>('/api/settings/page-blocks')
      .then(res => setBlocksConfig(res))
      .catch(() => {});
  }, []);

  const handleEditRequest = (blockId: string) => {
    setEditingBlock(blockId);
  };

  const handleMediaSelect = async (url: string) => {
    if (!editingBlock) return;
    try {
      const res = await apiPost<{success: boolean, block: PageBlock}>(`/api/settings/page-blocks/${editingBlock}`, { url, type: 'image' });
      if (res.success && res.block) {
        setBlocksConfig(prev => ({ ...prev, [editingBlock]: res.block }));
      }
    } catch (e) {
      console.error(e);
      alert('Ошибка при сохранении. Проверьте авторизацию.');
    }
    setEditingBlock(null);
  };

  return (
    <PageBlocksContext.Provider value={{ blocksConfig, onEditRequest: handleEditRequest }}>
      {children}
      {editingBlock && (
        <GlobalPageMediaSelectorModal onSelect={handleMediaSelect} onClose={() => setEditingBlock(null)} />
      )}
    </PageBlocksContext.Provider>
  );
}
