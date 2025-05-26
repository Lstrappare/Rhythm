// app/dashboards/page.tsx
import { Comfortaa } from "next/font/google";
import Songs from "./components/Songs";
import Albums from "./components/Albums";
import Playlists from "./components/Playlists";
import { LikedSongsProvider } from '../contexts/LikedSongsContext'; // Ajusta la ruta

const comfortaa = Comfortaa({
  weight: '400',
  subsets: ['latin']
});

export default function Dashboard() {
  return (
    <LikedSongsProvider> {/* Envolver el contenido que necesita acceso al contexto */}
      <main className={`${comfortaa.className} text-xl`}>
        <section className="m-6 ">
          <h2 className="border-b-1 text-2xl font-semibold mb-4">Listen your Music & albums...</h2>
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
    </LikedSongsProvider>
  )
}