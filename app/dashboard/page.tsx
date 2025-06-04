// app/dashboards/page.tsx
'use client';
import { useState } from 'react';
import { Comfortaa } from "next/font/google";
import Songs from "./components/Songs";
import Albums from "./components/Albums";
import Playlists from "./components/Playlists";
import CreatePlaylistModal from './components/CreatePlaylistsModal';
import { LikedSongsProvider } from '../contexts/LikedSongsContext';
import { AudioPlayerProvider } from '../contexts/AudioPlayerContext'; // PASO 2.A: Importar el nuevo provider
import { PlusCircleIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';

const comfortaa = Comfortaa({
  weight: '400',
  subsets: ['latin']
});

export default function Dashboard() {
  const [isCreatePlaylistModalOpen, setIsCreatePlaylistModalOpen] = useState(false);
  const [songSearchTerm, setSongSearchTerm] = useState('');
  const [albumSearchTerm, setAlbumSearchTerm] = useState('');

  return (
    // Es buena práctica anidar los providers. El orden aquí no es crítico,
    // pero mantenerlos juntos facilita la lectura.
    <LikedSongsProvider>
      <AudioPlayerProvider> {/* PASO 2.B: Envolver el contenido con el AudioPlayerProvider */}
        <main className={`${comfortaa.className} text-xl`}>
          <section className="m-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="border-b-1 text-2xl w-11/12 sm:w-9/12 font-semibold">Listen your playlists...</h2>
              <button
                onClick={() => setIsCreatePlaylistModalOpen(true)}
                className="p-1 sm:p-2 text-white hover:text-sky-400 transition-colors"
                title="Crear nueva playlist"
              >
                <PlusCircleIcon className="w-6 h-6 sm:w-7 sm:h-7" />
              </button>
            </div>
            <Playlists />
          </section>
          
          <section className="m-6">
              <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 gap-2">
                <h2 className="border-b-1 sm:w-9/12 w-full text-2xl font-semibold mb-2">Discover new music...</h2>
                <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar canciones..."
                    className="w-full bg-neutral-700/50 text-white placeholder-neutral-400 border border-neutral-600 rounded-full py-2 px-4 pl-10 text-sm focus:ring-sky-500 focus:border-sky-500"
                    value={songSearchTerm}
                    onChange={(e) => setSongSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
              </div>
              <Songs searchTerm={songSearchTerm} /> 
          </section>
          <section className="m-6">
            <div className="flex flex-col sm:flex-row sm:justify-between items-center mb-4 gap-2">
              <h2 className="border-b-1 sm:w-9/12 w-full text-2xl font-semibold mb-2">Discover new albums...</h2>
              <div className="relative w-full sm:w-auto sm:max-w-xs">
                  <input
                    type="text"
                    placeholder="Buscar álbumes..."
                    className="w-full bg-neutral-700/50 text-white placeholder-neutral-400 border border-neutral-600 rounded-full py-2 px-4 pl-10 text-sm focus:ring-sky-500 focus:border-sky-500"
                    value={albumSearchTerm}
                    onChange={(e) => setAlbumSearchTerm(e.target.value)}
                  />
                  <MagnifyingGlassIcon className="w-5 h-5 text-neutral-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
                </div>
            </div>
            <Albums searchTerm={albumSearchTerm} />
          </section>
        </main>

        {isCreatePlaylistModalOpen && (
          <CreatePlaylistModal
            isOpen={isCreatePlaylistModalOpen}
            onClose={() => setIsCreatePlaylistModalOpen(false)}
            // onPlaylistCreated={() => { /* Lógica para re-fetchear playlists */ }}
          />
        )}
      </AudioPlayerProvider>
    </LikedSongsProvider>
  )
}