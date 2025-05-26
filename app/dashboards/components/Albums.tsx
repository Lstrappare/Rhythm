// app/dashboards/components/Albums.tsx
'use client';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion'; // Importar motion

interface AlbumSong {
  id_cancion: number;
  nombre: string;
  compositor: string;
  género: string;
  pista: string;
}

interface Album {
  id: string;
  nombre_album: string;
  artista: string;
  año_publicación: number;
  género: string;
  foto_portada: string;
  canciones: AlbumSong[];
  id_album_original?: number;
}

export default function Albums() {
  const [albums, setAlbums] = useState<Album[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedAlbums, setFlippedAlbums] = useState<Record<string, boolean>>({}); // Estado para las tarjetas volteadas

  // Función para manejar el volteo de una tarjeta
  const handleFlip = (albumId: string) => {
    setFlippedAlbums(prev => ({
      ...prev,
      [albumId]: !prev[albumId] // Invierte el estado de volteo para el álbum específico
    }));
  };

  async function fetchAlbums() {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/albums');
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      const data: Album[] = await response.json();
      setAlbums(data);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchAlbums();
  }, []);

  const handleUploadAlbums = async () => {
    // ... (tu función de subida de álbumes)
    try {
        const response = await fetch('/api/albums', { method: 'POST' });
        const result = await response.json();
        if (response.ok) {
            alert(result.message + " Refreshing albums list...");
            fetchAlbums();
        } else {
            alert(`Error uploading albums: ${result.message || 'Unknown error'}`);
        }
    } catch (uploadError) {
        alert(`Client-side error: ${(uploadError as Error).message}`);
    }
  };

  return (
    <div className="relative">
      <div className="text-right mb-3">
        {/* <button onClick={handleUploadAlbums}>Upload Sample Albums</button> */}
      </div>

      {loading && <p>Loading albums... 🎶</p>}
      {error && <p className="text-red-400">Error loading albums: {error}</p>}
      {!loading && !error && albums.length === 0 && (
        <p>No albums found. Try uploading some sample albums.</p>
      )}

      <div className="relative"> {/* Contenedor para fades laterales */}
        {!loading && !error && albums.length > 0 && (
          <>
            <div className="flex ml-2 overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50
              [&::-webkit-scrollbar]:w-2
  [&::-webkit-scrollbar-track]:bg-neutral-900
  [&::-webkit-scrollbar-thumb]:bg-neutral-800">
              {albums.slice(0, 10).map((album) => {
                const isFlipped = !!flippedAlbums[album.id];
                return (
                  // Contenedor de la tarjeta que define la perspectiva y maneja el clic
                  <div
                    key={album.id}
                    className="flex-none w-60 h-75 [perspective:1200px] cursor-pointer group" // Alto fijo para la tarjeta, perspectiva para el efecto 3D
                    onClick={() => handleFlip(album.id)}
                  >
                    {/* Elemento que realmente rota, usando Framer Motion */}
                    <motion.div
                      className="relative w-full h-full [transform-style:preserve-3d]"
                      initial={false} // No animar al cargar
                      animate={{ rotateY: isFlipped ? -180 : 0 }} // Animar rotateY basado en el estado isFlipped
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {/* Cara Frontal */}
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-lg 
                                   bg-gray-300/80 hover:bg-gray-100/90 p-4 flex flex-col" // Estilos de tu cara frontal
                      >
                        <div className='flex justify-center'>
                          <img
                            src={album.foto_portada}
                            alt={`Cover of ${album.nombre_album}`}
                            className="w-11/12 h-48 object-cover rounded"
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=No+Image'; }}
                          />
                        </div>
                        <div className='flex justify-center flex-col items-center mt-3'> {/* mt-auto para empujar al final si hay espacio */}
                          <h3 className="text-md text-center text-gray-700 font-semibold truncate w-full" title={album.nombre_album}>{album.nombre_album}</h3>
                          <p className="text-sm text-gray-600 truncate" title={album.artista}>{album.artista}</p>
                          <p className="text-xs text-gray-500">{album.año_publicación}</p>
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
                            e.stopPropagation(); // Evita que el clic en el botón voltee la tarjeta también
                            handleFlip(album.id);
                          }}
                          aria-label="Cerrar vista de canciones"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                        <h4 className="text-md font-semibold mb-1 text-center">{album.nombre_album}</h4>
                        <p className="text-xs text-neutral-400 mb-3 text-center">Tracks</p>
                        <ul className="space-y-3 flex-grow">
                          {album.canciones.map(song => (
                            <li key={song.id_cancion}>
                              <p className="text-sm text-neutral-200 truncate font-medium" title={song.nombre}>{song.nombre}</p>
                              <audio
                                controls
                                src={song.pista}
                                className="w-full h-8 mt-1"
                                // Considerar precargar 'metadata' para no cargar todo el audio al mostrar
                                // preload="metadata"
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

            {/* Fades Laterales (como los tenías) */}
            <span className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-r from-black to-transparent" />
            <span className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-l from-black to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}