// app/dashboards/components/CreatePlaylistModal.tsx
'use client';
import { useState, useEffect, FormEvent } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { XMarkIcon, CheckCircleIcon, MusicalNoteIcon, PlusIcon, MinusIcon } from '@heroicons/react/24/outline';
import { useUser } from '@clerk/nextjs';
import { PlaylistSongData, useLikedSongs } from '@/app/contexts/LikedSongsContext'; // Para tipo PlaylistSongData y potentially liked state

import { Lato } from 'next/font/google';

const lato = Lato ({
  weight: '400',
  subsets: ['latin'],
})


// Interfaz para las canciones como vienen de /api/songs
// Debería ser similar a la interfaz Song en tu componente Songs.tsx
interface SelectableSong {
  id: string; // ID único de la canción
  "Nombre de la canción": string;
  Artista: string;
  foto: string; // Para mostrar una miniatura
  pista: string; // Para la PlaylistSongData
  Álbum: string; // Para la PlaylistSongData
}


interface CreatePlaylistModalProps {
  isOpen: boolean;
  onClose: () => void;
  onPlaylistCreated?: () => void; // Callback para refrescar la lista de playlists
}

export default function CreatePlaylistModal({ isOpen, onClose, onPlaylistCreated }: CreatePlaylistModalProps) {
  const { isSignedIn, user } = useUser();
  const [playlistName, setPlaylistName] = useState('');
  const [availableSongs, setAvailableSongs] = useState<SelectableSong[]>([]);
  const [selectedSongs, setSelectedSongs] = useState<Map<string, PlaylistSongData>>(new Map());
  const [searchTerm, setSearchTerm] = useState('');
  const [loadingSongs, setLoadingSongs] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (isOpen) {
      // Cargar canciones disponibles cuando el modal se abre
      async function fetchAllSongs() {
        setLoadingSongs(true);
        try {
          const response = await fetch('/api/songs'); // Endpoint que devuelve todas las canciones
          if (!response.ok) throw new Error('Failed to fetch songs');
          const data: SelectableSong[] = await response.json();
          setAvailableSongs(data);
        } catch (error) {
          console.error("Error fetching songs for modal:", error);
          setAvailableSongs([]); // Manejar error
        } finally {
          setLoadingSongs(false);
        }
      }
      fetchAllSongs();
    } else {
      // Resetear estado cuando el modal se cierra
      setPlaylistName('');
      setSelectedSongs(new Map());
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleToggleSongSelection = (song: SelectableSong) => {
    const newSelectedSongs = new Map(selectedSongs);
    const songData: PlaylistSongData = { // Mapear SelectableSong a PlaylistSongData
      id: song.id,
      nombre: song["Nombre de la canción"],
      artista: song.Artista,
      album: song.Álbum,
      foto: song.foto,
      pista: song.pista,
    };

    if (newSelectedSongs.has(song.id)) {
      newSelectedSongs.delete(song.id);
    } else {
      newSelectedSongs.set(song.id, songData);
    }
    setSelectedSongs(newSelectedSongs);
  };

  const filteredSongs = availableSongs.filter(song =>
    song["Nombre de la canción"].toLowerCase().includes(searchTerm.toLowerCase()) ||
    song.Artista.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!playlistName.trim() || selectedSongs.size === 0 || !isSignedIn) {
      alert('Por favor, ingresa un nombre para la playlist y selecciona al menos una canción.');
      return;
    }
    setIsSaving(true);
    try {
      const response = await fetch('/api/playlists/create', { // Nuevo endpoint API
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nombre_playlist: playlistName,
          canciones: Array.from(selectedSongs.values()),
          // usuario_id se obtendrá del token en el backend
        }),
      });
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create playlist');
      }
      // Éxito
      if (onPlaylistCreated) onPlaylistCreated(); // Llama al callback para refrescar
      onClose(); // Cierra el modal
    } catch (error) {
      console.error("Error creating playlist:", error);
      alert((error as Error).message || 'No se pudo crear la playlist.');
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={onClose} // Cerrar al hacer clic en el fondo
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.7, opacity: 0 }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="bg-black/80 p-6 rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col text-white"
            onClick={(e) => e.stopPropagation()} // Evitar que el clic dentro del modal lo cierre
          >
            <div className={`flex justify-between items-center mb-4 ${lato.className}`}>
              <h2 className="text-xl font-semibold">Create New Playlist</h2>
              <button onClick={onClose} className="text-neutral-400 hover:text-white">
                <XMarkIcon className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className={`flex flex-col flex-grow min-h-0 ${lato.className}`}>
              <div className="mb-4">
                <label htmlFor="playlistName" className="block text-sm font-medium text-neutral-300 mb-1">
                  Name of Playlist
                </label>
                <input
                  type="text"
                  id="playlistName"
                  value={playlistName}
                  onChange={(e) => setPlaylistName(e.target.value)}
                  placeholder="My Playlist"
                  className="w-full bg-neutral-700/60 border border-neutral-600 rounded-md p-2 focus:ring-sky-500 focus:border-sky-500"
                  required
                />
              </div>

              <div className="mb-4">
                <input
                  type="text"
                  placeholder="Search songs for title or artist..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full bg-neutral-700/60 border border-neutral-600 rounded-md p-2 mb-2"
                />
              </div>
              
              <p className="text-sm text-neutral-400 mb-2">Select Songs ({selectedSongs.size} selected):</p>
              <div className="flex-grow overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-neutral-900 [&::-webkit-scrollbar-thumb]:bg-neutral-800 border border-neutral-700 rounded-md p-2 bg-neutral-900/50
                            scrollbar-thin scrollbar-thumb-neutral-600 scrollbar-track-neutral-700/50">
                {loadingSongs ? (
                  <p className="text-center text-neutral-400">Cargando canciones...</p>
                ) : filteredSongs.length > 0 ? (
                  <ul className="space-y-2">
                    {filteredSongs.map(song => (
                      <li
                        key={song.id}
                        className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors
                                    ${selectedSongs.has(song.id) ? 'bg-sky-600/30 hover:bg-sky-600/40' : 'hover:bg-neutral-700/60'}`}
                        onClick={() => handleToggleSongSelection(song)}
                      >
                        <div className="flex items-center space-x-3">
                          <img src={song.foto} alt={song["Nombre de la canción"]} className="w-10 h-10 rounded object-cover" />
                          <div>
                            <p className="font-medium text-sm truncate max-w-xs">{song["Nombre de la canción"]}</p>
                            <p className="text-xs text-neutral-400 truncate max-w-xs">{song.Artista}</p>
                          </div>
                        </div>
                        {selectedSongs.has(song.id) ? (
                          <CheckCircleIcon className="w-5 h-5 text-sky-400 flex-shrink-0" />
                        ) : (
                          <PlusIcon className="w-5 h-5 text-neutral-500 flex-shrink-0 group-hover:text-sky-400" />
                        )}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-center text-neutral-500">No se encontraron canciones o no hay disponibles.</p>
                )}
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={onClose}
                  disabled={isSaving}
                  className="px-4 py-2 text-sm rounded-md text-neutral-300 hover:bg-neutral-700 transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isSaving || !playlistName.trim() || selectedSongs.size === 0}
                  className="px-4 py-2 text-sm rounded-md bg-sky-600 hover:bg-sky-500 disabled:bg-neutral-600 disabled:text-neutral-400 disabled:cursor-not-allowed transition flex items-center"
                >
                  {isSaving ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Guardando...
                    </>
                  ) : (
                    "Crear Playlist"
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}