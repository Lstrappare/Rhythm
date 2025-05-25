import { UserButton} from "@clerk/nextjs";
import { Playwrite_MX } from "next/font/google";

const playwrite = Playwrite_MX ({
  weight: "400",
})


export default function HeaderUser () {
  return (
    <header className={`${playwrite.className} flex gap-2 items-end justify-between text-xl mx-4 md:mx-2 mt-4`}>
      What´s New?
      <UserButton />
    </header>
  )
}