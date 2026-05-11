'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

function TelegramIcon() {
  return (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="12" cy="12" r="12" fill="#29B6F6"/>
      <path d="M17.472 6.28L5.28 10.9c-.83.33-.82.79-.15 1l3.13.98 1.2 3.73c.16.44.31.61.64.61.26 0 .38-.12.53-.27l1.6-1.55 3.33 2.46c.61.34 1.05.16 1.2-.57l2.17-10.22c.22-.88-.33-1.28-.99-.97z" fill="white"/>
    </svg>
  );
}

interface Props {
  apiUrl: string;
  /** Текст тултипа — разный для login и register */
  title?: string;
}

export default function TelegramLoginButton({ apiUrl, title = 'Войти через Telegram' }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const { loginWithToken } = useAuth();
  const [error, setError] = useState('');
  const [widgetLoaded, setWidgetLoaded] = useState(false);

  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME;

  useEffect(() => {
    if (!botName || !containerRef.current) return;
    // Уже встроен
    if (containerRef.current.childElementCount > 0) return;

    (window as unknown as Record<string, unknown>).onTelegramAuth = async (tgUser: Record<string, string>) => {
      try {
        const res = await fetch(`${apiUrl}/api/auth/telegram`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(tgUser),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: 'Ошибка Telegram' }));
          setError(err.error || 'Ошибка авторизации через Telegram');
          return;
        }
        const data = await res.json();
        await loginWithToken(data.accessToken, data.refreshToken);
        if (data.user?.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/cabinet');
        }
      } catch {
        setError('Ошибка соединения с сервером');
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', botName);
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;
    script.onload = () => setWidgetLoaded(true);
    containerRef.current.appendChild(script);

    return () => {
      delete (window as unknown as Record<string, unknown>).onTelegramAuth;
    };
  }, [apiUrl, botName, loginWithToken, router]);

  if (!botName) {
    return (
      <div
        className="flex items-center justify-center py-3 border border-gray-100 rounded-xl opacity-40 cursor-not-allowed"
        title="Telegram не настроен"
      >
        <TelegramIcon />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center col-span-1">
      <div
        className="relative flex items-center justify-center w-full py-3 border border-gray-100 rounded-xl hover:border-blue-200 hover:bg-blue-50 transition-all overflow-hidden cursor-pointer"
        style={{ minHeight: 48 }}
        title={title}
      >
        <span className="pointer-events-none z-10 flex items-center justify-center">
          <TelegramIcon />
        </span>
        <div
          ref={containerRef}
          className="absolute inset-0 flex items-center justify-center overflow-hidden"
          style={{ opacity: widgetLoaded ? 0.01 : 0 }}
        />
      </div>
      {error && <p className="text-red-500 text-xs mt-1 text-center">{error}</p>}
    </div>
  );
}
