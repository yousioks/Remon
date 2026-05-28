'use client';

import React, { useEffect, useState } from 'react';

export default function GlobalMediaBanner() {
  const [media, setMedia] = useState<{ url: string; type: string } | null>(null);

  useEffect(() => {
    // Получаем глобальные медиа (без авторизации)
    const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';
    fetch(`${API}/api/settings/global-media`)
      .then(res => res.json())
      .then(data => {
        if (data && data.url) {
          setMedia({ url: `${API}${data.url}`, type: data.type });
        }
      })
      .catch(console.error);
  }, []);

  if (!media) return null;

  return (
    <div className="w-full bg-remon-black">
      {media.type === 'video' ? (
        <video 
          src={media.url} 
          autoPlay 
          loop 
          muted 
          playsInline
          className="w-full h-auto max-h-[30vh] md:max-h-[50vh] object-cover"
        />
      ) : (
        <img 
          src={media.url} 
          alt="Global Update" 
          className="w-full h-auto max-h-[30vh] md:max-h-[50vh] object-cover"
        />
      )}
    </div>
  );
}
