import type { Metadata } from 'next';
import { Manrope, Playfair_Display } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import GlobalMediaBanner from '@/components/GlobalMediaBanner';
import { PageBlocksProvider } from '@/components/PageBlocksProvider';

const manrope = Manrope({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-manrope',
  display: 'swap',
});

const playfair = Playfair_Display({
  subsets: ['cyrillic', 'latin'],
  variable: '--font-playfair',
  display: 'swap',
});

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
    <html lang="ru" className={`${manrope.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased">
        <AuthProvider>
          <PageBlocksProvider>
            <GlobalMediaBanner />
            {children}
          </PageBlocksProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
