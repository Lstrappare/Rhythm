// app/dashboards/components/ManagedAudioPlayer.tsx
'use client';
import React, { useRef } from 'react';
import { useAudioPlayer } from '@/app/contexts/AudioPlayerContext'; // Ajusta la ruta si es necesario

interface ManagedAudioPlayerProps extends React.AudioHTMLAttributes<HTMLAudioElement> {
  // Puedes añadir más props personalizadas si lo necesitas en el futuro
}

export default function ManagedAudioPlayer(props: ManagedAudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const { registerPlay } = useAudioPlayer();

  const handlePlay = () => {
    if (audioRef.current) {
      // Cuando este audio se reproduce, se lo "registra" en el contexto
      registerPlay(audioRef.current);
    }
  };

  return (
    <audio
      ref={audioRef}
      onPlay={handlePlay} // El evento onPlay se dispara cuando el audio comienza a reproducirse
      controls
      {...props} // Pasa todas las demás props (como src, className, preload, etc.)
    >
      Your browser does not support the audio element.
    </audio>
  );
}