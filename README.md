<div align="center">
  <img src="https://github.com/user-attachments/assets/83f406c9-3d04-45d1-9534-9e9e2f30ed1a" alt="Rhythm App Banner" width="100%" />
  <h1>🎧 Rhythm</h1>
  <p>Una plataforma web para escuchar música, marcar tus canciones favoritas y crear playlists personalizadas.</p>
</div>

---

## 🚀 Tecnologías utilizadas

- [Next.js 15](https://nextjs.org/) — Framework React para SSR, rutas y layouts modernos.
- [Tailwind CSS](https://tailwindcss.com/) — Framework de estilos utilitario para diseño responsivo.
- [Clerk](https://clerk.dev/) — Plataforma de autenticación y gestión de usuarios.
- [AWS DynamoDB](https://aws.amazon.com/dynamodb/) — Base de datos NoSQL rápida y escalable.
- [Heroicons](https://heroicons.com/) — Conjunto de íconos SVG bonitos y accesibles.
- [Bun](https://bun.sh/) — Runtime moderno para JavaScript/TypeScript (reemplazo de Node.js).

---

## 🛠 Instalación

```bash
# Clona el repositorio
git clone https://github.com/Lstrappare/rhythm.git
cd rhythm

# Instala dependencias
bun install

# Ejecuta en desarrollo
bun dev
```

## 🔐 Variables de entorno
Crea un archivo .env con las siguientes variables:
```bash
# AWS Credentials
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_REGION=your_region

# Clerk Credentials
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_public_key
CLERK_SECRET_KEY=your_clerk_secret_key
```

## 📁 Estructura del proyecto
```bash
.rhythm/
├── app/                # Componentes, páginas y lógica principal
├── lib/                # Funciones auxiliares y utilidades
├── public/             # Recursos estáticos (imágenes, íconos)
├── .vscode/            # Configuración del editor
├── .env                # Variables de entorno
├── README.md           # Este archivo
├── package.json        # Scripts y dependencias
└── ...
```
## 🤝 ¿Quieres colaborar?
¡Claro que sí! Este proyecto está abierto a colaboración. Puedes:
- Reportar bugs o sugerencias.
- Proponer nuevas funcionalidades.
- Mejorar el diseño o rendimiento.
- Abrir un PR si ya tienes una mejora lista.

## 📬 Contacto
- Email: j.m.cisval1@gmail.com
- Portafolio: https://lstrappare.github.io/Portafolio
- LinkedIn: linkedin.com/in/josemanuel-cisneros

## 📄 Licencia
Este proyecto está bajo la licencia MIT. Puedes usarlo libremente siempre que respetes los términos de la licencia.

Consulta el archivo [LICENSE](./LICENSE) para más detalles.

## 📄 Licencias de dependencias

Este proyecto utiliza tecnologías de terceros, las cuales mantienen sus propias licencias de uso.  
Consulta sus sitios oficiales para más información.

- Next.js: MIT
- Tailwind CSS: MIT
- Clerk: Propietaria (gratis para uso limitado)
- AWS DynamoDB: Servicio bajo AWS (comercial)
- Heroicons: MIT
- Bun: MIT

## ¡Gracias por visitar Rhythm! 🎶
