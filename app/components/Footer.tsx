import Link from "next/link";

export default function Footer () {
  return (
    <footer className="text-center text-sm text-gray-300/50 py-6 border-t mt-3">
      <p>
        © 2025 <Link href="https://portafoliojocis.netlify.app" className="hover:underline">José Manuel Cisneros.</Link> {' '}
        <span
          className="text-cyan-500/50"
        >
          MIT License
        </span>
      </p>
      <p>
        This project was developed for educational purposes only and is not intended for commercial use.
      </p>
      <p>
        Some audio content may be copyrighted and is used for demonstration only.
      </p>
      <p>
        Github: <Link href="https://github.com/Lstrappare/Rhythm.git" className="text-cyan-500/50 hover:underline">Rhythm</Link>
      </p>
    </footer>
  );
}