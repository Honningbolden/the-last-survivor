import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { DirectionProvider } from './components/get-direction';
import Link from 'next/link';

const geistSans = localFont({
  src: './fonts/GeistVF.woff',
  variable: '--font-geist-sans',
  weight: '100 900',
});
const geistMono = localFont({
  src: './fonts/GeistMonoVF.woff',
  variable: '--font-geist-mono',
  weight: '100 900',
});

export const metadata: Metadata = {
  title: 'The Last Survivor: An Interactive Storybook',
  description:
    'This is an interactive 3D storybook experience, created by Hannibal Marcellus Munk. Github: @honningbolden',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang='en'>
      <body className={`${geistSans.variable} ${geistMono.variable} font-mono antialiased`}>
        <main>
          <DirectionProvider>{children}</DirectionProvider>
        </main>
        <footer className='absolute m-4 text-white bottom-0 px-2 py-1 text-sm bg-black z-50'>
          Created by{' '}
          <Link href='https://www.github.com/honningbolden' className='hover:underline'>
            @honningbolden
          </Link>
        </footer>
      </body>
    </html>
  );
}
