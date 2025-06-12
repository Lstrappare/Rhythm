import { ClerkProvider } from '@clerk/nextjs';
import Header from './components/Header';
import './globals.css';
import {dark} from '@clerk/themes'
import Footer from './components/Footer';
import { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Rhythm",
  description: "Una plataforma web para escuchar música, marcar tus canciones favoritas y crear playlists personalizadas.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider appearance={{
      baseTheme: dark,
    }}>
      <html lang="es">
        <body className="bg-black text-white">
          <div className="absolute inset-0 -z-10 h-full w-full items-center px-5 py-24 bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,0.15),rgba(255,255,255,0))]"></div>
          <Header />
          <div className='mt-25'>
            {children}
          </div>
          <Footer />
        </body>
      </html>
    </ClerkProvider>
  );
}
