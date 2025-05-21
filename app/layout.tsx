import { ClerkProvider } from '@clerk/nextjs';
import Header from './components/Header';
import './globals.css';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="es">
        <body className="bg-black text-white">
          <div className="relative h-full w-full bg-slate-950 -z-50"><div className="absolute bottom-0 left-[-20%] right-0 top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))]"></div><div className="absolute bottom-0 right-[-20%] top-[-10%] h-[500px] w-[500px] rounded-full bg-[radial-gradient(circle_farthest-side,rgba(255,0,182,.15),rgba(255,255,255,0))] -z-50"></div></div>
          <Header />
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}
