// app/contexts/LikedSongsContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

// Interfaz para los datos de la canción que se manejan en el contexto y la API de like
export interface PlaylistSongData { // Exporta para usarla en otros componentes
  id: string;
  nombre: string;
  artista: string;
  album: string;
  foto: string;
  pista: string;
}

interface LikedSongsContextType {
  likedSongIds: Set<string>;
  toggleLikeSong: (songData: PlaylistSongData) => Promise<void>;
  isLoadingLikes: boolean;
}

const LikedSongsContext = createContext<LikedSongsContextType | undefined>(undefined);

export const LikedSongsProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, user } = useUser(); // user object para re-fetch on user change
  const [likedSongIds, setLikedSongIds] = useState<Set<string>>(new Set());
  const [isLoadingLikes, setIsLoadingLikes] = useState(true);

  const fetchInitialLikedSongs = useCallback(async () => {
    if (isSignedIn) {
      setIsLoadingLikes(true);
      try {
        const response = await fetch('/api/playlists/liked-songs/manage'); // Llama al GET
        if (!response.ok) {
          // Si la playlist no existe (404), es normal, se tratará como vacía.
          // Para otros errores, loguea pero no rompas la app.
          if (response.status !== 404) {
            console.error('Error fetching liked songs status:', response.statusText);
          }
          setLikedSongIds(new Set()); // Default a vacío si no se puede cargar
          return;
        }
        const ids: string[] = await response.json();
        setLikedSongIds(new Set(ids));
      } catch (error) {
        console.error('Error fetching initial liked songs:', error);
        setLikedSongIds(new Set());
      } finally {
        setIsLoadingLikes(false);
      }
    } else {
      setLikedSongIds(new Set()); // Limpiar likes si el usuario cierra sesión
      setIsLoadingLikes(false);
    }
  }, [isSignedIn]); // Dependencia para re-ejecutar si cambia el estado de autenticación

  useEffect(() => {
    fetchInitialLikedSongs();
  }, [user, fetchInitialLikedSongs]); // Re-fetch cuando el objeto `user` cambie (login/logout)

  const toggleLikeSong = async (songData: PlaylistSongData) => {
    if (!isSignedIn) {
      alert('Por favor, inicia sesión para guardar tus canciones favoritas.');
      return;
    }

    const currentlyLiked = likedSongIds.has(songData.id);
    // Optimistic UI update
    setLikedSongIds(prevIds => {
      const newIds = new Set(prevIds);
      if (currentlyLiked) {
        newIds.delete(songData.id);
      } else {
        newIds.add(songData.id);
      }
      return newIds;
    });

    try {
      const response = await fetch('/api/playlists/liked-songs/manage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(songData),
      });

      if (!response.ok) {
        const errorResult = await response.json();
        throw new Error(errorResult.error || 'Error al actualizar "Liked Songs"');
      }
      // Podrías querer re-sincronizar con el resultado del backend si es necesario
      // const result = await response.json();
      // console.log("Like action result:", result);

    } catch (err) {
      console.error('Error en toggleLikeSong API call:', err);
      // Revert optimistic update on API error
      setLikedSongIds(prevIds => {
        const newIds = new Set(prevIds);
        if (currentlyLiked) { // Si el intento era quitar like y falló, lo volvemos a poner
          newIds.add(songData.id);
        } else { // Si el intento era dar like y falló, lo quitamos
          newIds.delete(songData.id);
        }
        return newIds;
      });
      alert((err as Error).message || 'Ocurrió un error al actualizar tus Me Gusta.');
    }
  };

  return (
    <LikedSongsContext.Provider value={{ likedSongIds, toggleLikeSong, isLoadingLikes }}>
      {children}
    </LikedSongsContext.Provider>
  );
};

export const useLikedSongs = () => {
  const context = useContext(LikedSongsContext);
  if (context === undefined) {
    throw new Error('useLikedSongs must be used within a LikedSongsProvider');
  }
  return context;
};