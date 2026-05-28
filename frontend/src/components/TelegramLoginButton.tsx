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
  action?: 'login' | 'register' | 'recover';
  title?: string;
}

export default function TelegramLoginButton({ action = 'login', title = 'Войти через Telegram' }: Props) {
  const botName = process.env.NEXT_PUBLIC_TELEGRAM_BOT_NAME || 'RemonSecurityBot';

  return (
    <a
      href={`https://t.me/${botName}?start=${action}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center justify-center gap-3 w-full py-4 mt-4 bg-[#29B6F6] text-white rounded-xl font-black uppercase text-sm hover:bg-[#2096CC] transition-all cursor-pointer shadow-md hover:shadow-xl hover:-translate-y-1"
      title={title}
    >
      <TelegramIcon />
      <span className="tracking-widest">{title}</span>
    </a>
  );
}
