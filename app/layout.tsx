import type {Metadata} from 'next';
import { Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import './globals.css'; // Global styles
import AuthGuard from '../components/AuthGuard';
import AiAssistant from '../components/AiAssistant';

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  variable: '--font-sans',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'Mindful Days • Personal Super App',
  description: 'Minimalist Glassmorphism Dashboard untuk Perencanaan Harian, Pelacakan Uang, dan Kebiasaan.',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="id" data-theme="light" className={`${spaceGrotesk.variable} ${jetbrainsMono.variable}`}>
      <head />
      <body className="bg-theme-bg text-theme-text font-sans antialiased selection:bg-indigo-500/40 selection:text-white min-h-screen relative overflow-x-hidden transition-colors duration-300" suppressHydrationWarning>
        {/* Dynamic ambient background blur blobs optimized for light theme */}
        <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-br from-indigo-500/5 to-purple-500/5 blur-[140px] pointer-events-none z-[-10]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-sky-500/3 to-indigo-500/3 blur-[140px] pointer-events-none z-[-10]" />
        <div className="absolute top-[35%] left-[40%] w-[300px] h-[300px] rounded-full bg-violet-500/3 blur-[120px] pointer-events-none z-[-10]" />
        
        <AuthGuard>
          {children}
          <AiAssistant />
        </AuthGuard>
      </body>
    </html>
  );
}
