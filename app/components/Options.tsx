import { SignInButton, SignUpButton } from "@clerk/nextjs";

export default function Options() {

  return (
    <nav className="flex justify-around gap-6">
        <SignInButton mode="modal">
          <span className={`relative inline-block px-8 py-4 font-normal text-white rounded-lg cursor-pointer group text-sm mt-6`}>
            Sign in
            <span className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-b from-transparent via-[rgba(8,77,126,0.42)] to-[rgba(8,77,126,0.42)] backdrop-opacity-24 shadow-[inset_0_0_12px_rgba(151,200,255,0.44)]"></span>

            <span className="absolute inset-0 z-[-1] rounded-lg bg-gradient-to-b from-transparent via-[rgba(8,77,126,0.42)] to-[rgba(8,77,126,0.42)] backdrop-opacity-24 shadow-[inset_0_0_12px_rgba(151,200,255,0.44)] opacity-0 transition-all duration-300 ease-in group-hover:opacity-100"></span>


            <span className="absolute inset-0 z-[-1] rounded-lg [mask:linear-gradient(white,white)content-box,linear-gradient(white,white)] [mask-composite:xor] bg-gradient-to-r from-[rgba(0,0,0,0.32)] to-[rgba(255,55,55,0.32)]"></span>
          </span>
        </SignInButton>
    </nav>
  );
}