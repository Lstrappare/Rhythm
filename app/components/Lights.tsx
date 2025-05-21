'use client'
import { useEffect, useState } from 'react';

export default function Lights() {
  const initialLights = [
    { id: 1, color: 'bg-red-400', visible: false },
    { id: 2, color: 'bg-amber-400', visible: false },
    { id: 3, color: 'bg-green-400', visible: false },
    { id: 4, color: 'bg-cyan-400', visible: false },
    { id: 5, color: 'bg-purple-400', visible: false },
  ];
  const [lights, setLights] = useState(initialLights);
  const [lightsToAnimate, setLightsToAnimate] = useState([...initialLights]);

  useEffect(() => {
    if (lightsToAnimate.length > 0) {
      const timer = setTimeout(() => {
        setLights(prevLights => {
          const updatedLights = [...prevLights];
          const indexToAnimate = updatedLights.findIndex(
            light => light.id === lightsToAnimate[0].id
          );
          if (indexToAnimate !== -1) {
            updatedLights[indexToAnimate].visible = true;
          }
          return updatedLights;
        });
        setLightsToAnimate(prev => prev.slice(1));
      }, 100); // Intervalo de 500 milisegundos entre cada encendido (ajusta esto)

      return () => clearTimeout(timer);
    }
  }, [lightsToAnimate]);

  // Define el orden de aparición: izquierda, derecha, siguiente izquierda, siguiente derecha, centro
  const orderedLights = [
    initialLights[1], // Izquierda
    initialLights[3], // Derecha
    initialLights[0], // Siguiente izquierda
    initialLights[4], // Siguiente derecha
    initialLights[2], // Centro
  ];

  useEffect(() => {
    setLightsToAnimate(orderedLights);
  }, []);

  return (
    <div className="absolute w-full p-6">
      <div className="flex justify-between items-center">
        {lights.map((light) => (
          <div
            key={light.id}
            className={`
              min-w-1/6 h-5 rounded-full
              ${light.color}
              transition-opacity duration-500 ease-in-out
              ${light.visible ? 'opacity-100' : 'opacity-0'}
            `}
          ></div>
        ))}
      </div>
    </div>
  );
}