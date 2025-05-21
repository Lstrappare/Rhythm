import Link from "next/link";
import { Agu_Display } from "next/font/google";
import { SignInButton } from "@clerk/nextjs";

const agu_display = Agu_Display({
  weight: '400',
  subsets: ['latin'],
})

export default function Options() {
  // 1. Define tus opciones de navegación en un array de objetos
  const navItems = [
    { name: "Log in", href: "./dashboard", className: "" }, // Asegúrate de que los href sean correctos

  ];

  return (
    <nav className="flex justify-around gap-6">
      {/* 2. Usa .map() para renderizar cada Link 
      {navItems.map((item) => (

      ))}*/}
        <SignInButton mode="modal">
          <p className={`w-full h-full p-10 bg-sky-50/85 text-black text-center rounded-xl text-xl hover:bg-sky-50/50`}>
          Log in
          </p>
        </SignInButton>
               {/* <Link
            key={item.name} // Es importante usar una key única para cada elemento en una lista mapeada
            href={item.href}
            className={`w-full h-full p-10 bg-sky-50/85 text-black text-center rounded-xl text-xl hover:bg-sky-50/50`} // Combina tus clases de Tailwind
          >
            {item.name}
          </Link>*/}
    </nav>
  );
}