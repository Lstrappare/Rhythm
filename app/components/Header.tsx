'use client'
import { Codystar } from 'next/font/google'

import { useState } from 'react';
import { useEffect } from 'react';
import Lights from './Lights';

const codystar = Codystar({
  weight: '400',
  subsets: ['latin'],
})

export default function Header() {
  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const now = new Date();
    const hour = now.getHours();

    if (hour >= 5 && hour < 12) {
      setGreeting('Good morning');
    } else if (hour >= 12 && hour < 18) {
      setGreeting('Good afternoon');
    } else {
      setGreeting('Good evening');
    }
  }, []);
  
  return (
    <div className='fixed top-0 w-full z-50 bg-black/80'>
    <Lights />
    <header className="p-6 flex justify-between items-center backdrop-blur-xl">
        <h1 className={`font-bold text-white text-3xl ${codystar.className}`}>Rhythm</h1>
        <h2 className={`${codystar.className} text-base sm:text-xl`}>| {greeting} |</h2>
    </header>
    </div>
  );
}