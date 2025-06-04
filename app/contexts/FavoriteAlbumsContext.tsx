// app/contexts/FavoriteAlbumsContext.tsx
'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { useUser } from '@clerk/nextjs';

// Esta interfaz debe coincidir con lo que la API GET devuelve y POST espera para 'albumData'
export interface AlbumForFavoriteContext {
  id: string;
  nombre_album: string;
  artista: string;
  foto_portada: string;
  año_publicación: number; // Asegúrate que el tipo sea consistente
}

interface FavoriteAlbumsContextType {
  favoriteAlbumIds: Set<string>;
  favoriteAlbumsFullData: AlbumForFavoriteContext[]; // Para la tarjeta sintética
  toggleFavoriteAlbum: (albumData: AlbumForFavoriteContext) => Promise<void>;
  isLoadingFavorites: boolean;
  refetchFavoriteAlbums: () => void; // Función para refrescar
}

const FavoriteAlbumsContext = createContext<FavoriteAlbumsContextType | undefined>(undefined);

export const FavoriteAlbumsProvider = ({ children }: { children: ReactNode }) => {
  const { isSignedIn, user } = useUser();
  const [favoriteAlbumIds, setFavoriteAlbumIds] = useState<Set<string>>(new Set());
  const [favoriteAlbumsFullData, setFavoriteAlbumsFullData] = useState<AlbumForFavoriteContext[]>([]);
  const [isLoadingFavorites, setIsLoadingFavorites] = useState(true);

  const fetchUserFavoriteAlbums = useCallback(async () => {
    if (isSignedIn) {
      setIsLoadingFavorites(true);
      try {
        const response = await fetch('/api/me/favorite-albums'); // GET
        if (!response.ok) {
          if (response.status !== 404) console.error('Error fetching favorite albums:', response.statusText);
          setFavoriteAlbumIds(new Set()); setFavoriteAlbumsFullData([]); return;
        }
        const albums: AlbumForFavoriteContext[] = await response.json();
        setFavoriteAlbumsFullData(albums);
        setFavoriteAlbumIds(new Set(albums.map(a => a.id)));
      } catch (error) {
        console.error('Error fetching initial favorite albums:', error);
        setFavoriteAlbumIds(new Set()); setFavoriteAlbumsFullData([]);
      } finally { setIsLoadingFavorites(false); }
    } else {
      setFavoriteAlbumIds(new Set()); setFavoriteAlbumsFullData([]);
      setIsLoadingFavorites(false);
    }
  }, [isSignedIn]);

  useEffect(() => {
    fetchUserFavoriteAlbums();
  }, [user, fetchUserFavoriteAlbums]); // Re-fetch cuando el usuario cambie

  const toggleFavoriteAlbum = async (albumData: AlbumForFavoriteContext) => {
    if (!isSignedIn) { alert('Inicia sesión para guardar álbumes favoritos.'); return; }

    const currentlyFavorited = favoriteAlbumIds.has(albumData.id);
    const action = currentlyFavorited ? 'remove' : 'add';

    // Actualización optimista (opcional, pero bueno para UX)
    // Se puede omitir si `fetchUserFavoriteAlbums()` al final es suficiente
    setFavoriteAlbumIds(prevIds => { /* ... lógica optimista ... */ 
        const newIds = new Set(prevIds);
        if (action === 'remove') newIds.delete(albumData.id); else newIds.add(albumData.id);
        return newIds;
    });

    try {
      await fetch('/api/me/favorite-albums', { // POST
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ albumData, action }),
      });
      // Tras una acción exitosa, siempre re-obtener para asegurar consistencia
      fetchUserFavoriteAlbums(); 
    } catch (err) {
      console.error('Error en toggleFavoriteAlbum API:', err);
      // Revertir o simplemente re-obtener en caso de error
      fetchUserFavoriteAlbums(); 
      alert((err as Error).message || 'No se pudo actualizar tus álbumes favoritos.');
    }
  };

  return (
    <FavoriteAlbumsContext.Provider value={{ favoriteAlbumIds, favoriteAlbumsFullData, toggleFavoriteAlbum, isLoadingFavorites, refetchFavoriteAlbums: fetchUserFavoriteAlbums }}>
      {children}
    </FavoriteAlbumsContext.Provider>
  );
};

export const useFavoriteAlbums = () => { /* ... tu hook ... */ 
    const context = useContext(FavoriteAlbumsContext);
    if (context === undefined) throw new Error('useFavoriteAlbums debe usarse dentro de un FavoriteAlbumsProvider');
    return context;
};