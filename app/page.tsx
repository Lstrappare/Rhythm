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
      <section className={`mx-15 text-center`}>
        <h2 className={`mt-6 text-xl ${latob.className}`}>Hi! do you want to listen to some music?</h2>
        <SignedOut>
          <div className={`border-b-2 pb-6`}>
            <Options />
          </div>
        </SignedOut>
          <SignedIn>
            <div className={`flex justify-center m-4 ${lato} border-b-2`}>
              <Link 
              href="./dashboard"
              className="hover:text-sky-50/85 hover:underline text-lg flex gap-2 justify-cente mb-4">
                You are already logged in, click here to continue
              </Link>
            </div>
          </SignedIn>
          <UserButton/>
        </section>
      <section className="text-center my-10">
        <h3 className={`text-3xl ${codystar.className}`}>What is Rhythm...</h3>
      </section>
    </main>
  );
}
