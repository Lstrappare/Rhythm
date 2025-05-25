// app/api/songs/route.ts
import { NextResponse } from 'next/server';
import docClient from '@/lib/dynamodb'; // Ajusta la ruta si es necesario
import { BatchWriteCommand, ScanCommand } from '@aws-sdk/lib-dynamodb';

const TABLE_NAME = 'Canciones'; // El nombre de tu tabla en DynamoDB

// Tus JSON de canciones de ejemplo
// (Asegúrate de que las rutas de 'pista' y 'foto' sean correctas y los archivos existan en 'public/')
const songsToUpload = [
{
"id_cancion": 1,
"Nombre de la canción": "Cry baby",
"Álbum": "Wiped Out!",
"Género": "rock alternative",
"Año de publicación": "2015",
"Artista": "The Neighbourhood",
"Compositor": "Jesse Rutherford",
"Idioma": "Inglés",
"País de origen": "Estados Unidos",
"pista": "/songs/1. Cry Baby - The Neighbourhood.mp3",
"foto": "/img/CryBaby.png",
},
{
"id_cancion": 2,
"Nombre de la canción": "El señor de la noche",
"Álbum": "Los bandoleros reloaded",
"Género": "urbano latino",
"Año de publicación": "2006",
"Artista": "Don Omar",
"Compositor": "Don Omar",
"Idioma": "Español",
"País de origen": "Puerto Rico",
"pista": "/songs/2. El Señor de la Noche - Don Omar.mp3",
"foto": "/img/ElSeñor.png",
},
{
"id_cancion": 3,
"Nombre de la canción": "Las manos quietas",
"Álbum": "Soltero",
"Género": "electronic",
"Año de publicación": "1984",
"Artista": "Carlos Pérez",
"Compositor": "Carlos Pérez",
"Idioma": "Español",
"País de origen": "España",
"pista": "/songs/3. Las Manos Quietas - Carlos Pérez.mp3",
"foto": "/img/LasManos.png",
},
{
"id_cancion": 4,
"Nombre de la canción": "Save your tears",
"Álbum": "After Hours",
"Género": "rock",
"Año de publicación": "2020",
"Artista": "The Weeknd",
"Compositor": "Abel Tesfaye",
"Idioma": "inglés",
"País de origen": "Canadá",
"Pista": "/songs/4. Save Your Tears - The Weeknd.mp3",
"foto": "/img/Saveyour.png",
},
{
  "id_cancion": 5,
  "Nombre de la canción": "Down by the River",
  "Álbum": "Sadnecessary",
  "Género": "Folktrónica",
  "Año de publicación": 2013,
  "Artista": "Milky Chance",
  "Compositor": "Clemens Rehbein",
  "Idioma": "Inglés",
  "País de origen": "Alemania",
  "pista": "/songs/5. Down By The River - Milky Chance.mp3",
  "foto": "/img/Down.png"
},
{
  "id_cancion": 6,
  "Nombre de la canción": "Cornerstone",
  "Álbum": "Humbug",
  "Género": "Indie Rock",
  "Año de publicación": 2009,
  "Artista": "Arctic Monkeys",
  "Compositor": "Alex Turner",
  "Idioma": "Inglés",
  "País de origen": "Reino Unido",
  "pista": "/songs/6. Cornerstone - Arctic Monkeys.mp3",
  "foto": "/img/Cornerstone.png"
},
{
  "id_cancion": 7,
  "Nombre de la canción": "Circles",
  "Álbum": "Hollywood's Bleeding",
  "Género": "Pop rock",
  "Año de publicación": 2019,
  "Artista": "Post Malone",
  "Compositor": "Austin Post",
  "Idioma": "Inglés",
  "País de origen": "Estados Unidos",
  "pista": "/songs/7. Circles - Post Malone.mp3",
  "foto": "/img/Circles.png"
},
{
  "id_cancion": 8,
  "Nombre de la canción": "Where Are You Now",
  "Álbum": "All Stand Together",
  "Género": "Tropical house",
  "Año de publicación": 2021,
  "Artista": "Lost Frequencies y Calum Scott",
  "Compositor": "Felix de Laet",
  "Idioma": "Inglés",
  "País de origen": "Bélgica / Reino Unido",
  "pista": "/songs/8. Where Are You Now - Lost Frequencies.mp3",
  "foto": "/img/WhereAre.png"
},
{
  "id_cancion": 9,
  "Nombre de la canción": "Habits (Stay High) [Hippie Sabotage Remix]",
  "Álbum": "Truth Serum (EP)",
  "Género": "Electropop / Chillwave",
  "Año de publicación": 2014,
  "Artista": "Tove Lo",
  "Compositor": "Ebba Tove Elsa Nilsson",
  "Idioma": "Inglés",
  "País de origen": "Suecia",
  "pista": "/songs/9. Habits (Stay High Hippie Sabotage Remix) - Tove Lo.mp3",
  "foto": "/img/Habits.png"
},
{
  "id_cancion": 10,
  "Nombre de la canción": "Nunca Es Suficiente (versión cumbia)",
  "Álbum": "Esto Sí Es Cumbia",
  "Género": "Cumbia mexicana",
  "Año de publicación": 2018,
  "Artista": "Los Ángeles Azules ft. Natalia Lafourcade",
  "Compositor": "Natalia Lafourcade",
  "Idioma": "Español",
  "País de origen": "México",
  "pista": "/songs/10. Nunca es Suficiente - Los Angeles Azules & Natalia Lafourcade.mp3",
  "foto": "/img/Nunca.png"
},
{
    "id_cancion": 11,
    "Nombre de la canción": "Wanna Be Startin' Somethin'",
    "Álbum": "Thriller",
    "Género": "Post-disco, funk, Afropop",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Michael Jackson",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/11. Wanna Be Startin' Somethin' - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 12,
    "Nombre de la canción": "Baby Be Mine",
    "Álbum": "Thriller",
    "Género": "Post-disco, funk",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Rod Temperton",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/12. Baby Be Mine - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 13,
    "Nombre de la canción": "The Girl Is Mine",
    "Álbum": "Thriller",
    "Género": "Pop",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson y Paul McCartney",
    "Compositor": "Michael Jackson",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos / Reino Unido",
    "pista": "/songs/13. The Girl Is Mine - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 14,
    "Nombre de la canción": "Thriller",
    "Álbum": "Thriller",
    "Género": "Pop, funk",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Rod Temperton",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/14. Thriller - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 15,
    "Nombre de la canción": "Beat It",
    "Álbum": "Thriller",
    "Género": "Hard rock, dance-rock, funk rock",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Michael Jackson",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/15. Beat It - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 16,
    "Nombre de la canción": "Billie Jean",
    "Álbum": "Thriller",
    "Género": "Funk, dance-pop, R&B",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Michael Jackson",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/16. Billie Jean - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 17,
    "Nombre de la canción": "Human Nature",
    "Álbum": "Thriller",
    "Género": "Soft rock, R&B",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Steve Porcaro, John Bettis",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/17. Human Nature - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 18,
    "Nombre de la canción": "P.Y.T. (Pretty Young Thing)",
    "Álbum": "Thriller",
    "Género": "R&B, funk",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "James Ingram, Quincy Jones",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/18. P.Y.T. (Pretty Young Thing) - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  },
  {
    "id_cancion": 19,
    "Nombre de la canción": "The Lady in My Life",
    "Álbum": "Thriller",
    "Género": "Pop, soul, quiet storm",
    "Año de publicación": 1982,
    "Artista": "Michael Jackson",
    "Compositor": "Rod Temperton",
    "Idioma": "Inglés",
    "País de origen": "Estados Unidos",
    "pista": "/songs/19. The Lady in My Life - Michael Jackson.mp3",
    "foto": "/img/MichaelJackson.png"
  }
  // Agregar más rolas
];

/**
 * POST handler para subir canciones a DynamoDB.
 */
export async function POST() {
  const putRequests = songsToUpload.map(song => ({
    PutRequest: {
      Item: {
        "id": String(song.id_cancion), // Clave Primaria (String) para la tabla 'Canciones'
        "Nombre de la canción": song["Nombre de la canción"],
        "Álbum": song["Álbum"],
        "Género": song["Género"],
        "Año de publicación": song["Año de publicación"],
        "Artista": song["Artista"],
        "Compositor": song["Compositor"],
        "Idioma": song["Idioma"],
        "País de origen": song["País de origen"],
        "pista": song.pista,
        "foto": song.foto,
        "id_cancion_original": song.id_cancion // Guardamos el id numérico original si es útil
      }
    }
  }));

  if (putRequests.length === 0) {
    return NextResponse.json({ message: 'No songs to upload' }, { status: 400 });
  }

  // BatchWriteCommand puede manejar hasta 25 items.
  // Si tienes más, necesitarás dividirlos en múltiples lotes.
  const params = {
    RequestItems: {
      [TABLE_NAME]: putRequests.slice(0, 25) // Procesamos hasta 25 items
    }
  };

  try {
    await docClient.send(new BatchWriteCommand(params));
    // Si tienes más de 25 canciones, aquí deberías implementar la lógica para enviar los lotes restantes.
    return NextResponse.json({ message: `Successfully uploaded ${putRequests.length} songs!` });
  } catch (error) {
    console.error('Error uploading songs to DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error uploading songs', error: errorMessage }, { status: 500 });
  }
}

/**
 * GET handler para obtener todas las canciones desde DynamoDB.
 */
export async function GET() {
  const params = {
    TableName: TABLE_NAME,
  };

  try {
    const data = await docClient.send(new ScanCommand(params));
    return NextResponse.json(data.Items || []);
  } catch (error) {
    console.error('Error fetching songs from DynamoDB:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ message: 'Error fetching songs', error: errorMessage }, { status: 500 });
  }
}