'use client';

import React, { Suspense } from 'react';
import { Pencil } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { usePageBlocks } from './PageBlocksProvider';

export interface PageBlock {
  type: 'image' | 'video' | 'youtube' | 'vk' | 'rutube';
  url: string;
}

export interface EditableMediaBlockProps {
  blockId: string;
  defaultUrl: string;
  className?: string;
  alt?: string;
}

function parseUrl(url: string): { type: PageBlock['type'], parsedUrl: string } {
  if (!url) return { type: 'image', parsedUrl: '' };
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    const videoId = url.split('v=')[1]?.split('&')[0] || url.split('youtu.be/')[1]?.split('?')[0];
    return { type: 'youtube', parsedUrl: `https://www.youtube.com/embed/${videoId}?autoplay=1&mute=1&loop=1&playlist=${videoId}` };
  }
  
  if (url.includes('vk.com/video')) {
    // Basic VK video embed heuristic (expects iframe code or direct vk.com/video_oid_vid format to be converted manually or pasted directly)
    // Actually, user will just paste standard VK embed link or we try to extract it.
    // For simplicity, if it's already an embed link we just use it, otherwise we just use the url as iframe src.
    return { type: 'vk', parsedUrl: url };
  }
  
  if (url.includes('rutube.ru/video')) {
    const videoId = url.split('rutube.ru/video/')[1]?.split('/')[0];
    return { type: 'rutube', parsedUrl: `https://rutube.ru/play/embed/${videoId}` };
  }
  
  if (url.match(/\.(mp4|webm|mov|avi)$/i)) {
    return { type: 'video', parsedUrl: url };
  }

  return { type: 'image', parsedUrl: url };
}

function EditableMediaBlockInner({ blockId, defaultUrl, className = '', alt = 'media' }: EditableMediaBlockProps) {
  const searchParams = useSearchParams();
  const isEditMode = searchParams.get('edit') === 'true';
  const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
  const { blocksConfig, onEditRequest } = usePageBlocks();

  const block = blocksConfig[blockId];
  let finalUrl = block?.url || defaultUrl;
  
  // If it's a relative backend URL, prefix it
  if (finalUrl.startsWith('/uploads')) {
    finalUrl = `${API}${finalUrl}`;
  }

  const { type, parsedUrl } = parseUrl(finalUrl);

  const renderMedia = () => {
    switch (type) {
      case 'youtube':
      case 'vk':
      case 'rutube':
        return (
          <iframe
            src={parsedUrl}
            className={`w-full h-full object-cover pointer-events-none ${className}`}
            frameBorder="0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
          />
        );
      case 'video':
        return <video src={parsedUrl} autoPlay loop muted playsInline className={`w-full h-full object-cover ${className}`} />;
      case 'image':
      default:
        return <img src={parsedUrl} alt={alt} className={`w-full h-full object-cover ${className}`} />;
    }
  };

  return (
    <div className={`relative group ${className}`}>
      {renderMedia()}
      
      {isEditMode && onEditRequest && (
        <div className="absolute inset-0 bg-remon-red/0 group-hover:bg-remon-red/20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100 z-50">
          <button 
            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onEditRequest(blockId); }}
            className="btn-primary bg-remon-black text-white px-6 py-3 rounded-2xl font-black uppercase text-xs tracking-widest flex items-center gap-2 shadow-2xl hover:scale-105 transition-transform"
          >
            <Pencil size={16} /> Изменить медиа
          </button>
        </div>
      )}
    </div>
  );
}

export default function EditableMediaBlock(props: EditableMediaBlockProps) {
  return (
    <Suspense fallback={<div className={`w-full h-full ${props.className || ''}`} />}>
      <EditableMediaBlockInner {...props} />
    </Suspense>
  );
}
