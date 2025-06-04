// app/contexts/AudioPlayerContext.tsx
'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface AudioPlayerContextType {
  // La función que se llamará cuando un audio empiece a sonar
  registerPlay: (audioElement: HTMLAudioElement) => void;
}

const AudioPlayerContext = createContext<AudioPlayerContextType | undefined>(undefined);

export const AudioPlayerProvider = ({ children }: { children: ReactNode }) => {
  // Este estado guardará una referencia al elemento <audio> que está sonando actualmente
  const [currentlyPlaying, setCurrentlyPlaying] = useState<HTMLAudioElement | null>(null);

  const registerPlay = (audioElement: HTMLAudioElement) => {
    // Si ya hay un audio sonando y no es el mismo que se acaba de presionar...
    if (currentlyPlaying && currentlyPlaying !== audioElement) {
      currentlyPlaying.pause(); // ...lo pausamos.
    }
    // Guardamos la referencia del nuevo audio que está sonando.
    setCurrentlyPlaying(audioElement);
  };

  return (
    <AudioPlayerContext.Provider value={{ registerPlay }}>
      {children}
    </AudioPlayerContext.Provider>
  );
};

// Hook personalizado para usar el contexto fácilmente en otros componentes
export const useAudioPlayer = () => {
  const context = useContext(AudioPlayerContext);
  if (context === undefined) {
    throw new Error('useAudioPlayer debe usarse dentro de un AudioPlayerProvider');
  }
  return context;
};