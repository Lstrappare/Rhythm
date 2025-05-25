// app/dashboards/page.tsx
import { Comfortaa } from "next/font/google";
import Songs from "./components/Songs"; // Ajusta la ruta si es necesario
import Albums from "./components/Albums"; // Ajusta la ruta si es necesario
import Playlists from "./components/Playlists"; // Nuevo componente

const comfortaa = Comfortaa({
  weight: '400',
  subsets: ['latin']
});

export default function Dashboard() {
  return (
    <main className={`${comfortaa.className} text-xl`}>
      <section className="m-6 ">
        <h2 className="border-b-1 text-2xl font-semibold mb-4">Listen your playlists...</h2> {/* Título más grande */}
        <Playlists />
      </section>
      
      <section className="m-6">
          <h2 className="border-b-1 w-full text-2xl font-semibold mb-4">Discover new music...</h2>
          <Songs />
      </section>

      <section className="m-6">
        <h2 className="border-b-1 text-2xl font-semibold mb-4">Discover new albums...</h2>
        <Albums />
      </section>
    </main>
  )
}