// app/dashboards/components/Albums.tsx
'use client';
import { useEffect, useState, useMemo } from 'react'; // Añadir useMemo
import { motion } from 'framer-motion';
import { XMarkIcon } from '@heroicons/react/24/outline'; // Para el botón de cerrar en la cara trasera

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
  año_publicación: number; // Number, se convertirá a string para búsqueda
  género: string;
  foto_portada: string;
  canciones: AlbumSong[];
  id_album_original?: number;
}

interface AlbumsProps { // Definir props para el componente
  searchTerm: string;
}

export default function Albums({ searchTerm }: AlbumsProps) { // Recibir searchTerm
  const [allAlbums, setAllAlbums] = useState<Album[]>([]); // Almacena todos los álbumes cargados
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [flippedAlbums, setFlippedAlbums] = useState<Record<string, boolean>>({});

  const handleFlip = (albumId: string) => {
    setFlippedAlbums(prev => ({
      ...prev,
      [albumId]: !prev[albumId]
    }));
  };

  useEffect(() => {
    async function fetchInitialAlbums() { // Renombrada para claridad
      try {
        setLoading(true);
        setError(null);
        const response = await fetch('/api/albums');
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        const data: Album[] = await response.json();
        setAllAlbums(data); // Guardar todos los álbumes aquí
      } catch (e) {
        setError((e as Error).message);
      } finally {
        setLoading(false);
      }
    }
    fetchInitialAlbums();
  }, []); // Se ejecuta solo una vez al montar

  // const handleUploadAlbums = async () => { ... }; // Tu función existente

  // Filtrar álbumes basado en searchTerm usando useMemo
  const filteredAlbums = useMemo(() => {
    if (!searchTerm.trim()) {
      return allAlbums; // Mostrar todos si no hay término de búsqueda
    }
    const lowerCaseSearchTerm = searchTerm.toLowerCase();
    return allAlbums.filter(album =>
      album.nombre_album.toLowerCase().includes(lowerCaseSearchTerm) ||
      album.artista.toLowerCase().includes(lowerCaseSearchTerm) ||
      album.año_publicación.toString().includes(lowerCaseSearchTerm) // Búsqueda por año
      // Podrías añadir búsqueda por género si lo deseas:
      // || album.género.toLowerCase().includes(lowerCaseSearchTerm)
    );
  }, [allAlbums, searchTerm]);

  if (loading) {
    return <p className='text-center py-4'>Loading albums... 🎶</p>;
  }

  return (
    <div className="relative">
      {/* <div className="text-right mb-3"> ... botón de upload ... </div> */}

      {error && <p className="text-red-400 text-center py-4">Error loading albums: {error}</p>}
      
      <div className="relative"> {/* Contenedor para fades laterales */}
        {(!loading && !error && filteredAlbums.length === 0 && searchTerm) && (
           <p className="text-center text-neutral-400 py-4">No albums found for "{searchTerm}".</p>
        )}
        {(!loading && !error && allAlbums.length === 0 && !searchTerm) && (
           <p className="text-center text-neutral-400 py-4">No albums available at the moment.</p>
        )}

        {filteredAlbums.length > 0 && (
          <>
            <div className="flex ml-2 overflow-x-auto space-x-6 pb-4 scrollbar-thin scrollbar-thumb-neutral-700 scrollbar-track-neutral-800/50 [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800">
              {/* Mostrar solo los primeros 10 álbumes filtrados, o todos si son menos */}
              {filteredAlbums.slice(0, 10).map((album) => {
                const isFlipped = !!flippedAlbums[album.id];
                return (
                  <div
                    key={album.id}
                    className="flex-none w-60 h-80 [perspective:1200px] cursor-pointer group" // Ajustado h-80
                    onClick={() => handleFlip(album.id)}
                  >
                    <motion.div
                      className="relative w-full h-full [transform-style:preserve-3d]"
                      initial={false}
                      animate={{ rotateY: isFlipped ? 180 : 0 }} // Corregido a 180 para flip estándar
                      transition={{ duration: 0.7, ease: "easeInOut" }}
                    >
                      {/* Cara Frontal */}
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] rounded-lg shadow-lg 
                                   bg-gray-300/80 hover:bg-gray-100/90 p-4 flex flex-col justify-between"
                      >
                        <div className='flex justify-center'>
                          <img
                            src={album.foto_portada}
                            alt={`Cover of ${album.nombre_album}`}
                            className="w-full h-48 object-cover rounded" // Ajustado w-full
                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = 'https://via.placeholder.com/240x240?text=No+Image'; }}
                          />
                        </div>
                        <div className='flex flex-col items-center mt-2 text-center'>
                          <h3 className="text-md text-gray-700 font-semibold truncate w-full" title={album.nombre_album}>{album.nombre_album}</h3>
                          <p className="text-sm text-gray-600 truncate w-full" title={album.artista}>{album.artista}</p>
                          <p className="text-xs text-gray-500">{album.año_publicación}</p>
                        </div>
                      </div>

                      {/* Cara Trasera */}
                      <div
                        className="absolute w-full h-full [backface-visibility:hidden] [transform:rotateY(180deg)] 
                                   bg-neutral-900 p-4 rounded-lg shadow-lg text-white 
                                   flex flex-col overflow-y-auto scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-neutral-600
                                     [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800"
                      >
                        <button
                          className="absolute top-2 right-2 text-neutral-300 hover:text-white z-20 p-1"
                          onClick={(e) => { e.stopPropagation(); handleFlip(album.id); }}
                          aria-label="Cerrar vista de canciones"
                        >
                          <XMarkIcon className="w-5 h-5" />
                        </button>
                        <h4 className="text-md font-semibold mb-1 text-center">{album.nombre_album}</h4>
                        <p className="text-xs text-neutral-400 mb-3 text-center">Tracks</p>
                        <ul className="space-y-2 flex-grow"> {/* Ajustado space-y-2 */}
                          {album.canciones.map(song => (
                            <li key={song.id_cancion} className="text-xs"> {/* Reducido tamaño de fuente para tracks */}
                              <p className="text-neutral-200 truncate font-medium" title={song.nombre}>{song.nombre}</p>
                              <audio controls src={song.pista} className="w-full h-7 mt-1" preload="metadata"> {/* Reducido h-7 */}
                                Your browser does not support the audio element.
                              </audio>
                            </li>
                          ))}
                           {(!album.canciones || album.canciones.length === 0) && (
                            <p className="text-sm text-neutral-500 text-center py-4">Este álbum no tiene canciones listadas.</p>
                           )}
                        </ul>
                      </div>
                    </motion.div>
                  </div>
                );
              })}
            </div>
            {/* Fades Laterales */}
            <span className="absolute left-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-r from-black/90 to-transparent" />
            <span className="absolute right-0 top-0 bottom-0 w-20 pointer-events-none bg-gradient-to-l from-black/90 to-transparent" />
          </>
        )}
      </div>
    </div>
  );
}