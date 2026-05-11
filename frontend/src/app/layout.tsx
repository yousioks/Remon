import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Remon Developer — Девелоперская компания | Новостройки Омска',
  description: 'Разработка новостроек. Продажа квартир-студий, однокомнатных, двухкомнатных и трехкомнатных квартир, кладовых и парков.',
  keywords: 'девелопер, недвижимость, квартира, новостройка, ипотека, субсидированная, Remon',
  openGraph: {
    title: 'Remon Developer',
    description: 'Разработка и строительство',
    url: 'https://raemon.ru',
    siteName: 'Remon Developer',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body className="pt-[106px]">
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
