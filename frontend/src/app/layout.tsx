import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata: Metadata = {
  title: 'Remon Developer — Промышленно-Строительный Холдинг | Инновации Сибири',
  description: 'Крупнейший застройщик Сибири. Квартиры бизнес-класса, умные технологии, архитектура будущего в Новосибирске, Тюмени и Омске.',
  keywords: 'застройщик, квартиры, Омск, Тюмень, Новосибирск, новостройки, Remon',
  openGraph: {
    title: 'Remon Developer',
    description: 'Архитектура будущего в Сибири',
    url: 'https://raemon.ru',
    siteName: 'Remon Developer',
    locale: 'ru_RU',
    type: 'website',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
