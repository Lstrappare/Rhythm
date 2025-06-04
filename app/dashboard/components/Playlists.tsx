// app/dashboards/components/Playlists.tsx
'use client';
import { useCallback, useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs';
import { motion } from 'framer-motion';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline'; // Para cerrar el flip
import { XMarkIcon as XMarkSmallIcon } from '@heroicons/react/20/solid'; // Para quitar canción
import { useLikedSongs, PlaylistSongData } from '@/app/contexts/LikedSongsContext'; // Ajusta la ruta
import ManagedAudioPlayer from './ManagedAudioPlayer';

// Interfaces (PlaylistSongDisplay, PlaylistDisplay) ...
interface PlaylistSongDisplay {
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

const LIKED_SONGS_PLAYLIST_ID_CONST = '__LIKED_SONGS__'; // Consistente con API

export default function Playlists() {
  const { isSignedIn, user } = useUser();
  const [playlists, setPlaylists] = useState<PlaylistDisplay[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedPlaylists, setFlippedPlaylists] = useState<Record<string, boolean>>({});
  const { likedSongIds, toggleLikeSong, isLoadingLikes } = useLikedSongs();

  const handleFlip = (playlistId: string) => {
    setFlippedPlaylists(prev => ({ ...prev, [playlistId]: !prev[playlistId] }));
  };

  // Función para re-obtener las playlists (la llamarás después de eliminar una)
  const fetchUserPlaylists = useCallback(async () => {
    if (!isSignedIn) {
      setLoading(false);
      setPlaylists([]);
      return;
    }
    try {
      setLoading(true); setError(null);
      const response = await fetch('/api/playlists');
      if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch playlists');
      setPlaylists(await response.json());
    } catch (e) { setError((e as Error).message); }
    finally { setLoading(false); }
  }, [isSignedIn]); // quitamos 'user' si no es estrictamente necesario o si causa re-fetches no deseados

  useEffect(() => {
    fetchUserPlaylists();
  }, [fetchUserPlaylists]); // Depender de la función memoizada

  const handleLikeClickInPlaylist = (song: PlaylistSongDisplay) => {
    const songDataForPlaylist: PlaylistSongData = {
      id: song.id, nombre: song.nombre, artista: song.artista || '',
      album: song.album || '', foto: song.foto, pista: song.pista,
    };
    toggleLikeSong(songDataForPlaylist);
  };

  const handleRemoveSongFromPlaylist = async (playlistId: string, song: PlaylistSongDisplay) => {
    // Si es la playlist "Liked Songs", la acción es quitar el "like"
    if (playlistId === LIKED_SONGS_PLAYLIST_ID_CONST) {
      handleLikeClickInPlaylist(song); // Esto llamará a toggleLikeSong que ya maneja la lógica
      return;
    }

    try {
      const response = await fetch('/api/playlists/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'remove_song_from_playlist', playlistId, songIdToRemove: song.id }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Error al remover canción');
      
      // Actualizar UI: Actualizar la playlist específica en el estado local
      setPlaylists(prevPlaylists =>
        prevPlaylists.map(p =>
          p.playlist_id === playlistId
            ? { ...p, canciones: result.updatedPlaylist.canciones, foto_portada: result.updatedPlaylist.foto_portada } // Usa la playlist actualizada de la API
            : p
        )
      );
      // alert('Canción removida de la playlist.'); // O notificación más sutil
    } catch (err) {
      console.error("Error removing song:", err);
      alert((err as Error).message);
    }
  };

  const handleDeletePlaylist = async (playlistId: string, playlistName: string) => {
    if (playlistId === LIKED_SONGS_PLAYLIST_ID_CONST) {
      alert('La playlist "Liked Songs" no se puede eliminar.');
      return;
    }

    try {
      const response = await fetch('/api/playlists/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'delete_playlist', playlistId }),
      });
      if (!response.ok) throw new Error((await response.json()).error || 'Error al eliminar playlist');
      
      // Actualizar UI: Quitar la playlist del estado local
      setPlaylists(prevPlaylists => prevPlaylists.filter(p => p.playlist_id !== playlistId));
      // alert('Playlist eliminada.'); // O notificación más sutil
    } catch (err) {
      console.error("Error deleting playlist:", err);
      alert((err as Error).message);
    }
  };

  if (!isSignedIn && !loading && !isLoadingLikes) { /* ... */ }
  if (loading || isLoadingLikes) { /* ... */ }

  return (
    <div className="relative">
      {/* ... error y estado vacío ... */}
      <div className="relative">
        {!loading && !error && playlists.length > 0 && (
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
              {playlists.map((playlist) => {
                const isFlipped = !!flippedPlaylists[playlist.playlist_id];
                const isLikedSongsPlaylist = playlist.playlist_id === LIKED_SONGS_PLAYLIST_ID_CONST;

                return (
                  <div key={playlist.playlist_id} className="flex-none w-60 h-72 [perspective:1200px] cursor-pointer group" onClick={() => handleFlip(playlist.playlist_id)}>
                    <motion.div className="relative w-full h-full [transform-style:preserve-3d]" initial={false} animate={{ rotateY: isFlipped ? 180 : 0 }} transition={{ duration: 0.7, ease: "easeInOut" }}>
                      {/* Cara Frontal */}
                      <div className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-lg bg-red-900/10 hover:bg-red-700/30 p-4 flex flex-col justify-between items-center">
                        {!isLikedSongsPlaylist && isSignedIn && ( // Botón de eliminar playlist
                          <button
                            onClick={(e) => {
                              e.stopPropagation(); // Evitar que la tarjeta se voltee
                              handleDeletePlaylist(playlist.playlist_id, playlist.nombre_playlist);
                            }}
                            className="absolute top-2 right-2 z-20 p-1.5 bg-black/40 hover:bg-red-600 text-white rounded-full transition-opacity opacity-0 group-hover:opacity-100"
                            title="Eliminar playlist"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        )}
                        <img src={playlist.foto_portada || playlist.canciones?.[0]?.foto || 'https://via.placeholder.com/240x240?text=Playlist'} alt={`Cover of ${playlist.nombre_playlist}`} className="w-full h-40 object-cover rounded mb-2" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=No+Image'; }} />
                        <div className="flex flex-col items-center">
                          <h3 className="text-md font-semibold truncate text-white text-center" title={playlist.nombre_playlist}>{playlist.nombre_playlist}</h3>
                          <p className="text-xs text-neutral-400">{playlist.canciones?.length || 0} {playlist.canciones?.length === 1 ? 'canción' : 'canciones'}</p>
                        </div>
                      </div>

                      {/* Cara Trasera */}
                      <div className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] bg-neutral-900 p-4 rounded-lg shadow-lg text-white flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-neutral-600 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
                        <button className="absolute top-2 right-2 text-neutral-300 hover:text-white z-20 p-1" onClick={(e) => { e.stopPropagation(); handleFlip(playlist.playlist_id); }} aria-label="Cerrar vista de canciones">
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                        <h4 className="text-md font-semibold mb-2 text-center pt-1">{playlist.nombre_playlist}</h4>
                        {/* <p className="text-xs text-neutral-400 mb-3 text-center">Tracks</p> */}
                        <ul className="space-y-1 flex-grow mt-2">
                          {playlist.canciones?.map(song => (
                            <li key={song.id} className="text-neutral-200 py-1 group/songitem"> {/* group para el botón de quitar canción */}
                              <div className="flex items-center justify-between mb-1">
                                <div className="flex-grow min-w-0 mr-2">
                                  <p className="text-sm truncate font-medium" title={song.nombre}>{song.nombre}</p>
                                  {song.artista && <p className="text-xs text-neutral-500 truncate">{song.artista}</p>}
                                </div>
                                <div className="flex items-center flex-shrink-0">
                                  {isSignedIn && ( // Botón de Like (corazón)
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleLikeClickInPlaylist(song); }}
                                      className="p-1 text-white hover:text-pink-500 transition-colors"
                                      aria-label={likedSongIds.has(song.id) ? "Quitar de Liked Songs" : "Agregar a Liked Songs"}
                                    >
                                      {likedSongIds.has(song.id) ? <HeartIconSolid className="w-4 h-4 text-pink-500" /> : <HeartIconOutline className="w-4 h-4" />}
                                    </button>
                                  )}
                                  {/* Botón para quitar canción de ESTA playlist (si no es "Liked Songs") */}
                                  {!isLikedSongsPlaylist && isSignedIn && (
                                    <button
                                      onClick={(e) => { e.stopPropagation(); handleRemoveSongFromPlaylist(playlist.playlist_id, song); }}
                                      className="p-1 text-neutral-400 hover:text-red-500 transition-colors ml-1 opacity-0 group-hover/songitem:opacity-100" // Aparece al hacer hover en el item de la canción
                                      title="Quitar de esta playlist"
                                    >
                                      <XMarkSmallIcon className="w-4 h-4" />
                                    </button>
                                  )}
                                </div>
                              </div>
                              <ManagedAudioPlayer controls src={song.pista} className="w-full h-7" preload="metadata">Your browser does not support the audio element.</ManagedAudioPlayer>
                            </li>
                          ))}
                           {(!playlist.canciones || playlist.canciones.length === 0) && (
                            <p className="text-sm text-neutral-500 text-center py-4">Esta playlist está vacía.</p>
                           )}
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