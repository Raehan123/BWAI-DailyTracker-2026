import type {Metadata} from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import AuthGuard from '../components/AuthGuard';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PERSONAL SUPER APP // NEO-BRUTALIST',
  description: '8-bit Retro Neo-Brutalist Dashboard untuk Perencanaan Harian, Pelacakan Uang, dan Kebiasaan.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <body className="bg-zinc-300 text-black font-sans antialiased selection:bg-yellow-400 selection:text-black min-h-screen" suppressHydrationWarning>
        <AuthGuard>
          {children}
        </AuthGuard>
      </body>
    </html>
  );
}
