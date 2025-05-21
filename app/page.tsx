import Options from "./components/Options";
import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";

import { Lato } from "next/font/google";
import { Codystar } from 'next/font/google'

const codystar = Codystar({
  weight: '400',
  subsets: ['latin'],
})

const latob = Lato({
  weight: '700',
  subsets: ['latin']
})

const lato = Lato({
  weight: '400',
  subsets: ['latin']
})

export default function Home() {
  return (
    <main>
      <section className={`mx-15 ${latob.className}`}>
        <h2 className={`my-6 text-xl`}>Hi! What do you want to do?</h2>
        <SignedOut>
          <Options />
        </SignedOut>
      </section>
        <SignedIn>
          <div className={`text-center m-4 ${lato} border-b-2 p-8`}>
            <Link 
            href="./dashboard"
            className="hover:text-sky-50/85 hover:underline text-xl flex gap-2 justify-center">
              You are already logged in, click here to continue
              <UserButton/>
            </Link>
          </div>
        </SignedIn>
      <section className="text-center my-10">
        <h3 className={`text-3xl ${codystar.className}`}>What is Rythm...</h3>
      </section>
    </main>
  );
}
