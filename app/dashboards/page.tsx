import { Lato } from "next/font/google";
const lato = Lato({
  weight: '400',
  subsets: ['latin']
})


export default function Dashboard() {
  return (
    <main className={`${lato.className}`}>
      <section className="m-6">
        <h2 className="text-2xl border-b-1">Discover new music...</h2>
      </section>
    </main>
  )
}