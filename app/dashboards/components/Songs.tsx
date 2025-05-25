// app/dashboards/components/Songs.tsx
'use client';
import { useEffect, useState } from 'react';
import { useUser } from '@clerk/nextjs'; // Para obtener el usuario y verificar si está logueado
// Asumiendo que tienes un ícono de corazón (puedes usar SVGs o una librería de íconos)
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';

// Interfaz PlaylistSong (la misma que en la API)
interface PlaylistSong {
  id: string;
  nombre: string;
  artista: string;
  album: string;
  foto: string;
  pista: string;
}

// Tu interfaz Song existente
interface Song {
  id: string;
  "Nombre de la canción": string;
  "Álbum": string;
  "Género": string;
  "Año de publicación": string;
  "Artista": string;
  "Compositor": string;
  "Idioma": string;
  "País de origen": string;
  pista: string;
  foto: string;
  id_cancion_original?: number;
}

export default function Songs () {
  const [songs, setSongs] = useState<Song[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn, user } = useUser(); // Hook de Clerk

  // Estado para rastrear canciones likeadas en la UI (podrías obtener esto de la API al cargar)
  const [likedSongs, setLikedSongs] = useState<Set<string>>(new Set());

  // TODO: Al cargar, obtener las canciones likeadas del usuario para inicializar 'likedSongs'
  // Esto requeriría un endpoint GET para /api/playlists/liked-songs/manage o similar
  // que devuelva los IDs de las canciones en la playlist "Liked Songs" del usuario.
  // Por ahora, el estado de like solo persistirá visualmente durante la sesión
  // hasta que se implemente esa carga inicial.

  async function fetchSongs() {
    // ... tu función fetchSongs existente ...
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/songs');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setSongs(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchSongs();
    // Aquí podrías llamar a una función para obtener los IDs de las canciones likeadas del usuario
    // y actualizar el estado `likedSongs`.
  }, []);

  const handleLikeSong = async (song: Song) => {
    if (!isSignedIn) {
      alert('Por favor, inicia sesión para guardar tus canciones favoritas.');
      // Podrías redirigir al login o mostrar un modal de Clerk
      return;
    }

    const songDataForPlaylist: PlaylistSong = {
      id: song.id,
      nombre: song["Nombre de la canción"],
      artista: song.Artista,
      album: song.Álbum,
      foto: song.foto,
      pista: song.pista,
    };

    try {
      const response = await fetch('/api/playlists/liked-songs/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songDataForPlaylist),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Error al actualizar "Liked Songs"');
      }

      const result = await response.json();

      // Actualizar UI del corazón
      setLikedSongs(prevLiked => {
        const newLiked = new Set(prevLiked);
        if (result.action === 'added') {
          newLiked.add(song.id);
        } else {
          newLiked.delete(song.id);
        }
        return newLiked;
      });
      // alert(result.message); // O una notificación más sutil

    } catch (err) {
      console.error('Error al dar like:', err);
      alert((err as Error).message || 'Ocurrió un error.');
    }
  };


  return(
    <div>
      {/* ... (resto de tu JSX para loading, error, etc.) ... */}
      <div className="relative">
        {!loading && !error && songs.length > 0 && (
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 max-h-100 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
              {songs.map((song) => (
                <div 
                  key={song.id} 
                  className="flex-none w-50 sm:w-62 bg-sky-500/20 hover:bg-sky-500/30 p-4 rounded-lg shadow-lg relative group" // group para hover en botón
                >
                  {/* Botón de Like */}
                  {isSignedIn && (
                    <button
                      onClick={() => handleLikeSong(song)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/30 rounded-full text-white hover:bg-black/50 transition"
                      aria-label={likedSongs.has(song.id) ? "Quitar de Liked Songs" : "Agregar a Liked Songs"}
                    >
                      {likedSongs.has(song.id) ? (
                        <HeartIconSolid className="w-5 h-5 text-pink-500" />
                      ) : (
                        <HeartIconOutline className="w-5 h-5" />
                      )}
                    </button>
                  )}

                  <div className='flex justify-center'>
                    <img 
                      src={song.foto} 
                      alt={`Cover of ${song["Nombre de la canción"]}`} 
                      className="w-11/12 h-1/2 object-cover rounded mb-3" // Considera un aspect ratio o alto fijo
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }}
                    />
                  </div>
                  <h3 className="text-lg font-bold truncate" title={song["Nombre de la canción"]}>{song["Nombre de la canción"]}</h3>
                  <p className="text-sm text-gray-400 truncate" title={song.Artista}>{song.Artista}</p>
                  <p className="text-xs text-gray-500">{song.Álbum}</p>
                  <audio controls src={song.pista} className="w-full mt-3 h-8">
                    Your browser does not support the audio element.
                  </audio>
                </div>
              ))}
            </div>
            {/* Fades Laterales */}
            <span className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none bg-gradient-to-r from-black to-transparent"/>
            <span className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none bg-gradient-to-l from-black to-transparent"/>
          </>
        )}
      </div>
    </div>
  )
}