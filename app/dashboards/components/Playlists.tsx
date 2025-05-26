// app/dashboards/components/Playlists.tsx
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useLikedSongs, PlaylistSongData } from '@/app/contexts/LikedSongsContext'; // Ajusta la ruta

interface PlaylistSongDisplay { // Esta es la canción tal como viene de la playlist
  id: string;
  nombre: string;
  artista?: string;
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
  foto_portada?: string;
}

export default function Playlists() {
  const { isSignedIn, user } = useUser();
  const [playlists, setPlaylists] = useState<PlaylistDisplay[]>([]);
  const [loading, setLoading] = useState(true); // Renombrado para claridad
  const [error, setError] = useState<string | null>(null);
  const [flippedPlaylists, setFlippedPlaylists] = useState<Record<string, boolean>>({});
  const { likedSongIds, toggleLikeSong, isLoadingLikes } = useLikedSongs(); // Usar el contexto

  const handleFlip = (playlistId: string) => {
    setFlippedPlaylists(prev => ({ ...prev, [playlistId]: !prev[playlistId] }));
  };

  useEffect(() => {
    async function fetchUserPlaylists() {
      if (!isSignedIn) { setLoading(false); setPlaylists([]); return; }
      try {
        setLoading(true); setError(null);
        const response = await fetch('/api/playlists');
        if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch playlists');
        setPlaylists(await response.json());
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    }
    fetchUserPlaylists();
  }, [isSignedIn, user]); // Dependencia en user también

  const handleLikeClickInPlaylist = (song: PlaylistSongDisplay) => {
    // Mapear PlaylistSongDisplay a PlaylistSongData si es necesario
    // Aquí asumimos que PlaylistSongDisplay tiene todos los campos requeridos por PlaylistSongData
    const songDataForPlaylist: PlaylistSongData = {
      id: song.id,
      nombre: song.nombre,
      artista: song.artista || 'Desconocido', // Proveer valor por defecto si es opcional
      album: song.album || 'Desconocido',   // Proveer valor por defecto si es opcional
      foto: song.foto,
      pista: song.pista,
    };
    toggleLikeSong(songDataForPlaylist);
  };

  if (!isSignedIn && !loading && !isLoadingLikes) {
    return <p className="text-neutral-400 text-sm p-4">Log in to see your playlists.</p>;
  }

  if (loading || isLoadingLikes) {
    return <p>Loading playlists... 🎵</p>;
  }
  
  return (
    <div className="relative">
      {error && <p className="text-red-400">Error loading playlists: {error}</p>}
      {!loading && !error && playlists.length === 0 && isSignedIn && (
        <p className='text-sm'>You don't have any playlists yet. Start by <span className='underline'>liking some songs!</span></p>
      )}

      <div className="relative">
        {!loading && !error && playlists.length > 0 && (
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50">
              {playlists.map((playlist) => {
                const isFlipped = !!flippedPlaylists[playlist.playlist_id];
                return (
                  <div key={playlist.playlist_id} className="flex-none w-60 h-72 [perspective:1200px] cursor-pointer group" onClick={() => handleFlip(playlist.playlist_id)}>
                    <motion.div className="relative w-full h-full [transform-style:preserve-3d]" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
                      {/* Cara Frontal */}
                      <div className="absolute w-10/12 h-full [backface-visibility:hidden] rounded-lg shadow-lg bg-red-900/10 hover:bg-red-700/30 p-4 flex flex-col justify-between items-center">
                        <img src={playlist.foto_portada || playlist.canciones?.[0]?.foto || 'https://via.placeholder.com/240x240?text=Playlist'} alt={`Cover of ${playlist.nombre_playlist}`} className="w-full h-40 object-cover rounded mb-2" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=No+Image'; }} />
                        <div className="flex flex-col items-center">
                          <h3 className="text-md font-semibold truncate text-white text-center" title={playlist.nombre_playlist}>{playlist.nombre_playlist}</h3>
                          <p className="text-xs text-neutral-400">{playlist.canciones?.length || 0} {playlist.canciones?.length === 1 ? 'canción' : 'canciones'}</p>
                        </div>
                      </div>
                      {/* Cara Trasera */}
                      <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-neutral-900 p-4 rounded-lg shadow-lg text-white flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-neutral-600 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
                        <button className="absolute top-2 right-2 text-neutral-300 hover:text-white z-20 p-1" onClick={(e) => { e.stopPropagation(); handleFlip(playlist.playlist_id); }} aria-label="Cerrar vista de canciones">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        <h4 className="text-md font-semibold mb-2 text-center">{playlist.nombre_playlist}</h4>
                        <p className="text-xs text-neutral-400 mb-3 text-center">Tracks</p>
                        <ul className="space-y-1 flex-grow"> {/* Reducido space-y para más items */}
                          {playlist.canciones.map(song => (
                            <li key={song.id} className="text-neutral-200 py-1">
                              <div className="flex items-center justify-between mb-1">
                                <p className="text-sm truncate font-medium flex-grow" title={song.nombre}>{song.nombre}</p>
                                {isSignedIn && (
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation(); // Prevenir que la tarjeta se voltee
                                      handleLikeClickInPlaylist(song);
                                    }}
                                    className="p-1 text-white hover:text-pink-500 transition-colors ml-2 flex-shrink-0"
                                    aria-label={likedSongIds.has(song.id) ? "Quitar de Liked Songs" : "Agregar a Liked Songs"}
                                  >
                                    {likedSongIds.has(song.id) ? (
                                      <HeartIconSolid className="w-4 h-4 text-pink-500" />
                                    ) : (
                                      <HeartIconOutline className="w-4 h-4" />
                                    )}
                                  </button>
                                )}
                              </div>
                              <audio controls src={song.pista} className="w-full h-7" preload="metadata"> {/* Reducido h-7 */}
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