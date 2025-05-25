import { Comfortaa } from "next/font/google";
import Songs from "./components/Songs";
import Albums from "./components/Albums";

const comfortaa = Comfortaa({
  weight: '400',
  subsets: ['latin']
});



export default function Dashboard() {


  return (
    <main className={`${comfortaa.className} text-xl`}>
      <section className="m-6 ">
        <h2 className="border-b-1">Listen your playlists...</h2>
      </section>
      
      <section className="m-6">
          <h2 className="border-b-1 w-full">Discover new music...</h2>
          <Songs />
      </section>

      <section className="m-6">
        <h2 className="border-b-1">Discover new albums...</h2>
        <Albums />
      </section>
    </main>
  )
}