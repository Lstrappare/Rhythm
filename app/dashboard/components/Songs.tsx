// app/dashboards/components/Songs.tsx
'use client';
import { useEffect, useState, useMemo } from 'react'; // Añadir useMemo
import { useUser } from '@clerk/nextjs';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';
import { HeartIcon as HeartIconOutline } from '@heroicons/react/24/outline';
import { useLikedSongs, PlaylistSongData } from '@/app/contexts/LikedSongsContext'; // Ajusta la ruta
import ManagedAudioPlayer from './ManagedAudioPlayer';
// Tu interfaz Song existente
interface Song {
  id: string;
  "Nombre de la canción": string;
  "Álbum": string;
  "Género": string;
  "Año de publicación": string; // Este es string, para la búsqueda lo trataremos como tal
  "Artista": string;
  "Compositor": string;
  "Idioma": string;
  "País de origen": string;
  pista: string;
  foto: string;
  id_cancion_original?: number;
}

interface SongsProps { // Definir props para el componente
  searchTerm: string;
}

export default function Songs ({ searchTerm }: SongsProps) { // Recibir searchTerm como prop
  const [allSongs, setAllSongs] = useState<Song[]>([]); // Almacena todas las canciones cargadas
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isSignedIn } = useUser();
  const { likedSongIds, toggleLikeSong, isLoadingLikes } = useLikedSongs();

  useEffect(() => {
    async function fetchAllInitialSongs() { // Renombrada para claridad
      try {
        setLoading(true); setError(null);
        const response = await fetch('/api/songs');
        if (!response.ok) throw new Error((await response.json()).error || 'Failed to fetch songs');
        const data: Song[] = await response.json();
        setAllSongs(data); // Guardar todas las canciones aquí
      } catch (e) { setError((e as Error).message); }
      finally { setLoading(false); }
    }
    fetchAllInitialSongs();
  }, []); // Se ejecuta solo una vez al montar

  const handleLikeClick = (song: Song) => {
    const songDataForPlaylist: PlaylistSongData = {
      id: song.id,
      nombre: song["Nombre de la canción"],
      artista: song.Artista,
      album: song.Álbum,
      foto: song.foto,
      pista: song.pista,
    };
    toggleLikeSong(songDataForPlaylist);
  };

  // Filtrar canciones basado en searchTerm usando useMemo para eficiencia
  const filteredSongs = useMemo(() => {
    if (!searchTerm.trim()) {
      return allSongs; // Si no hay término de búsqueda, mostrar todas
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allSongs.filter(song =>
      song["Nombre de la canción"].toLowerCase().includes(lowerCaseSearchTerm) ||
      song.Artista.toLowerCase().includes(lowerCaseSearchTerm) ||
      song.Álbum.toLowerCase().includes(lowerCaseSearchTerm) ||
      song["Año de publicación"].toString().includes(lowerCaseSearchTerm) // Búsqueda por año
    );
  }, [allSongs, searchTerm]);


  if (loading || isLoadingLikes) {
    return <p className='text-center py-4'>Loading songs... 🎧</p>;
  }
  
  return(
    <div>
      {error && <p className="text-red-400 text-center py-4">Error loading songs: {error}</p>}
      <div className="relative">
        {(!loading && !error && filteredSongs.length === 0 && searchTerm) && (
           <p className="text-center text-neutral-400 py-4">No songs found for "{searchTerm}". Try a different search.</p>
        )}
        {(!loading && !error && allSongs.length === 0 && !searchTerm) && ( // Mensaje si no hay canciones en absoluto
           <p className="text-center text-neutral-400 py-4">No songs available at the moment.</p>
        )}

        {filteredSongs.length > 0 && ( // Mostrar solo si hay canciones filtradas
          <>
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 max-h-100 overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
              {/* Mostrar solo las primeras 10 canciones filtradas, o todas si son menos */}
              {filteredSongs.slice(0, 10).map((song) => (
                <div key={song.id} className="flex-none w-50 sm:w-62 bg-sky-500/20 p-4 rounded-lg shadow-lg relative group hover:bg-sky-500/30 transition">
                  {isSignedIn && (
                    <button
                      onClick={() => handleLikeClick(song)}
                      className="absolute top-2 right-2 z-10 p-1.5 bg-black/30 rounded-full text-white hover:bg-black/50 transition"
                      aria-label={likedSongIds.has(song.id) ? "Quitar de Liked Songs" : "Agregar a Liked Songs"}
                    >
                      {likedSongIds.has(song.id) ? (
                        <HeartIconSolid className="w-5 h-5 text-pink-500" />
                      ) : (
                        <HeartIconOutline className="w-5 h-5" />
                      )}
                    </button>
                  )}
                  <div className='flex justify-center'>
                    <img src={song.foto} alt={`Cover of ${song["Nombre de la canción"]}`} className="w-11/12 h-40 sm:h-48 object-cover rounded mb-3" onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/150?text=No+Image'; }} />
                  </div>
                  <h3 className="text-lg font-bold truncate" title={song["Nombre de la canción"]}>{song["Nombre de la canción"]}</h3>
                  <p className="text-sm text-gray-400 truncate" title={song.Artista}>{song.Artista}</p>
                  <p className="text-xs text-gray-500">{song.Álbum}</p>
                  <ManagedAudioPlayer controls src={song.pista} className="w-full mt-3 h-8" preload="metadata">Your browser does not support the audio element.</ManagedAudioPlayer>
                </div>
              ))}
            </div>
            {/* Fades Laterales */}
            <span className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none bg-gradient-to-r from-black/90 to-transparent"/>
            <span className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none bg-gradient-to-l from-black/90 to-transparent"/>
          </>
        )}
      </div>
    </div>
  )
}