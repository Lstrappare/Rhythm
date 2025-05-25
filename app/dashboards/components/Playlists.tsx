// app/dashboards/components/Playlists.tsx
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion'; // Importar motion si no está

// Reutiliza PlaylistSong si la estructura es la misma o define una específica
interface PlaylistSongDisplay {
  id: string;
  nombre: string;
  artista?: string; // Campos opcionales si no siempre están
  album?: string;
  foto: string;
  pista: string;
}

interface PlaylistDisplay {
  playlist_id: string;
  usuario_id: string;
  nombre_playlist: string;
  canciones: PlaylistSongDisplay[];
  es_liked_songs?: boolean;
  foto_portada?: string; // Podrías generar una o usar la de la primera canción
}

export default function Playlists() {
  const { isSignedIn, user } = useUser();
  const [playlists, setPlaylists] = useState<PlaylistDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedPlaylists, setFlippedPlaylists] = useState<Record<string, boolean>>({}); // Estado para las tarjetas volteadas

  // Función para manejar el volteo de una tarjeta de playlist
  const handleFlip = (playlistId: string) => {
    setFlippedPlaylists(prev => ({
      ...prev,
      // Asegúrate de que playlistId sea una string (playlist_id lo es)
      ...(prev.hasOwnProperty(playlistId) && {[playlistId]: !prev?.[playlistId]}),
      ...(!prev.hasOwnProperty(playlistId) && {[playlistId]: true}),
    }));
  };

  async function fetchUserPlaylists() {
    if (!isSignedIn) {
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/playlists');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data: PlaylistDisplay[] = await response.json();
      setPlaylists(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchUserPlaylists();
  }, [isSignedIn, user]);

  if (!isSignedIn && !loading) {
    return <p className="text-neutral-400 text-sm p-4">Inicia sesión para ver tus playlists.</p>;
  }

  return (
    <div className="relative">
      {loading && <p>Loading playlists... 🎵</p>}
      {error && <p className="text-red-400">Error loading playlists: {error}</p>}
      {!loading && !error && playlists.length === 0 && isSignedIn && (
        <p className='text-sm'>You don't have any playlists yet. Start by <span className='underline'>liking some songs!</span></p>
      )}

      <div className="relative">
        {!loading && !error && playlists.length > 0 && (
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50">
              {playlists.map((playlist) => {
                const isFlipped = !!flippedPlaylists?.[playlist.playlist_id];
                return (
                  // Contenedor de la tarjeta con perspectiva y manejo del clic
                  <div
                    key={playlist.playlist_id}
                    className="flex-none w-60 h-72 [perspective:1200px] cursor-pointer group"
                    onClick={() => handleFlip(playlist.playlist_id)}
                  >
                    <motion.div
                      className="relative w-full h-full [transform-style:preserve-3d]"
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }}
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {/* Cara Frontal */}
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-lg
                                   bg-red-900/10 hover:bg-red-700/30 p-4 flex flex-col justify-between items-center"
                      >
                        <img
                          src={playlist.foto_portada || playlist.canciones?.[0]?.foto || 'https://via.placeholder.com/240x240?text=Playlist'}
                          alt={`Cover of ${playlist.nombre_playlist}`}
                          className="w-full h-40 object-cover rounded mb-2"
                          onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=No+Image'; }}
                        />
                        <div className="flex flex-col items-center">
                          <h3 className="text-md font-semibold truncate text-white text-center" title={playlist.nombre_playlist}>
                            {playlist.nombre_playlist}
                          </h3>
                          <p className="text-xs text-neutral-400">
                            {playlist.canciones?.length || 0} {playlist.canciones?.length === 1 ? 'canción' : 'canciones'}
                          </p>
                        </div>
                      </div>

                      {/* Cara Trasera */}
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)]
                                   bg-neutral-900 p-4 rounded-lg shadow-lg text-white
                                   flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-neutral-600
                                     [&::-webkit-scrollbar]:w-2
                                     [&::-webkit-scrollbar-track]:bg-neutral-900
                                     [&::-webkit-scrollbar-thumb]:bg-neutral-800"
                      >
                        <button
                          className="absolute top-2 right-2 text-neutral-300 hover:text-white z-20 p-1"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleFlip(playlist.playlist_id);
                          }}
                          aria-label="Cerrar vista de canciones"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <h4 className="text-md font-semibold mb-2 text-center">{playlist.nombre_playlist}</h4>
                        <p className="text-xs text-neutral-400 mb-3 text-center">Tracks</p>
                        <ul className="space-y-2 flex-grow">
                          {playlist.canciones.map(song => (
                            <li key={song.id} className="text-neutral-200">
                              <p className="text-sm truncate font-medium" title={song.nombre}>{song.nombre}</p>
                              <audio
                                controls
                                src={song.pista}
                                className="w-full h-8 mt-1"
                                preload="metadata"
                              >
                                Your browser does not support the audio element.
                              </audio>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            {/* Fades Laterales */}
            <span className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-r from-black to-transparent" />
            <span className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-l from-black to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}