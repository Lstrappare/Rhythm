'use client';
import { useEffect, useState } from 'react';

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
  const [uploadMessage, setUploadMessage] = useState<string | null>(null);

  async function fetchSongs() {
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
  }, []);

  return(
    // El div principal del componente Songs.
    // Si el fondo general de la página es negro (o el color que uses para el fade), no necesitas `relative` aquí necesariamente,
    // a menos que otros elementos absolutos dentro de Songs dependan de él.
    <div>
      <div className="flex justify-between items-center m-3">
        {/* ... Botón de subida comentado ... */}
      </div>
      {uploadMessage && <p className="my-2 text-sm text-gray-400">{uploadMessage}</p>}

      {loading && <p>Loading songs... 🎧</p>}
      {error && <p className="text-red-400">Error loading songs: {error}</p>}
      
      {!loading && !error && songs.length === 0 && (
        <p>No songs found. Try uploading some sample songs.</p>
      )}

      {/* Contenedor para la lista de canciones y sus efectos de fade */}
      {/* Este div necesita ser 'relative' para que los spans de fade se posicionen correctamente */}
      <div className="relative">
        {!loading && !error && songs.length > 0 && (
          <>
            {/* Contenedor de canciones con scroll horizontal */}
            {/* Añadí clases opcionales para estilizar el scrollbar si tienes `tailwind-scrollbar` */}
            <div className="flex overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50
            max-h-100 overflow-y-auto
  [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-neutral-900
  [&::-webkit-scrollbar-thumb]:bg-neutral-800">
            
              {songs.map((song) => (
                <div 
                  key={song.id} 
                  className="flex-none w-50 sm:w-62 bg-sky-500/20 p-4 rounded-lg shadow-lg hover:bg-sky-800/60 transition"
                >
                  <div className='flex justify-center'>
                    <img 
                      src={song.foto} 
                      alt={`Cover of ${song["Nombre de la canción"]}`} 
                      className="w-11/12 h-1/2 object-cover rounded mb-3" 
                      onError={(e) => (e.currentTarget.src = 'https://via.placeholder.com/150?text=No+Image')}
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

            {/* Fades Laterales (Superposiciones) */}
            {/* Fade Izquierdo */}
            <span
              className="absolute left-0 top-0 bottom-0 w-24 pointer-events-none 
                         bg-gradient-to-r from-black to-transparent"
              // Ajusta 'from-black' al color de fondo real de tu sección/página.
              // 'w-24' (ancho del fade) puede ser ajustado (ej. w-16, w-20, w-32).
              // 'bottom-0' incluye el 'pb-4' del contenedor de scroll.
            />
            {/* Fade Derecho */}
            <span
              className="absolute right-0 top-0 bottom-0 w-24 pointer-events-none 
                         bg-gradient-to-l from-black to-transparent"
              // Ajusta 'from-black' y 'w-24' según necesites.
            />
          </>
        )}
      </div>
    </div>
  )
}